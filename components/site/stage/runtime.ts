/**
 * The stage's DOM runtime: reads the page's windows, cards, apertures and calm zones, decides
 * what the stage shows at this scroll position (compose.ts), drives poster mode directly in
 * the DOM and hands the same frame to the WebGL compositor once it is live.
 *
 * Framework-free: StageProvider creates one per page and disposes it on unmount.
 */
import { CALM_FEATHER, parseCalm, selectCalmRects, type CalmRect } from "./calm";
import {
  COVER_FREEZE,
  composeAt,
  coverFit,
  coverRatio,
  dominant,
  horizonInRect,
  mirrorFocal,
  pushIn,
  windowProgress,
  type Box,
  type Composition,
  type WindowBox,
} from "./compose";
import { isMotionPaused, subscribeMotionPaused } from "./pause";
import { PRELOAD_METADATA_AT, levelFor, type PreloadLevel } from "./preload";
import { focalFor } from "./focal";
import {
  downgrade,
  lowReason,
  pickTier,
  probeWebGL,
  readDeviceHints,
  type DeviceHints,
  type LowReason,
} from "./quality";
import {
  groundColor,
  isPlateId,
  type Focal,
  type Ground,
  type PlateFrame,
  type PlateId,
  type StageTier,
} from "./types";
import { isShipClass, type ShipClassSlug } from "./lines/classes";
import type { Compositor, CreateCompositor, FrameState, LayerState } from "./gl/contract";
import { heroProgress } from "./gl/hero/spring";

const WINDOW = "[data-stage-window]";
const FALLBACK_FRAME: PlateFrame = {
  focal: { x: 0.5, y: 0.5 },
  focalPhone: { x: 0.5, y: 0.5 },
  flipX: false,
  horizon: null,
  aspect: 16 / 9,
};
const CARD = "[data-stage-card]";

interface WindowEl {
  el: HTMLElement;
  plate: PlateId;
  ground: Ground;
  aperture: HTMLElement | null;
  lines: HTMLElement | null;
  pin: HTMLElement | null;
  horizon: boolean;
}

export interface RuntimeOptions {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  /** Fixed DOM layer with the chart frame and horizon hairline (may be absent). */
  frame: HTMLElement | null;
  /** Framing of the plates this page declared (StageProvider `plates`). */
  plates: Partial<Record<PlateId, PlateFrame>>;
  /** Loads the compositor chunk (dynamic import), so this module stays out of first-load JS. */
  load: () => Promise<CreateCompositor>;
}

/** `?stage=0` poster only, `?stage=1` live even on software GL; `?stagetier=high|medium|low`. */
function flags() {
  const q = new URLSearchParams(window.location.search);
  const s = q.get("stage");
  const t = q.get("stagetier");
  return {
    stage: s === "0" ? ("off" as const) : s === "1" ? ("on" as const) : null,
    tier: t === "high" || t === "medium" || t === "low" ? (t as StageTier) : null,
  };
}

/** Decide the tier: the hints, the WebGL probe and the URL flags. */
export function decideTier(): { tier: StageTier; why: LowReason | null } {
  const f = flags();
  if (f.stage === "off") return { tier: "low", why: "forced" };
  const hints: DeviceHints = readDeviceHints();
  if (f.stage === "on") {
    const gl = probeWebGL();
    if (!gl.webgl) return { tier: "low", why: "no-webgl" };
    return {
      tier:
        f.tier ??
        pickTier({ ...hints, reducedMotion: false, saveData: false, effectiveType: undefined }),
      why: null,
    };
  }
  const early = lowReason(hints);
  if (early) return { tier: "low", why: early };
  const gl = probeWebGL();
  const all = { ...hints, ...gl };
  const why = lowReason(all);
  if (why) return { tier: "low", why };
  return { tier: f.tier ?? pickTier(all), why: null };
}

