/**
 * Scroll → `P-hero` progress (docs/STAGE.md §4): read-only (no wheel or touch handling, no
 * pinning), smoothed with a critically damped spring so a wheel notch glides instead of
 * stepping. Pure; imported by the compositor (the choreography lives in the lazy scene chunk).
 */

/** Hand-over end: the plate keeps moving while the next window rises over it. */
export const HERO_PROGRESS_MAX = 1.3;
/** Spring smooth time (s): roughly the time to cover most of a jump. */
export const HERO_SMOOTH_TIME = 0.15;

/**
 * How far (in viewport heights) the next window rises over the hero before it covers the
 * hull: the orbit must be complete by then, or it plays under the tide unseen.
 */
export const HERO_TAIL = 0.6;

/**
 * The hero window's scroll progress: 0 with its top at the viewport top, 1 once the next
 * window has risen HERO_TAIL of the viewport over it (or, without `vh`, once its bottom has
 * reached the viewport top), clamped to 0..1.3. The homepage hero is a viewport of copy plus
 * a scene-only tail (home.css `.h-hero--scene`), so p 0..1 spans about 1.15 viewports.
 */
export function heroProgress(top: number, height: number, vh?: number): number {
  const span = vh ? Math.max(0.4 * vh, height - HERO_TAIL * vh) : height;
  const p = -top / Math.max(1, span);
  return Math.min(HERO_PROGRESS_MAX, Math.max(0, p));
}

export interface SpringState {
  x: number;
  v: number;
}

/**
 * One step of a critically damped spring toward `target` (Unity's SmoothDamp: the exact
 * response approximated by a rational exp). Never overshoots a fixed target; frame-rate
 * independent; dt is clamped so a stalled tab does not jump.
 */
export function smoothDamp(
  s: SpringState,
  target: number,
  dt: number,
  smoothTime = HERO_SMOOTH_TIME
): SpringState {
  const step = Math.min(0.1, Math.max(0, dt));
  if (step === 0) return s;
  const omega = 2 / Math.max(1e-4, smoothTime);
  const x = omega * step;
  const e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const ch = s.x - target;
  const temp = (s.v + omega * ch) * step;
  let v = (s.v - omega * temp) * e;
  let nx = target + (ch + temp) * e;
  // No overshoot past the target (SmoothDamp's guard).
  if (target - s.x > 0 === nx > target) {
    nx = target;
    v = 0;
  }
  return { x: nx, v };
}

/** True once the spring is visually at rest on its target. */
export function settled(s: SpringState, target: number, eps = 1e-4): boolean {
  return Math.abs(s.x - target) < eps && Math.abs(s.v) < eps * 10;
}
