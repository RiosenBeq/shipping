/**
 * The stage compositor (DESIGN-V2 §6): one WebGL2 canvas, three.js r187, video plates from
 * lib/media.ts and the procedural plates through one lens. Loaded with a dynamic import after
 * the LCP and an idle callback (runtime.ts), so none of this is in the page's first-load JS.
 *
 * Passes per frame (≤ 6 draw calls): bathy target · lines target · flowmap · lens.
 */
import {
  BufferAttribute,
  BufferGeometry,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  SRGBColorSpace,
  NoColorSpace,
  Texture,
  VideoTexture,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { videos, type GradePreset } from "@/lib/media";
import { packCalm } from "../calm";
import { coverFit, mirrorFocal } from "../compose";
import { GRADES } from "../grades";
import { PLATES } from "../plates";
import { pickVideoFile, preloadPlan, type PreloadLevel } from "../preload";
import { FpsGovernor, renderDpr, tierFeatures } from "../quality";
import { isVideoPlate, type PlateId, type StageTier, type VideoPlateId } from "../types";
import { createBathyMaterial } from "./bathy";
import type { Compositor, CompositorOptions, FrameState, LayerState } from "./contract";
import { Flowmap } from "./flowmap";
import { createLensMaterial, type LayerUniform } from "./lens";
import { LinesPlate, raw } from "./lines";

const RANK: Record<PreloadLevel, number> = { none: 0, metadata: 1, auto: 2 };

/** True for an absolute URL (Media library links): WebGL needs that site's CORS consent. */
const isRemote = (src: string) => /^https?:\/\//i.test(src);

/**
 * One <video> per video plate on the page; only the dominant one ever plays. Files come from
 * lib/media.ts with the Media library applied, so a plate may play an upload or a link to a
 * file on another site: those load with crossOrigin="anonymous" (a WebGL texture must not be
 * tainted). If the file cannot be loaded that way (no CORS consent, 404, unsupported codec),
 * `onError` tells the runtime, which hands the plate to a plain <video> under a CSS grade.
 */
class VideoSource {
  readonly el: HTMLVideoElement;
  readonly tex: VideoTexture;
  readonly file: NonNullable<ReturnType<typeof pickVideoFile>>;
  level: PreloadLevel = "none";
  ready = false;
  failed = false;
  private wantPlay = false;

  constructor(
    readonly plate: VideoPlateId,
    tier: StageTier,
    host: HTMLElement,
    private readonly onFrame: () => void,
    onError: (plate: VideoPlateId) => void
  ) {
    const v = videos[PLATES[plate].slot!];
    this.file = pickVideoFile(v, tier, {
      width: window.innerWidth,
      height: window.innerHeight,
    }) ?? {
      src: v.mp4_720,
      width: 1280,
      height: 720,
      portrait: false,
    };
    const el = document.createElement("video");
    el.muted = true;
    el.defaultMuted = true;
    el.loop = true;
    el.playsInline = true;
    el.setAttribute("playsinline", "");
    el.setAttribute("muted", "");
    el.setAttribute("aria-hidden", "true");
    el.setAttribute("tabindex", "-1");
    el.disableRemotePlayback = true;
    el.preload = "none";
    el.crossOrigin = "anonymous";
    host.appendChild(el);
    this.el = el;
    this.tex = new VideoTexture(el);
    this.tex.colorSpace = NoColorSpace;
    this.tex.minFilter = LinearFilter;
    this.tex.magFilter = LinearFilter;
    const mark = () => {
      if (el.readyState < 2) return;
      this.tex.needsUpdate = true;
      if (!this.ready) {
        this.ready = true;
        this.onFrame();
      }
    };
    el.addEventListener("loadeddata", mark);
    el.addEventListener("seeked", mark);
    // The real frame size (Media library files are not probed at build time).
    el.addEventListener("loadedmetadata", () => {
      if (el.videoWidth > 0 && el.videoHeight > 0) {
        this.file.width = el.videoWidth;
        this.file.height = el.videoHeight;
      }
    });
    el.addEventListener("error", () => {
      if (this.failed || !el.getAttribute("src")) return;
      this.failed = true;
      this.wantPlay = false;
      onError(plate);
    });
    if ("requestVideoFrameCallback" in el) el.requestVideoFrameCallback(() => mark());
    // Autoplay can be refused (iOS low power): the still first frame is still drawn.
    el.addEventListener("pause", () => {
      if (this.wantPlay && !document.hidden) void el.play().catch(() => undefined);
    });
  }

  setLevel(l: PreloadLevel) {
    if (this.failed || RANK[l] <= RANK[this.level]) return;
    this.level = l;
    this.el.preload = l;
    if (!this.el.src) this.el.src = this.file.src;
    if (l === "auto") this.el.load();
  }

  play() {
    if (this.failed) return;
    this.setLevel("auto");
    this.wantPlay = true;
    if (this.el.paused) void this.el.play().catch(() => undefined);
  }

  pause() {
    this.wantPlay = false;
    if (!this.el.paused) this.el.pause();
  }

  dispose() {
    this.pause();
    this.tex.dispose();
    this.el.removeAttribute("src");
    this.el.load();
    this.el.remove();
  }
}

function fullscreenTriangle() {
  const g = new BufferGeometry();
  g.setAttribute(
    "position",
    new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3)
  );
  return g;
}