/** Run `cb` once the LCP has been reported and the page is idle (§6.5). */
function afterLcpAndIdle(cb: () => void): () => void {
  let fired = false;
  let idle = 0;
  let timer = 0;
  let po: PerformanceObserver | null = null;
  const go = () => {
    if (fired) return;
    fired = true;
    po?.disconnect();
    if (typeof window.requestIdleCallback === "function")
      idle = window.requestIdleCallback(cb, { timeout: 2500 });
    else timer = window.setTimeout(cb, 600);
  };
  try {
    po = new PerformanceObserver((list) => {
      if (list.getEntries().length) go();
    });
    po.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {
    po = null;
  }
  // Browsers without LCP entries (Safari < 17, Firefox < 122): after load.
  const onLoad = () => window.setTimeout(go, 400);
  if (document.readyState === "complete") onLoad();
  else window.addEventListener("load", onLoad, { once: true });
  const cap = window.setTimeout(go, 5000);
  return () => {
    fired = true;
    po?.disconnect();
    window.removeEventListener("load", onLoad);
    window.clearTimeout(cap);
    if (idle) window.cancelIdleCallback(idle);
    if (timer) window.clearTimeout(timer);
  };
}

const hexRgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16) / 255,
  parseInt(hex.slice(3, 5), 16) / 255,
  parseInt(hex.slice(5, 7), 16) / 255,
];

/**
 * Whether every remote (Media library) video can be fetched with CORS — what WebGL needs to
 * draw it. Resolves once the response headers arrive (the body is not downloaded).
 */
function corsAllowed(srcs: string[], timeoutMs = 6000): Promise<boolean> {
  const one = (src: string) => {
    const ctl = new AbortController();
    const timer = window.setTimeout(() => ctl.abort(), timeoutMs);
    return fetch(src, { mode: "cors", credentials: "omit", cache: "no-store", signal: ctl.signal })
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        window.clearTimeout(timer);
        ctl.abort();
      });
  };
  return Promise.all(srcs.map(one)).then((ok) => ok.every(Boolean));
}

/** How the poster stage shows Media library footage: not at all, playing, or as a still. */
type DomVideo = "off" | "play" | "still";

export class StageRuntime {
  private windows: WindowEl[] = [];
  private cards: HTMLElement[] = [];
  private calm: HTMLElement[] = [];
  private layers = new Map<PlateId, HTMLElement>();
  /** How far each plate's nearest window is, in viewport heights (paintPoster). */
  private away = new Map<PlateId, number>();
  private calmEls: HTMLElement[] = [];
  private tide: HTMLElement | null;
  private horizon: HTMLElement | null;
  private frameRaf = 0;
  private scanRaf = 0;
  private disposed = false;
  private compositor: Compositor | null = null;
  private tier: StageTier = "low";
  private paused = false;
  private visible = true;
  private lastComp: Composition | null = null;
  private cancelBoot: (() => void) | null = null;
  /** Media library footage in the poster layers (plain <video>, CSS grade): see syncDomVideos. */
  private domVideo: DomVideo = "off";
  private corsProbe: Promise<boolean> | null = null;
  private dominantPlate: PlateId | null = null;
  private readonly cleanups: (() => void)[] = [];
  private readonly reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  private readonly portraitMq = window.matchMedia("(max-aspect-ratio: 4/5)");
  private readonly phoneMq = window.matchMedia("(max-width: 767px), (pointer: coarse)");

  constructor(private readonly o: RuntimeOptions) {
    this.tide = o.root.querySelector<HTMLElement>(".stage__tide");
    this.horizon = o.frame?.querySelector<HTMLElement>(".stage-frame__horizon") ?? null;
    o.root.querySelectorAll<HTMLElement>("[data-stage-layer]").forEach((el) => {
      const id = el.dataset.stageLayer;
      if (isPlateId(id)) this.layers.set(id, el);
    });
    this.calmEls = Array.from(o.root.querySelectorAll<HTMLElement>(".stage__calm > i"));
  }

