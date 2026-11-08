/**
 * Calm zones (DESIGN-V2 §6.2.3): up to six rectangles, read from `[data-calm]` elements, inside
 * which the lens compresses the plate's luminance toward navy-deep (#051624) and switches the
 * flowmap and glints off. They are what keeps copy at WCAG AA over moving footage.
 *
 * Pure geometry: the compositor packs the result into uniforms; `calmAt` is the CPU reference
 * of the shader's falloff (tests, and the contrast judge).
 */

export interface CalmRect {
  /** Viewport CSS px, top-left origin. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Strength: how far the plate is pulled toward navy-deep (0.35–0.55). */
  k: number;
}

export const CALM_MAX = 6;
/** Feather around each rect (CSS px). */
export const CALM_FEATHER = 48;
export const CALM_K_DEFAULT = 0.45;
export const CALM_K_MIN = 0.35;
export const CALM_K_MAX = 0.55;

/** Strength from a `data-calm` attribute value: "" → default, numbers clamped to 0.35–0.55. */
export function parseCalm(value: string | null | undefined): number {
  if (value == null || value.trim() === "") return CALM_K_DEFAULT;
  const n = Number(value);
  if (!Number.isFinite(n)) return CALM_K_DEFAULT;
  return Math.min(CALM_K_MAX, Math.max(CALM_K_MIN, n));
}

/** Area of a rect (grown by the feather) that falls inside the viewport. */
export function visibleArea(r: CalmRect, vw: number, vh: number, feather = CALM_FEATHER): number {
  const x0 = Math.max(0, r.x - feather);
  const y0 = Math.max(0, r.y - feather);
  const x1 = Math.min(vw, r.x + r.w + feather);
  const y1 = Math.min(vh, r.y + r.h + feather);
  return Math.max(0, x1 - x0) * Math.max(0, y1 - y0);
}

/**
 * The rects the shader gets this frame: those whose feathered box reaches the viewport, the
 * largest first, at most CALM_MAX. Empty rects are dropped.
 */
export function selectCalmRects(
  rects: readonly CalmRect[],
  vw: number,
  vh: number,
  max = CALM_MAX,
  feather = CALM_FEATHER
): CalmRect[] {
  return rects
    .filter((r) => r.w > 0 && r.h > 0)
    .map((r) => ({ r, a: visibleArea(r, vw, vh, feather) }))
    .filter((e) => e.a > 0)
    .sort((a, b) => b.a - a.a)
    .slice(0, max)
    .map((e) => e.r);
}

/** Distance (px) from a point to a rect; 0 inside. */
export function rectDistance(px: number, py: number, r: CalmRect): number {
  const dx = Math.max(r.x - px, 0, px - (r.x + r.w));
  const dy = Math.max(r.y - py, 0, py - (r.y + r.h));
  return Math.hypot(dx, dy);
}

/** Calm weight at a point: k inside, easing to 0 across the feather (max over the rects). */
export function calmAt(
  px: number,
  py: number,
  rects: readonly CalmRect[],
  feather = CALM_FEATHER
): number {
  let w = 0;
  for (const r of rects) {
    const d = rectDistance(px, py, r);
    const t = Math.min(1, Math.max(0, d / feather));
    const fall = 1 - t * t * (3 - 2 * t);
    w = Math.max(w, r.k * fall);
  }
  return w;
}

/** The lens's effect on one colour (sRGB 0..1): pulled toward navy-deep by the calm weight. */
export const CALM_TARGET: readonly [number, number, number] = [5 / 255, 22 / 255, 36 / 255];
export function calmColor(
  c: readonly [number, number, number],
  weight: number
): [number, number, number] {
  return [
    c[0] + (CALM_TARGET[0] - c[0]) * weight,
    c[1] + (CALM_TARGET[1] - c[1]) * weight,
    c[2] + (CALM_TARGET[2] - c[2]) * weight,
  ];
}

/**
 * Uniform data: rects as (x, y, w, h) in drawing-buffer px with a bottom-left origin (GL),
 * strengths in a second array. Unused slots are zero (the shader loops `uCalmCount` times).
 */
export function packCalm(
  rects: readonly CalmRect[],
  dpr: number,
  viewportHeight: number,
  out = { rects: new Float32Array(CALM_MAX * 4), k: new Float32Array(CALM_MAX), count: 0 }
) {
  out.rects.fill(0);
  out.k.fill(0);
  const n = Math.min(CALM_MAX, rects.length);
  for (let i = 0; i < n; i++) {
    const r = rects[i];
    out.rects[i * 4] = r.x * dpr;
    out.rects[i * 4 + 1] = (viewportHeight - (r.y + r.h)) * dpr;
    out.rects[i * 4 + 2] = r.w * dpr;
    out.rects[i * 4 + 3] = r.h * dpr;
    out.k[i] = r.k;
  }
  out.count = n;
  return out;
}
