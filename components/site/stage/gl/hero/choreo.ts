/**
 * Choreography of the `P-hero` plate ("Lines to light", docs/STAGE.md §4): everything the plate
 * does as a function of the hero's scroll progress p (0 hero at the top → 1 hero scrolled out
 * → 1.3 hand-over into the next window). Pure numbers, no three.js: tested in choreo.test.ts.
 *
 *   p 0     bow three-quarter (port bow), hull in the free column beside the copy, low dawn
 *   p .55   broadside profile, hull centred: the lines fill into glass from the bow aft
 *   p .8    port quarter (stern three-quarter), camera climbing
 *   p 1.3   top-down chart: the hull small on its own contour echo, the sea flattened into
 *           the P-bathy ground the next section reads on
 */

import { HERO_PROGRESS_MAX } from "./spring";

export type Keys = readonly (readonly [number, number])[];

/** Monotone cubic (Fritsch–Carlson) through keyframes [[p, v], …]; clamped outside; flat ends. */
export function track(keys: Keys): (x: number) => number {
  const n = keys.length;
  const xs = keys.map((k) => k[0]);
  const ys = keys.map((k) => k[1]);
  if (n === 1) return () => ys[0];
  const d: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  m.push(d[0]);
  for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2);
  m.push(d[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  // Flat ends: the move starts and lands softly.
  m[0] = 0;
  m[n - 1] = 0;
  return (x) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i];
    const t = (x - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * ys[i] +
      (t3 - 2 * t2 + t) * h * m[i] +
      (-2 * t3 + 3 * t2) * ys[i + 1] +
      (t3 - t2) * h * m[i + 1]
    );
  };
}

export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function build<K extends string>(spec: Record<K, Keys>): (p: number) => Record<K, number> {
  const T = Object.entries(spec).map(([k, keys]) => [k, track(keys as Keys)] as const);
  return (p) => {
    const o = {} as Record<K, number>;
    for (const [k, f] of T) o[k as K] = f(p);
    return o;
  };
}

/**
 * Camera: azimuth (deg, from the bow toward port), elevation (deg), distance, lens shift
 * (NDC x / y), look-at height, vertical fov.
 */
// prettier-ignore
export const DESK_KEYS = {
  az: [[0, 22], [0.28, 46], [0.55, 90], [0.82, 128], [1.0, 146], [1.15, 156], [1.3, 160]],
  el: [[0, 10.5], [0.3, 11], [0.55, 12], [0.8, 17], [1.0, 34], [1.15, 66], [1.3, 89]],
  dist: [[0, 17], [0.3, 18.8], [0.55, 20], [0.8, 19], [1.0, 22], [1.15, 26], [1.3, 31]],
  sx: [[0, 0.46], [0.3, 0.25], [0.55, 0.08], [0.8, 0.02], [1.3, 0.0]],
  sy: [[0, -0.02], [0.3, -0.03], [0.55, -0.04], [0.8, -0.02], [1.0, 0.0], [1.3, 0.0]],
  ly: [[0, 0.12], [0.55, 0.1], [1.0, 0.0], [1.3, 0.0]],
  fov: [[0, 28], [0.55, 27], [1.0, 30], [1.3, 32]],
} as const satisfies Record<string, Keys>;

/** Portrait phones: wider lens, further back, the hull in the free band between the copy. */
// prettier-ignore
export const PHONE_KEYS = {
  az: [[0, 16], [0.3, 40], [0.6, 90], [0.85, 128], [1.0, 146], [1.15, 156], [1.3, 160]],
  el: [[0, 13], [0.3, 13], [0.6, 14], [0.85, 20], [1.0, 38], [1.15, 68], [1.3, 89]],
  dist: [[0, 20.5], [0.3, 25], [0.6, 37], [0.85, 31], [1.0, 31], [1.15, 33], [1.3, 36]],
  sx: [[0, 0.0], [1.3, 0.0]],
  sy: [[0, 0.07], [0.3, 0.02], [0.6, -0.06], [0.85, -0.05], [1.0, -0.02], [1.3, 0.0]],
  ly: [[0, 0.12], [0.6, 0.1], [1.0, 0.0], [1.3, 0.0]],
  fov: [[0, 38], [0.6, 38], [1.0, 40], [1.3, 42]],
} as const satisfies Record<keyof typeof DESK_KEYS, Keys>;

/** Look: light, glass fill, sea, bloom. */
// prettier-ignore
export const LOOK_KEYS = {
  fill: [[0, 0], [0.12, 0], [0.62, 1], [1.0, 1], [1.3, 0.55]],
  back: [[0, 0.5], [0.12, 0.5], [0.62, 0.24], [1.3, 0.3]],
  trail: [[0, 0.65], [0.5, 1], [1.0, 0.8], [1.3, 0.25]],
  ribbon: [[0, 1], [1.0, 1], [1.3, 0.5]],
  ripple: [[0, 0.0], [0.2, 0.025], [0.55, 0.075], [0.85, 0.085], [1.05, 0.05], [1.3, 0.0]],
  wrap: [[0, 0.1], [0.55, 0.15], [1.0, 0.12], [1.3, 0.06]],
  glow: [[0, 0.7], [0.5, 1.0], [1.0, 0.8], [1.3, 0.35]],
  warm: [[0, 1.0], [0.8, 0.9], [1.3, 0.35]],
  lineA: [[0, 0.2], [0.8, 0.2], [1.3, 0.13]],
  idxA: [[0, 0.42], [0.8, 0.42], [1.3, 0.3]],
  N: [[0, 22], [1.0, 24], [1.3, 28]],
  coc: [[0, 4.5], [0.55, 3.5], [1.0, 1.5], [1.3, 0.0]],
  hull: [[0, 1], [1.0, 1], [1.3, 0.6]],
  gain: [[0, 1.0], [1.3, 0.9]],
  dust: [[0, 1], [1.0, 0.8], [1.3, 0.35]],
  dawn: [[0, 1], [0.6, 0.9], [1.0, 0.6], [1.3, 0.0]],
  bloomA: [[0, 0.85], [1.3, 0.55]],
  bloomB: [[0, 0.65], [1.3, 0.35]],
} as const satisfies Record<string, Keys>;

export type Cam = Record<keyof typeof DESK_KEYS, number>;
export type Look = Record<keyof typeof LOOK_KEYS | "front", number>;

let tracks: {
  desk: (p: number) => Cam;
  phone: (p: number) => Cam;
  look: (p: number) => Record<keyof typeof LOOK_KEYS, number>;
} | null = null;

/** Camera and look at progress p (clamped to 0..1.3); `phone` picks the portrait track. */
export function choreo(p: number, phone: boolean): { cam: Cam; look: Look } {
  tracks ??= { desk: build(DESK_KEYS), phone: build(PHONE_KEYS), look: build(LOOK_KEYS) };
  const q = Math.min(HERO_PROGRESS_MAX, Math.max(0, p));
  const cam = (phone ? tracks.phone : tracks.desk)(q);
  // The fill front sweeps from the bow aft while the glass fills (p .12 → .62).
  const look: Look = { ...tracks.look(q), front: smoothstep(0.12, 0.62, q) };
  return { cam, look };
}