  start() {
    const html = document.documentElement;
    html.dataset.stage = "poster";
    this.paused = isMotionPaused();
    this.scan();
    this.update();

    const onScroll = () => this.schedule();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    const ro = new ResizeObserver(() => this.scheduleScan());
    ro.observe(document.body);
    // Pages switch classes (ShipLines) and grounds without scrolling: follow the attributes.
    const mo = new MutationObserver((records) => {
      // Ignore the stage's own writes (root ground, rail colour).
      if (records.some((r) => !(r.target as Element).closest?.(".stage, .stage-rail")))
        this.scheduleScan();
    });
    mo.observe(document.body, {
      subtree: true,
      attributeFilter: ["data-class", "data-plate", "data-ground", "data-calm"],
    });
    const onVis = () => {
      this.visible = !document.hidden;
      this.syncRunning();
      this.syncDomVideos();
    };
    document.addEventListener("visibilitychange", onVis);
    const unsub = subscribeMotionPaused((p) => {
      this.paused = p;
      this.compositor?.setMotionPaused(p);
      this.syncRunning();
      this.syncDomVideos();
    });
    const onReduce = () => {
      if (!this.reduce.matches) return;
      // No autoplay with reduced motion: footage we play ourselves holds a still frame.
      if (this.domVideo === "play") this.domVideo = "still";
      this.goPoster("reduced-motion");
    };
    this.reduce.addEventListener("change", onReduce);
    this.cleanups.push(
      () => window.removeEventListener("scroll", onScroll),
      () => window.removeEventListener("resize", onScroll),
      () => ro.disconnect(),
      () => mo.disconnect(),
      () => document.removeEventListener("visibilitychange", onVis),
      unsub,
      () => this.reduce.removeEventListener("change", onReduce)
    );

    if (process.env.NODE_ENV !== "production")
      (window as unknown as { __stage?: StageRuntime }).__stage = this;

    const { tier, why } = decideTier();
    this.tier = tier;
    html.dataset.stageTier = tier;
    if (why) html.dataset.stageWhy = why;
    html.dataset.stageLines = "svg";
    if (tier !== "low") {
      // Media library links to other sites: ask now (in parallel with the LCP) whether
      // WebGL may draw them, so the stage never boots into a black plate.
      const remote = this.remoteSources();
      if (remote.length) this.corsProbe = corsAllowed(remote);
      this.cancelBoot = afterLcpAndIdle(() => void this.boot());
    } else if (why !== "save-data" && why !== "slow-network" && why !== "low-memory") {
      // A new clip without a poster still shows its first frame.
      this.domVideo = "still";
      this.syncDomVideos();
    }
  }

  dispose() {
    this.disposed = true;
    this.cancelBoot?.();
    if (this.frameRaf) cancelAnimationFrame(this.frameRaf);
    if (this.scanRaf) cancelAnimationFrame(this.scanRaf);
    this.cleanups.forEach((c) => c());
    this.compositor?.dispose();
    this.compositor = null;
    // Footage the runtime played itself (Media library fallback): stop decoding before unmount.
    for (const el of this.layers.values()) {
      el.querySelectorAll<HTMLVideoElement>(":scope > video").forEach((v) => {
        v.pause();
        v.removeAttribute("src");
        v.load();
        v.remove();
      });
    }
    const html = document.documentElement;
    delete html.dataset.stage;
    delete html.dataset.stageTier;
    delete html.dataset.stageWhy;
    delete html.dataset.stageLines;
  }

  // ---- boot / fall back ----------------------------------------------------

  private async boot() {
    if (this.disposed || this.tier === "low") return;
    if (this.corsProbe && !(await this.corsProbe)) {
      this.goDomVideo();
      return;
    }
    try {
      const create = await this.o.load();
      // The page may have gone to posters while the chunk loaded (reduced motion, media).
      if (this.disposed || (this.tier as StageTier) === "low") return;
      this.compositor = create({
        canvas: this.o.canvas,
        tier: this.tier,
        motionPaused: this.paused,
        onReady: () => this.goLive(),
        onDowngrade: () => this.stepDown(),
        onLost: () => this.goPoster("no-webgl"),
        onMediaError: (plate) => {
          // Footage from the Media library that WebGL cannot use: we play it ourselves.
          if (this.layers.get(plate)?.dataset.video) this.goDomVideo();
        },
      });
      document.documentElement.dataset.stageLines = this.lines3d() ? "3d" : "svg";
      this.update();
      this.syncRunning();
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.warn("[stage] compositor failed", err);
      this.goPoster("no-webgl");
    }
  }

  private lines3d() {
    return this.tier !== "low" && !this.phoneMq.matches;
  }

  private goLive() {
    if (this.disposed) return;
    this.o.root.dataset.mode = "live";
    document.documentElement.dataset.stage = "live";
  }

  private goPoster(why: LowReason) {
    this.compositor?.dispose();
    this.compositor = null;
    this.tier = "low";
    this.o.root.dataset.mode = "poster";
    const html = document.documentElement;
    html.dataset.stage = "poster";
    html.dataset.stageTier = "low";
    html.dataset.stageWhy = why;
    html.dataset.stageLines = "svg";
    this.update();
  }

