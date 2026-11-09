/**
 * Pure helpers for the footer's strait transit (no DOM): polylines measured by arc length, the
 * scroll → ship mapping with its eased holds, and the surface-current speed profile.
 */

export type Poly = {
  /** Flat x, y pairs. */
  xy: Float64Array;
  /** Arc length at each point. */
  cum: Float64Array;
  total: number;
};

export function polyline(flat: number[]): Poly {
  const n = Math.floor(flat.length / 2);
  const xy = new Float64Array(flat.slice(0, n * 2));
  const cum = new Float64Array(n);
  for (let i = 1; i < n; i++) {
    cum[i] = cum[i - 1] + Math.hypot(xy[2 * i] - xy[2 * i - 2], xy[2 * i + 1] - xy[2 * i - 1]);
  }
  return { xy, cum, total: n ? cum[n - 1] : 0 };
}

/** Index of the segment holding arc length `s` (binary search). */
function segment(p: Poly, s: number) {
  let lo = 0;
  let hi = p.cum.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (p.cum[mid] <= s) lo = mid;
    else hi = mid;
  }
  return lo;
}

/** Point at arc length `s` (clamped to the ends). */
export function pointAt(p: Poly, s: number): [number, number] {
  const n = p.cum.length;
  if (n === 0) return [0, 0];
  if (n === 1 || s <= 0) return [p.xy[0], p.xy[1]];
  if (s >= p.total) return [p.xy[2 * n - 2], p.xy[2 * n - 1]];
  const i = segment(p, s);
  const l = p.cum[i + 1] - p.cum[i] || 1;
  const t = (s - p.cum[i]) / l;
  return [
    p.xy[2 * i] + (p.xy[2 * i + 2] - p.xy[2 * i]) * t,
    p.xy[2 * i + 1] + (p.xy[2 * i + 3] - p.xy[2 * i + 1]) * t,
  ];
}

/**
 * Heading at `s` (degrees clockwise from +x, y down), from the chord between `s − span` and
 * `s + span`: smooth through the bends instead of snapping at each vertex.
 */
export function headingAt(p: Poly, s: number, span = 4): number {
  const a = pointAt(p, Math.max(0, Math.min(p.total - 2 * span, s - span)));
  const b = pointAt(p, Math.min(p.total, Math.max(2 * span, s + span)));
  return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
}

/**
 * Effective height along a north → south track, one per vertex: the running maximum of y (so a
 * short northward wiggle in a bend never sends the ship back) blended 85/15 with a straight
 * ramp in arc length (so it rises strictly, and stretches that run across the page — the last
 * approach to the tower — are still sailed instead of skipped).
 */
export function trackHeights(p: Poly): Float64Array {
  const n = p.cum.length;
  const h = new Float64Array(n);
  if (!n) return h;
  const y0 = p.xy[1];
  let top = y0;
  for (let i = 0; i < n; i++) top = Math.max(top, p.xy[2 * i + 1]);
  let run = y0;
  for (let i = 0; i < n; i++) {
    run = Math.max(run, p.xy[2 * i + 1]);
    h[i] = 0.85 * run + 0.15 * (y0 + ((top - y0) * p.cum[i]) / (p.total || 1));
  }
  return h;
}

/** Arc length at which the track's effective height (`trackHeights`) reaches `y`. */
export function sAtY(p: Poly, y: number, heights: Float64Array = trackHeights(p)): number {
  const n = p.cum.length;
  if (n < 2 || y <= heights[0]) return 0;
  if (y >= heights[n - 1]) return p.total;
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (heights[mid] <= y) lo = mid;
    else hi = mid;
  }
  const t = (y - heights[lo]) / (heights[hi] - heights[lo] || 1);
  return p.cum[lo] + (p.cum[hi] - p.cum[lo]) * t;
}

/**
 * The eased hold at both ends: 0 before the start, 1 after the end, identity in the middle and
 * quadratic easing across `±e` around 0 and 1 (C¹: no jolt as the ship leaves or reaches its
 * mooring).
 */
export function holdEase(u: number, e = 0.08): number {
  if (u <= -e) return 0;
  if (u < e) return ((u + e) * (u + e)) / (4 * e);
  if (u <= 1 - e) return u;
  if (u < 1 + e) return 1 - ((1 + e - u) * (1 + e - u)) / (4 * e);
  return 1;
}

/**
 * Where the tanker should be (arc length along its track) for a scroll position: the ship rides
 * the viewport's reading line, so the strait scrolls past a ship that holds its height on screen,
 * waiting at the Black Sea entrance before the chart arrives and resting off Maiden's Tower after.
 *
 * `lineY` is the reading line in chart units (from the chart's top).
 */
export function shipTarget(
  track: Poly,
  lineY: number,
  heights: Float64Array = trackHeights(track)
): number {
  const n = track.cum.length;
  if (n < 2) return 0;
  const y0 = heights[0];
  const y1 = heights[n - 1];
  const u = (lineY - y0) / (y1 - y0 || 1);
  return sAtY(track, y0 + holdEase(u) * (y1 - y0), heights);
}

/** Frame-rate independent approach of `x` toward `target` with time constant `tau` (s). */
export function approach(x: number, target: number, dt: number, tau: number): number {
  return target + (x - target) * Math.exp(-Math.max(0, dt) / tau);
}

/**
 * Surface current along the channel, chart units per second: the Bosphorus' surface current runs
 * north → south and quickens where the channel narrows (continuity: speed ∝ 1/width), fastest
 * mid-channel. `widthKm` is the shore-to-shore width, `f` the position across (0 west … 1 east).
 */
export function currentSpeed(widthKm: number, f: number, base = 4.2): number {
  const across = 0.55 + 0.45 * (1 - (2 * f - 1) ** 2);
  return Math.min(8, Math.max(1.4, base / Math.max(widthKm, 0.5))) * across;
}