export const createCompositor = (o: CompositorOptions): Compositor => {
  const canvas = o.canvas;
  let tier = o.tier;
  let motionPaused = o.motionPaused;
  const renderer = new WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    powerPreference: tier === "high" ? "high-performance" : "default",
  });
  renderer.autoClear = true;
  const navy = raw(0x051624);
  renderer.setClearColor(navy, 1);
  renderer.info.autoReset = false;
  renderer.outputColorSpace = SRGBColorSpace;

  const tri = fullscreenTriangle();
  const ortho = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const canFlow =
    renderer.extensions.has("EXT_color_buffer_float") ||
    renderer.extensions.has("EXT_color_buffer_half_float");
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const flow = canFlow ? new Flowmap(tri) : null;
  const lens = createLensMaterial(flow?.texture ?? null);
  const lensMesh = new Mesh(tri, lens);
  lensMesh.frustumCulled = false;
  const bathyMat = createBathyMaterial();
  const bathyMesh = new Mesh(tri, bathyMat);
  bathyMesh.frustumCulled = false;
  const lines = new LinesPlate();
  const rtOpts = { depthBuffer: false, minFilter: LinearFilter, magFilter: LinearFilter };
  const bathyRT = new WebGLRenderTarget(1, 1, rtOpts);
  const linesRT = new WebGLRenderTarget(1, 1, rtOpts);

  const host = document.createElement("div");
  host.className = "stage__decoders";
  canvas.parentElement?.appendChild(host);
  const sources = new Map<VideoPlateId, VideoSource>();
  const posters = new Map<
    PlateId,
    { tex: Texture; aspect: number; portrait: boolean } | "loading" | "failed"
  >();
  let levels = new Map<PlateId, PreloadLevel>();

  let state: FrameState | null = null;
  let running = false;
  let raf = 0;
  let pendingRender = 0;
  let readySent = false;
  let disposed = false;
  let lastT = 0;
  let clockOverride: number | null = null;
  let clock = 0;
  let surfaced = false;
  let pointer: { x: number; y: number } | null = null;
  let bump = 0;
  let playing: PlateId | null = null;
  const governor = new FpsGovernor();
  let warm = 0;
  let size = { w: 0, h: 0, dpr: 1 };

  const portraitScreen = () => window.innerHeight > window.innerWidth && window.innerWidth < 768;

  function source(p: VideoPlateId) {
    let s = sources.get(p);
    if (!s) {
      s = new VideoSource(
        p,
        tier,
        host,
        () => requestRender(),
        (plate) => o.onMediaError?.(plate)
      );
      sources.set(p, s);
    }
    return s;
  }

  function poster(p: PlateId) {
    const cur = posters.get(p);
    if (cur === "failed") return null;
    if (cur && cur !== "loading") return cur;
    const def = PLATES[p];
    if (cur === "loading" || !def.poster) return null;
    posters.set(p, "loading");
    const portrait = portraitScreen() && !!def.poster.webpPortrait;
    const img = new Image();
    img.decoding = "async";
    const src = portrait ? def.poster.webpPortrait! : def.poster.webp;
    // A poster on another site may only become a texture with that site's CORS consent.
    if (isRemote(src)) img.crossOrigin = "anonymous";
    img.onerror = () => posters.set(p, "failed");
    img.src = src;
    img.onload = () => {
      if (disposed) return;
      const tex = new Texture(img);
      tex.colorSpace = NoColorSpace;
      tex.minFilter = LinearFilter;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;
      posters.set(p, { tex, aspect: img.naturalWidth / img.naturalHeight, portrait });
      requestRender();
    };
    return null;
  }

  function resize() {
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    const dpr = renderDpr(w, h, window.devicePixelRatio || 1, tier);
    if (w === size.w && h === size.h && dpr === size.dpr) return;
    size = { w, h, dpr };
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    const bw = Math.round(w * dpr);
    const bh = Math.round(h * dpr);
    bathyRT.setSize(bw, bh);
    linesRT.setSize(bw, bh);
  }

  /** CSS rect (top-left origin) → buffer px, bottom-left origin. */
  function toBuffer(x: number, y: number, w: number, h: number) {
    const d = size.dpr;
    return [x * d, (size.h - (y + h)) * d, w * d, h * d] as const;
  }

  function setGrade(u: LayerUniform, preset: GradePreset, levels: readonly [number, number]) {
    const g = GRADES[preset];
    const e = u.tone.elements;
    e[0] = g.shadow[0];
    e[1] = g.shadow[1];
    e[2] = g.shadow[2];
    e[3] = g.mid[0];
    e[4] = g.mid[1];
    e[5] = g.mid[2];
    e[6] = g.highlight[0];
    e[7] = g.highlight[1];
    e[8] = g.highlight[2];
    u.sce.set(g.split, g.chroma, g.exposure);
    u.levels.set(levels[0], levels[1]);
  }

  function applyLayer(u: LayerUniform, s: LayerState, texKey: "uTexA" | "uTexB") {
    const def = PLATES[s.plate];
    const rect = s.aperture ?? { x: 0, y: 0, w: size.w, h: size.h, r: 0 };
    const [rx, ry, rw, rh] = toBuffer(rect.x, rect.y, rect.w, rect.h);
    u.rect.set(rx, ry, Math.max(1, rw), Math.max(1, rh));
    u.radius = (s.aperture?.r ?? 0) * size.dpr;
    u.hasAperture = s.aperture ? 1 : 0;
    u.ground.set(s.ground[0], s.ground[1], s.ground[2]);
    u.dim = s.dim;
    u.flipX = 0;
    u.graded = 0;
    u.screen = 0;
    u.kind = 0;
    let tex: Texture | null = null;
    let aspect = def.aspect;
    let focal = s.focal;

    if (isVideoPlate(s.plate)) {
      const src = source(s.plate);
      const v = videos[def.slot!];
      if (src.ready) {
        tex = src.tex;
        aspect = src.file.width / src.file.height;
        // `s.focal` is already in the mirrored frame when the plate is flipX.
        if (src.file.portrait) focal = mirrorFocal(def.focalPhone, def.flipX);
        u.flipX = def.flipX ? 1 : 0;
        // Media library "none" (testing other clips): the footage in its own colours.
        if (!v.look.ungraded) {
          u.graded = 1;
          setGrade(u, v.look.grade, v.look.levels);
        }
      } else {
        const p = poster(s.plate);
        if (p) {
          tex = p.tex;
          aspect = p.aspect;
          // Graded posters of flipX clips are already mirrored, like `s.focal`.
          if (p.portrait) focal = mirrorFocal(def.focalPhone, def.flipX);
          // A poster the build did not grade (Media library): grade it here like the video.
          const css = def.poster?.css;
          if (css) {
            u.graded = 1;
            setGrade(u, css, [0, 1]);
          }
        }
      }
    } else if (s.plate === "P-bathy") {
      tex = bathyRT.texture;
      u.screen = 1;
    } else if (s.plate === "P-lines") {
      tex = linesRT.texture;
      u.screen = 1;
    }
    if (tex) {
      u.kind = 1;
      const c = coverFit(aspect, rw / Math.max(1, rh), focal, s.zoom);
      u.cover.set(c.sx, c.sy, c.ox, c.oy);
      lens.uniforms[texKey].value = tex;
    } else {
      lens.uniforms[texKey].value = null;
      // Nothing to draw yet: the ground colour of the plate (navy) rather than a black hole.
      if (s.plate !== "none") u.ground.set(5 / 255, 22 / 255, 36 / 255);
    }
    return tex !== null;
  }

  function layerReady(s: LayerState) {
    if (isVideoPlate(s.plate)) return source(s.plate).ready;
    return true;
  }

  function schedule() {
    if (!state) return;
    const plan = preloadPlan(
      state.near,
      state.vh,
      [state.a.plate, ...(state.b ? [state.b.plate] : [])],
      levels
    );
    levels = plan;
    for (const [p, l] of plan) if (isVideoPlate(p) && l !== "none") source(p).setLevel(l);
    // One decoder: the plate covering more of the screen plays, every other one holds.
    const dom = state.b && state.edge < 0.5 ? state.b.plate : state.a.plate;
    const shouldPlay = running && !motionPaused && isVideoPlate(dom) ? dom : null;
    for (const [p, s] of sources) {
      if (p === shouldPlay) s.play();
      else s.pause();
    }
    playing = shouldPlay;
  }

  function render(now: number) {
    if (disposed || !state) return;
    renderer.info.reset();
    resize();
    const dt = lastT ? Math.min(0.1, (now - lastT) / 1000) : 0;
    lastT = now;
    const animate = running && !motionPaused;
    if (clockOverride != null) clock = clockOverride;
    else if (animate) clock += dt;

    const feats = tierFeatures(tier);
    const layers = [state.a, state.b].filter((l): l is LayerState => !!l);

    // Procedural plates first, into their targets.
    const bathy = layers.find((l) => l.plate === "P-bathy");
    if (bathy) {
      const bu = bathyMat.uniforms;
      bu.uRes.value.set(size.w * size.dpr, size.h * size.dpr);
      bu.uDpr.value = size.dpr;
      bu.uTime.value = clock;
      if (bathy.pin) {
        const [px, py] = toBuffer(bathy.pin.x, bathy.pin.y, 0, 0);
        bu.uPin.value.set(px, py);
      } else bu.uPin.value.set(-1, -1);
      const target = pointer && animate ? 1 : 0;
      bump += (target - bump) * (1 - Math.exp(-dt / 0.2));
      if (pointer) {
        const [ppx, ppy] = toBuffer(pointer.x, pointer.y, 0, 0);
        bu.uPointer.value.set(ppx, ppy);
      }
      bu.uBump.value = bump;
      bu.uPing.value = 1;
      renderer.setRenderTarget(bathyRT);
      renderer.render(bathyMesh, ortho);
    }
    const ship = layers.find((l) => l.plate === "P-lines");
    if (ship) {
      renderer.setRenderTarget(linesRT);
      renderer.setClearColor(navy, 1);
      renderer.clear();
      if (ship.lines && feats.lines3d && !portraitScreen()) {
        lines.setClass(ship.lines.slug, now, motionPaused);
        lines.pointer(pointer ? (pointer.x / size.w) * 2 - 1 : null);
        const [x, y, w, h] = toBuffer(ship.lines.x, ship.lines.y, ship.lines.w, ship.lines.h);
        lines.update(now, clock, w / Math.max(1, h), animate);
        // Render-target viewports are in the target's own (buffer) pixels.
        linesRT.viewport.set(x, y, w, h);
        linesRT.scissor.set(x, y, w, h);
        linesRT.scissorTest = true;
        renderer.setRenderTarget(linesRT);
        renderer.autoClear = false;
        renderer.render(lines.scene, lines.camera);
        renderer.autoClear = true;
        linesRT.scissorTest = false;
        linesRT.viewport.set(0, 0, linesRT.width, linesRT.height);
        linesRT.scissor.set(0, 0, linesRT.width, linesRT.height);
      }
    }

    // Flowmap: high tier, fine pointer, moving footage only.
    const flowOn = !!flow && feats.flowmap && finePointer && animate;
    if (flow && flowOn) {
      if (!surfaced && state.a.plate === "V-hero" && window.scrollY < 40) {
        surfaced = true;
        flow.surface();
      }
      flow.step(renderer, size.w / size.h, dt);
      lens.uniforms.uFlow.value = flow.texture;
    }

    // The lens.
    const u = lens.uniforms;
    applyLayer(u.uA.value, state.a, "uTexA");
    if (state.b) applyLayer(u.uB.value, state.b, "uTexB");
    u.uHasB.value = state.b ? 1 : 0;
    u.uRes.value.set(size.w * size.dpr, size.h * size.dpr);
    u.uDpr.value = size.dpr;
    u.uTime.value = clock;
    u.uEdgePx.value = state.edge * state.vh * size.dpr;
    const calm = packCalm(state.calm, size.dpr, size.h);
    for (let i = 0; i < calm.k.length; i++) {
      u.uCalm.value[i].set(
        calm.rects[i * 4],
        calm.rects[i * 4 + 1],
        calm.rects[i * 4 + 2],
        calm.rects[i * 4 + 3]
      );
      u.uCalmK.value[i] = calm.k[i];
    }
    u.uCalmCount.value = calm.count;
    u.uFlowOn.value = flowOn ? 1 : 0;
    // /stage-lab?bake=bathy renders the static fallbacks: no grain or vignette baked in.
    const bake = document.documentElement.hasAttribute("data-stage-bake");
    u.uGrain.value = bake ? 0 : 0.035;
    u.uVignette.value = bake ? 0 : 0.18;
    renderer.setRenderTarget(null);
    renderer.render(lensMesh, ortho);

    if (
      !readySent &&
      layerReady(state.a) &&
      (!state.b || layerReady(state.b) || state.edge > 0.98)
    ) {
      readySent = true;
      o.onReady();
    }
  }

  function loop(now: number) {
    raf = 0;
    if (!running || disposed) return;
    if (lastT && !document.hidden && clockOverride == null) {
      // Ignore the first second (decoder start, shader warm-up).
      if (warm > 1000 && governor.sample(now - lastT)) o.onDowngrade();
      warm += now - lastT;
    }
    render(now);
    raf = requestAnimationFrame(loop);
  }

  function requestRender() {
    if (running || pendingRender || disposed) return;
    pendingRender = requestAnimationFrame((t) => {
      pendingRender = 0;
      render(t);
    });
  }

  // ---- input ---------------------------------------------------------------
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    pointer = { x: e.clientX, y: e.clientY };
    flow?.move(e.clientX / Math.max(1, size.w), 1 - e.clientY / Math.max(1, size.h));
  };
  const onLeave = () => {
    pointer = null;
    flow?.leave();
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerleave", onLeave);
  window.addEventListener("blur", onLeave);

  let lostTimer = 0;
  const onLost = (e: Event) => {
    e.preventDefault();
    running = false;
    lostTimer = window.setTimeout(() => o.onLost(), 2000);
  };
  const onRestored = () => {
    window.clearTimeout(lostTimer);
    size = { w: 0, h: 0, dpr: 1 };
    requestRender();
  };
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);

  resize();

  return {
    setFrame(s) {
      state = s;
      schedule();
      requestRender();
    },
    setRunning(on) {
      if (on === running) return;
      running = on;
      lastT = 0;
      governor.reset();
      warm = 0;
      schedule();
      if (on && !raf) raf = requestAnimationFrame(loop);
      if (!on) requestRender();
    },
    setMotionPaused(p) {
      motionPaused = p;
      schedule();
      requestRender();
    },
    setTier(t) {
      tier = t;
      size = { w: 0, h: 0, dpr: 1 };
      requestRender();
    },
    renderOnce() {
      render(performance.now());
    },
    setClock(s) {
      clockOverride = s;
      requestRender();
    },
    info() {
      const i = renderer.info;
      return {
        calls: i.render.calls,
        triangles: i.render.triangles,
        lines: i.render.lines,
        programs: i.programs?.length ?? 0,
        textures: i.memory.textures,
        fps: governor.fps,
        tier,
        playing,
      };
    },
    dispose() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      if (pendingRender) cancelAnimationFrame(pendingRender);
      window.clearTimeout(lostTimer);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      sources.forEach((s) => s.dispose());
      posters.forEach((p) => typeof p === "object" && p.tex.dispose());
      host.remove();
      flow?.dispose();
      lines.dispose();
      lens.dispose();
      bathyMat.dispose();
      bathyRT.dispose();
      linesRT.dispose();
      tri.dispose();
      renderer.dispose();
    },
  };
};