  /** Media library URLs on this page's plates that live on another site. */
  private remoteSources(): string[] {
    const portrait = this.portraitMq.matches;
    const out: string[] = [];
    for (const el of this.layers.values()) {
      if (!("remote" in el.dataset)) continue;
      const src = (portrait && el.dataset.videoPhone) || el.dataset.video;
      if (src && /^https?:\/\//i.test(src)) out.push(src);
    }
    return out;
  }

  /**
   * The poster stage with Media library footage playing in plain <video> elements (no CORS
   * needed) under the CSS grade: for links to sites that do not let WebGL draw their files.
   */
  private goDomVideo() {
    if (this.disposed) return;
    this.domVideo = this.reduce.matches ? "still" : "play";
    this.goPoster("remote-media");
  }

  /**
   * Plays, holds or creates the poster layers' Media library footage: in "play" mode the
   * dominant plate plays (one decoder) while motion is allowed and the tab is visible; in
   * "still" mode clips without a poster show their first frame. A file that fails here too
   * is dropped: the poster (or the plain ground) stays — never a black plate.
   */
  private syncDomVideos() {
    if (this.domVideo === "off") return;
    for (const [id, el] of this.layers) {
      if (!el.dataset.video) continue;
      if (this.domVideo === "still" && !("noPoster" in el.dataset)) continue;
      const have = el.querySelector<HTMLVideoElement>(":scope > video");
      if (el.dataset.state === "off") {
        // Beyond the preload distance: free the decoder and the buffers (the §6.5 plan).
        if (have) {
          have.pause();
          have.removeAttribute("src");
          have.load();
          have.remove();
        }
        continue;
      }
      // On screen: auto; approaching: auto within 0.5 viewports, metadata within 1.5.
      const on = el.dataset.state === "a" || el.dataset.state === "b";
      const level: PreloadLevel = on ? "auto" : levelFor(this.away.get(id) ?? Infinity);
      const v = have ?? this.domVideoFor(el, level);
      if (!v) continue;
      if (this.domVideo === "play" && level === "auto" && v.preload !== "auto") v.preload = "auto";
      const play =
        this.domVideo === "play" &&
        id === this.dominantPlate &&
        !this.paused &&
        this.visible &&
        this.visibleWindow;
      if (play) {
        if (v.paused) void v.play().catch(() => undefined);
      } else if (!v.paused) v.pause();
    }
  }

  private domVideoFor(el: HTMLElement, level: PreloadLevel): HTMLVideoElement | null {
    if ("videoFailed" in el.dataset) return null;
    const src = (this.portraitMq.matches && el.dataset.videoPhone) || el.dataset.video;
    if (!src) return null;
    const v = document.createElement("video");
    v.muted = true;
    v.defaultMuted = true;
    v.loop = true;
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    v.setAttribute("muted", "");
    v.setAttribute("aria-hidden", "true");
    v.setAttribute("tabindex", "-1");
    v.disableRemotePlayback = true;
    v.preload = this.domVideo === "play" && level === "auto" ? "auto" : "metadata";
    v.addEventListener("loadeddata", () => (v.dataset.ready = ""));
    v.addEventListener("error", () => {
      el.dataset.videoFailed = "";
      v.remove();
    });
    // "still": the first frame (a media fragment), never played.
    v.src = this.domVideo === "still" ? `${src.split("#")[0]}#t=0.1` : src;
    el.appendChild(v);
    return v;
  }

  private stepDown() {
    const next = downgrade(this.tier);
    if (next === "low") {
      this.goPoster("forced");
      return;
    }
    this.tier = next;
    document.documentElement.dataset.stageTier = next;
    this.compositor?.setTier(next);
  }

  // ---- reading the page ----------------------------------------------------

  private scheduleScan() {
    if (!this.scanRaf)
      this.scanRaf = requestAnimationFrame(() => {
        this.scanRaf = 0;
        this.scan();
        this.update();
      });
  }

  private schedule() {
    if (!this.frameRaf)
      this.frameRaf = requestAnimationFrame(() => {
        this.frameRaf = 0;
        this.update();
      });
  }

  private scan() {
    this.windows = Array.from(document.querySelectorAll<HTMLElement>(WINDOW)).flatMap((el) => {
      const plate = el.dataset.plate;
      if (!isPlateId(plate)) return [];
      return [
        {
          el,
          plate,
          ground: el.dataset.ground === "light" ? "light" : "dark",
          aperture: el.querySelector<HTMLElement>("[data-stage-aperture]"),
          lines: el.querySelector<HTMLElement>("[data-stage-lines]"),
          pin: el.querySelector<HTMLElement>("[data-stage-pin]"),
          horizon: el.dataset.horizon !== "off",
        } satisfies WindowEl,
      ];
    });
    this.cards = Array.from(document.querySelectorAll<HTMLElement>(CARD));
    this.calm = Array.from(document.querySelectorAll<HTMLElement>(`${WINDOW} [data-calm]`));
  }

  // ---- the frame -----------------------------------------------------------

  private update() {
    if (this.disposed) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const boxes: WindowBox[] = [];
    const rects = this.windows.map((w) => {
      const r = w.el.getBoundingClientRect();
      boxes.push({ plate: w.plate, top: r.top, bottom: r.bottom });
      return r;
    });

    const cardBoxes: Box[] = this.cards.map((c) => c.getBoundingClientRect());
    // Scrub variables for page CSS (aperture growth, pinned scenes). All reads above, all
    // writes here; apertures and calm zones are read after, so they include this frame's CSS.
    this.windows.forEach((w, i) => writeProgress(w.el, rects[i].top, rects[i].bottom, vh));
    this.cards.forEach((c, i) => writeProgress(c, cardBoxes[i].top, cardBoxes[i].bottom, vh));

    const comp = composeAt(boxes, vh);
    this.lastComp = comp;
    const anyWindow = boxes.some((b) => b.bottom > 0 && b.top < vh);
    const covered = coverRatio(cardBoxes, vw, vh) >= COVER_FREEZE;
    this.visibleWindow = anyWindow && !covered;

    const calmRects = this.readCalm(vw, vh);
    const portrait = this.portraitMq.matches;
    const rtl = document.documentElement.dir === "rtl";

    const layer = (i: number): LayerState | null => {
      if (i < 0) return null;
      const w = this.windows[i];
      const r = rects[i];
      const def = this.frameOf(w.plate);
      const ap = w.aperture ? openingOf(w.aperture) : null;
      const lr = w.lines?.getBoundingClientRect() ?? null;
      const slug = w.lines?.dataset.class;
      const pr = w.pin?.getBoundingClientRect() ?? null;
      return {
        plate: w.plate,
        ground: hexRgb(
          groundColor(
            w.aperture
              ? w.aperture.dataset.apertureGround === "light"
                ? "light"
                : "dark"
              : w.ground
          )
        ),
        aperture: ap,
        zoom: pushIn(r.top, r.bottom, vh),
        dim: 0,
        focal: mirrorFocal(focalFor(def, { portrait, rtl }), def.flipX),
        lines:
          lr && isShipClass(slug)
            ? { x: lr.left, y: lr.top, w: lr.width, h: lr.height, slug: slug as ShipClassSlug }
            : null,
        pin: pr ? { x: pr.left + pr.width / 2, y: pr.top + pr.height / 2 } : null,
        scrolled: heroProgress(r.top, r.bottom - r.top, vh),
        rtl,
      };
    };

    const a = comp ? layer(comp.a) : null;
    const b = comp ? layer(comp.b) : null;
    // The outgoing plate darkens 15% as the next window rises over it (§7.1).
    if (a && b && comp) a.dim = 0.15 * (1 - comp.edge);

    this.paintPoster(comp, a, b, boxes, vh);
    this.paintCalm(calmRects);
    this.paintHorizon(comp, a, b, vw, vh);
    const ground = comp ? this.windows[dominant(comp)].ground : "dark";
    this.dominantPlate = comp ? this.windows[dominant(comp)].plate : null;
    // Only on change: the page's mutation observer watches data-ground.
    if (this.o.root.dataset.ground !== ground) this.o.root.dataset.ground = ground;

    if (this.compositor && comp && a) {
      const state: FrameState = { vw, vh, a, b, edge: comp.edge, calm: calmRects, near: boxes };
      this.compositor.setFrame(state);
    }
    this.syncRunning();
    this.syncDomVideos();
  }

  private visibleWindow = true;

  private frameOf(id: PlateId): PlateFrame {
    const f = this.o.plates[id];
    if (f) return f;
    if (process.env.NODE_ENV !== "production" && !this.warned.has(id)) {
      this.warned.add(id);
      console.warn(
        `[stage] plate ${id} is used by a window but missing from <StageProvider plates>`
      );
    }
    return FALLBACK_FRAME;
  }
  private warned = new Set<PlateId>();

  private syncRunning() {
    const c = this.compositor;
    if (!c) return;
    c.setRunning(this.visible && this.visibleWindow && !this.reduce.matches);
  }

  private readCalm(vw: number, vh: number): CalmRect[] {
    const rects: CalmRect[] = [];
    for (const el of this.calm) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -CALM_FEATHER || r.top > vh + CALM_FEATHER) continue;
      rects.push({ ...inkRect(el, r), k: parseCalm(el.dataset.calm) });
    }
    return selectCalmRects(rects, vw, vh);
  }

  /** Poster mode: show plate A, clip plate B below the tide edge, warm the next poster. */
  private paintPoster(
    comp: Composition | null,
    a: LayerState | null,
    b: LayerState | null,
    boxes: readonly WindowBox[],
    vh: number
  ) {
    const near = new Set<PlateId>();
    this.away.clear();
    for (const r of boxes) {
      const away = r.top >= vh ? (r.top - vh) / vh : r.bottom <= 0 ? -r.bottom / vh : 0;
      this.away.set(r.plate, Math.min(this.away.get(r.plate) ?? Infinity, away));
      if (away <= PRELOAD_METADATA_AT) near.add(r.plate);
    }
    for (const [id, el] of this.layers) {
      const isA = a?.plate === id;
      const isB = b?.plate === id;
      el.dataset.state = isA ? "a" : isB ? "b" : near.has(id) ? "near" : "off";
      const s = isA ? a : isB ? b : null;
      if (s) {
        el.style.setProperty("--zoom", s.zoom.toFixed(4));
        el.style.setProperty("--dim", s.dim.toFixed(3));
        el.style.setProperty("--fx", `${(s.focal.x * 100).toFixed(2)}%`);
        el.style.setProperty("--fy", `${(s.focal.y * 100).toFixed(2)}%`);
      }
      el.style.clipPath = isB && comp ? `inset(${(comp.edge * 100).toFixed(3)}% 0 0 0)` : "";
    }
    if (this.tide) {
      const show = !!(comp && b);
      this.tide.style.opacity = show ? "" : "0";
      if (show && comp)
        this.tide.style.transform = `translate3d(0, ${(comp.edge * vh).toFixed(1)}px, 0)`;
    }
    this.o.root.dataset.a = a?.plate ?? "";
    this.o.root.dataset.b = b?.plate ?? "";
  }

  /** Poster mode's calm zones: navy overlays at the shader's strength and feather. */
  private paintCalm(rects: readonly CalmRect[]) {
    this.calmEls.forEach((el, i) => {
      const r = rects[i];
      if (!r) {
        el.style.opacity = "0";
        return;
      }
      el.style.opacity = r.k.toFixed(3);
      el.style.transform = `translate3d(${r.x.toFixed(1)}px, ${r.y.toFixed(1)}px, 0)`;
      el.style.width = `${r.w.toFixed(1)}px`;
      el.style.height = `${r.h.toFixed(1)}px`;
    });
  }

  private paintHorizon(
    comp: Composition | null,
    a: LayerState | null,
    b: LayerState | null,
    vw: number,
    vh: number
  ) {
    const el = this.horizon;
    if (!el) return;
    const at = (s: LayerState | null, i: number): number | null => {
      if (!s || i < 0 || !this.windows[i].horizon) return null;
      const def = this.frameOf(s.plate);
      const rect = s.aperture ?? { x: 0, y: 0, w: vw, h: vh };
      const cover = coverFit(def.aspect, rect.w / Math.max(1, rect.h), s.focal as Focal, s.zoom);
      const y = horizonInRect(def.horizon, cover, rect.h);
      return y == null ? null : rect.y + y;
    };
    let y: number | null = null;
    if (comp) {
      const ya = at(a, comp.a);
      const yb = at(b, comp.b);
      if (ya != null && ya < comp.edge * vh) y = ya;
      else if (yb != null && yb > comp.edge * vh) y = yb;
    }
    if (y == null || y < 0 || y > vh) {
      el.style.opacity = "0";
      return;
    }
    el.style.opacity = "";
    el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
  }

  /** Lab and screenshots (development builds expose it as `window.__stage`). */
  debug() {
    return {
      tier: this.tier,
      mode: this.o.root.dataset.mode,
      composition: this.lastComp,
      plates: { a: this.o.root.dataset.a, b: this.o.root.dataset.b },
      info: this.compositor?.info() ?? null,
      setClock: (s: number | null) => this.compositor?.setClock(s),
      renderOnce: () => this.compositor?.renderOnce(),
    };
  }
}

