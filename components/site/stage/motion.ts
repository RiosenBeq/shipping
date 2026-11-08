/**
 * "The tide" motion tokens (DESIGN-V2 §5) for the stage's own animation: the same easings and
 * durations as the CSS tokens (--ease-tide, --ease-swell, --ease-quick), as functions.
 */

/** Cubic Bézier easing (CSS `cubic-bezier(x1, y1, x2, y2)`), solved by Newton + bisection. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const ax = 3 * x1 - 3 * x2 + 1;
  const bx = 3 * x2 - 6 * x1;
  const cx = 3 * x1;
  const ay = 3 * y1 - 3 * y2 + 1;
  const by = 3 * y2 - 6 * y1;
  const cy = 3 * y1;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number): number => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) {
      const err = sx(t) - x;
      const d = dx(t);
      if (Math.abs(err) < 1e-6) return sy(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    for (let i = 0; i < 30; i++) {
      const v = sx(t);
      if (Math.abs(v - x) < 1e-6) break;
      if (v < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return sy(t);
  };
}

/** All enters and reveals. */
export const easeTide = cubicBezier(0.22, 1, 0.36, 1);
/** Scrubbed transforms, aperture, plate wipe, card stacking, the lines-plan morph. */
export const easeSwell = cubicBezier(0.65, 0, 0.35, 1);
/** Hover and press. */
export const easeQuick = cubicBezier(0.33, 1, 0.68, 1);

export const DURATION = {
  hover: 180,
  small: 420,
  sheet: 640,
  plate: 900,
  intro: 1200,
  /** Lines-plan morph between classes (§6.3). */
  morph: 700,
  /** Canvas fade-in over the poster (§6.5). */
  canvasFade: 400,
} as const;
