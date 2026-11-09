/**
 * The footer's strait transit, live (lazy chunk, loaded by `StraitTransit` when the chart nears
 * the viewport). Fills in today's sunrise and sunset, then — only while motion is allowed, the
 * chart is on screen and the tab is visible — runs one rAF loop that:
 * - moves the tanker along its southbound track with the scroll (`shipTarget`: it rides the
 *   viewport's reading line, with eased holds at the Black Sea entrance and off Maiden's Tower),
 *   turning through the bends, leaving a wake that fades in 1.6 s;
 * - sails three ships north in the opposite lane (time-based, 72 s per transit);
 * - drifts faint streaks south with the surface current, quicker in the narrows.
 * Reduced motion, Pause motion and print show the static chart (the server markup). Native
 * scrolling only: no wheel, touch or scroll listeners that could delay or take the scroll.
 */
import { isMotionPaused, subscribeMotionPaused } from "@/components/site/stage/pause";
import { istanbulDaylight } from "./sun";
import {
  approach,
  currentSpeed,
  headingAt,
  parseNumbers,
  pointAt,
  polyline,
  shipTarget,
  trackHeights,
} from "./transit-math";

/** The reading line the tanker rides, as a fraction of the viewport height. */
const READING_LINE = 0.52;
/** Ambient ships: one transit of the northbound lane, seconds. */
const TRAFFIC_PERIOD = 72;
/** Wake lifetime, seconds, and greatest length, chart units. */
const WAKE_LIFE = 1.6;
const WAKE_MAX = 48;

const SAND = "243,239,228";

function fillDaylight(root: HTMLElement) {
  const d = istanbulDaylight(new Date());
  if (!d) return;
  const rise = root.querySelector<HTMLElement>('[data-sun="rise"]');
  const set = root.querySelector<HTMLElement>('[data-sun="set"]');
  if (rise && rise.textContent !== d.rise) rise.textContent = d.rise;
  if (set && set.textContent !== d.set) set.textContent = d.set;
}

type Streak = { u: number; f: number; age: number; life: number };