/**
 * The box a calm zone needs: what the element draws — the union of its line and inline boxes
 * (Range.getClientRects) — inside its own box. A heading wrapped inside a wide max-width leaves
 * empty plate beside its lines, and a zone round the whole box would darken it for nothing.
 */
function inkRect(el: HTMLElement, box: DOMRect): { x: number; y: number; w: number; h: number } {
  // Text only: a Range over the whole element also returns the border boxes of the elements
  // inside it, and a heading split into block-level line spans (the homepage's rising letters)
  // would then shade the full width of its max-width, plate beside the lines included.
  const range = document.createRange();
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let l = Infinity;
  let t = Infinity;
  let r = -Infinity;
  let b = -Infinity;
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    if (!n.nodeValue?.trim()) continue;
    const parent = n.parentElement;
    if (!parent) continue;
    const pr = parent.getBoundingClientRect();
    if (pr.width < 2 || pr.height < 2) continue; // visually hidden (sr-only) text
    range.selectNodeContents(n);
    for (const q of range.getClientRects()) {
      if (q.width < 1 || q.height < 2) continue;
      l = Math.min(l, q.left);
      t = Math.min(t, q.top);
      r = Math.max(r, q.right);
      b = Math.max(b, q.bottom);
    }
  }
  l = Math.max(l, box.left);
  t = Math.max(t, box.top);
  r = Math.min(r, box.right);
  b = Math.min(b, box.bottom);
  if (!(r > l && b > t)) return { x: box.left, y: box.top, w: box.width, h: box.height };
  return { x: l, y: t, w: r - l, h: b - t };
}

/**
 * The opening of an aperture: its box minus its border. Pages that reshape an opening with the
 * scroll may keep the box still and grow a ground-coloured border instead of moving the box —
 * no layout shift — so the plate is drawn inside the border, with the inner corner radius.
 */
function openingOf(el: HTMLElement): { x: number; y: number; w: number; h: number; r: number } {
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const bt = parseFloat(cs.borderTopWidth) || 0;
  const br = parseFloat(cs.borderRightWidth) || 0;
  const bb = parseFloat(cs.borderBottomWidth) || 0;
  const bl = parseFloat(cs.borderLeftWidth) || 0;
  // "28px" or "40px 60px" (horizontal, vertical): the inner radius on the narrower side.
  const [rx, ry = rx] = cs.borderTopLeftRadius.split(" ").map((v) => parseFloat(v) || 0);
  return {
    x: r.left + bl,
    y: r.top + bt,
    w: Math.max(0, r.width - bl - br),
    h: Math.max(0, r.height - bt - bb),
    r: Math.max(0, Math.min(rx - bl, ry - bt)),
  };
}

/** Last values written per element: unchanged ones are skipped (inherited custom properties
 * invalidate the whole subtree, and far-away sections sit at 0 or 1 anyway). */
const written = new WeakMap<HTMLElement, string>();

function writeProgress(el: HTMLElement, top: number, bottom: number, vh: number) {
  const p = windowProgress(top, bottom, vh);
  const v = [p.in, p.out, p.pin, p.through].map((n) => n.toFixed(4));
  const key = v.join(" ");
  if (written.get(el) === key) return;
  written.set(el, key);
  el.style.setProperty("--stage-in", v[0]);
  el.style.setProperty("--stage-out", v[1]);
  el.style.setProperty("--stage-pin", v[2]);
  el.style.setProperty("--stage-through", v[3]);
}