export function startTransit(root: HTMLElement): () => void {
  const cleanups: (() => void)[] = [];

  // Today's daylight, Istanbul time; checked again every 10 minutes for a page left open
  // across midnight.
  fillDaylight(root);
  const clock = window.setInterval(() => fillDaylight(root), 600_000);
  cleanups.push(() => window.clearInterval(clock));

  const map = root.querySelector<SVGSVGElement>("svg[role='img']");
  const canvas = root.querySelector<HTMLCanvasElement>("canvas");
  const ship = root.querySelector<SVGUseElement>("[data-ship]");
  const boats = Array.from(root.querySelectorAll<SVGUseElement>("[data-boat]"));
  const ctx = canvas?.getContext("2d");
  const track = polyline(parseNumbers(root.dataset.route));
  const heights = trackHeights(track);
  const lane = polyline(parseNumbers(root.dataset.traffic));
  const frameNums = parseNumbers(root.dataset.frame);
  const widths = parseNumbers(root.dataset.widths);
  const stations = Math.floor(frameNums.length / 4);
  if (!map || !canvas || !ctx || !ship || track.total === 0 || stations < 2) {
    return () => cleanups.forEach((f) => f());
  }
  const vb = map.viewBox.baseVal;
  const W = vb.width || 400;
  const H = vb.height || 640;

  /* ---------- state ---------- */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  let paused = isMotionPaused();
  let onScreen = false;
  let raf = 0;
  let last = 0;
  let clockT = 0;
  let s = -1; // the tanker's arc length (−1: not placed yet)
  const wake: { x: number; y: number; t: number }[] = [];
  const streaks: Streak[] = [];
  let cssW = 0;
  let cssH = 0;
  let dpr = 1;

  const allowed = () => !reduce.matches && !paused;

  /* ---------- canvas ---------- */
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    cssW = r.width;
    cssH = r.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  cleanups.push(() => ro.disconnect());

  /* ---------- current streaks: stations north → south, centre ± half-width across ---------- */
  const at = (u: number, f: number): [number, number] => {
    const i = Math.max(0, Math.min(stations - 2, Math.floor(u)));
    const t = Math.max(0, Math.min(1, u - i));
    const k = 4 * i;
    const v = (j: number) => frameNums[k + j] + (frameNums[k + j + 4] - frameNums[k + j]) * t;
    const across = 2 * f - 1;
    return [v(0) + v(2) * across, v(1) + v(3) * across];
  };
  const spacing = (() => {
    let l = 0;
    for (let i = 1; i < stations; i++) {
      const a = at(i - 1, 0.5);
      const b = at(i, 0.5);
      l += Math.hypot(b[0] - a[0], b[1] - a[1]);
    }
    return l / (stations - 1) || 1;
  })();
  const spawn = (p: Streak, anywhere: boolean) => {
    p.u = anywhere ? Math.random() * (stations - 1) : Math.random() * Math.min(6, stations - 1);
    p.f = Math.random();
    p.age = anywhere ? Math.random() * 4 : 0;
    p.life = 4 + Math.random() * 5;
  };
  const count = window.matchMedia("(max-width: 767px)").matches ? 46 : 72;
  for (let i = 0; i < count; i++) {
    const p = { u: 0, f: 0, age: 0, life: 1 };
    spawn(p, true);
    streaks.push(p);
  }

  /* ---------- frame ---------- */
  const place = (el: SVGUseElement, x: number, y: number, h: number) =>
    el.setAttribute(
      "transform",
      `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${h.toFixed(1)})`
    );

  const frame = (now: number) => {
    raf = 0;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    clockT += dt;

    // Read first (one layout read per frame), then write.
    const rect = map.getBoundingClientRect();
    if (Math.round(rect.width) !== Math.round(cssW) || Math.round(rect.height) !== Math.round(cssH)) {
      resize();
    }
    const k = H / (rect.height || 1);
    const lineY = (window.innerHeight * READING_LINE - rect.top) * k;
    const target = shipTarget(track, lineY, heights);
    const prev = s;
    s = s < 0 ? target : approach(s, target, dt, 0.16);
    const [x, y] = pointAt(track, s);
    place(ship, x, y, headingAt(track, s));
    if (prev < 0 || Math.abs(s - prev) > 0.05) {
      const tail = wake[wake.length - 1];
      if (!tail || Math.hypot(x - tail.x, y - tail.y) > 0.6) wake.push({ x, y, t: clockT });
    }
    while (wake.length && clockT - wake[0].t > WAKE_LIFE) wake.shift();
    // …and no longer than WAKE_MAX behind the ship, however fast the scroll.
    for (let j = wake.length - 1, d = 0; j > 0; j--) {
      d += Math.hypot(wake[j].x - wake[j - 1].x, wake[j].y - wake[j - 1].y);
      if (d > WAKE_MAX) {
        wake.splice(0, j);
        break;
      }
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform((dpr * cssW) / W, 0, 0, (dpr * cssH) / H, 0, 0);
    ctx.lineCap = "round";

    // Surface current.
    for (const p of streaks) {
      p.age += dt;
      const i = Math.max(0, Math.min(widths.length - 1, Math.round(p.u)));
      p.u += (currentSpeed(widths[i] ?? 1, p.f) * dt) / spacing;
      if (p.age > p.life || p.u >= stations - 1.05) {
        spawn(p, false);
        continue;
      }
      const env = Math.sin((Math.PI * p.age) / p.life);
      const [hx, hy] = at(p.u, p.f);
      const [tx, ty] = at(p.u - 1.15, p.f);
      ctx.strokeStyle = `rgba(${SAND},${(0.24 * env).toFixed(3)})`;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(hx, hy);
      ctx.stroke();
    }

    // The tanker's wake: fading with age, widening a little behind the stern.
    for (let j = 1; j < wake.length; j++) {
      const a = wake[j - 1];
      const b = wake[j];
      const life = 1 - (clockT - b.t) / WAKE_LIFE;
      if (life <= 0) continue;
      ctx.strokeStyle = `rgba(${SAND},${(0.12 * life).toFixed(3)})`;
      ctx.lineWidth = 3.4 + (1 - life) * 2.4;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.strokeStyle = `rgba(${SAND},${(0.5 * life * life).toFixed(3)})`;
      ctx.lineWidth = 0.9;
      ctx.stroke();
    }

    // Ambient ships, northbound, each with a short fading wake behind it.
    if (lane.total > 0) {
      boats.forEach((el, i) => {
        const sb = ((clockT / TRAFFIC_PERIOD + 0.2 + i / boats.length) % 1) * lane.total;
        const [bx, by] = pointAt(lane, sb);
        const edge = Math.min(sb, lane.total - sb) / 24;
        el.style.opacity = String(Math.max(0, Math.min(1, edge)));
        place(el, bx, by, headingAt(lane, sb));
        const fade = Math.max(0, Math.min(1, edge));
        for (let q = 1; q <= 4; q++) {
          const [ax, ay] = pointAt(lane, sb - 3 * q - 3);
          const [cx, cy] = pointAt(lane, sb - 3 * q);
          ctx.strokeStyle = `rgba(${SAND},${(0.22 * fade * (1 - q / 5)).toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(cx, cy);
          ctx.stroke();
        }
      });
    }

    schedule();
  };

  const schedule = () => {
    if (!raf && onScreen && allowed() && !document.hidden) raf = requestAnimationFrame(frame);
  };
  const halt = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
  };

  /** Live while motion is allowed; the static chart (server markup) otherwise. */
  const sync = () => {
    if (allowed()) {
      root.dataset.live = "";
      schedule();
    } else {
      halt();
      delete root.dataset.live;
      wake.length = 0;
      s = -1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const io = new IntersectionObserver(
    (entries) => {
      onScreen = entries.some((e) => e.isIntersecting);
      if (onScreen) schedule();
      else halt();
    },
    { rootMargin: "64px 0px" }
  );
  io.observe(map);
  cleanups.push(() => io.disconnect());

  const onVisibility = () => (document.hidden ? halt() : schedule());
  document.addEventListener("visibilitychange", onVisibility);
  cleanups.push(() => document.removeEventListener("visibilitychange", onVisibility));
  reduce.addEventListener("change", sync);
  cleanups.push(() => reduce.removeEventListener("change", sync));
  cleanups.push(
    subscribeMotionPaused((v) => {
      paused = v;
      sync();
    })
  );

  resize();
  sync();

  return () => {
    halt();
    cleanups.forEach((f) => f());
    delete root.dataset.live;
  };
}

