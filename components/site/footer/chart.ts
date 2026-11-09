/**
 * Builds the footer's Bosphorus chart from `geo.ts` for one view (rotation, scale, size): shore
 * and land paths, the channel's stations (west and east shore along the centreline's normals),
 * the traffic lanes, bridge glyphs, label anchors and the ships' tracks. Pure and deterministic;
 * run by `tools/build-chart.ts` (and the tests) to write `strait-chart.svg` and `strait-data.ts` —
 * the site ships those, not this module.
 */
import {
  ASIA,
  BRIDGES,
  EUROPE,
  GUIDE,
  MAIDENS_TOWER,
  PLACES,
  toKm,
  type Bridge,
  type LatLon,
} from "./geo";

export type Pt = [number, number];

export type ChartView = {
  /** viewBox width and height (px at 1:1). */
  width: number;
  height: number;
  /** Rotation of the map, degrees counter-clockwise (0 = north up). */
  rotate: number;
  /** px per km. */
  scale: number;
  /** Map point (km east, km north of the origin) at the centre of the view. */
  center: Pt;
};

const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const mul = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k];
const len = (a: Pt) => Math.hypot(a[0], a[1]);
const norm = (a: Pt): Pt => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l];
};
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** km plane → view px (y down). */
export function projector(view: ChartView) {
  const th = (view.rotate * Math.PI) / 180;
  const c = Math.cos(th);
  const s = Math.sin(th);
  const rot = ([x, y]: Pt): Pt => [x * c - y * s, x * s + y * c];
  const rc = rot(view.center);
  return (p: Pt): Pt => {
    const [x, y] = rot(p);
    return [view.width / 2 + view.scale * (x - rc[0]), view.height / 2 - view.scale * (y - rc[1])];
  };
}

/** Ramer–Douglas–Peucker. */
export function simplify(points: Pt[], eps: number): Pt[] {
  if (points.length < 3) return points.slice();
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack: [number, number][] = [[0, points.length - 1]];
  while (stack.length) {
    const [i0, i1] = stack.pop()!;
    const a = points[i0];
    const ab = sub(points[i1], a);
    const l = len(ab);
    let dMax = 0;
    let iMax = -1;
    for (let i = i0 + 1; i < i1; i++) {
      const ap = sub(points[i], a);
      const d = l > 0 ? Math.abs(ab[0] * ap[1] - ab[1] * ap[0]) / l : len(ap);
      if (d > dMax) {
        dMax = d;
        iMax = i;
      }
    }
    if (iMax > 0 && dMax > eps) {
      keep[iMax] = 1;
      stack.push([i0, iMax], [iMax, i1]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

/**
 * Centripetal Catmull–Rom through `p` as cubic Bézier segments [from, c1, c2, to] (no cusps or
 * loops with uneven spacing, unlike the uniform spline).
 */
export function catmullRom(p: Pt[]): [Pt, Pt, Pt, Pt][] {
  const out: [Pt, Pt, Pt, Pt][] = [];
  const n = p.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = p[i - 1] ?? sub(mul(p[i], 2), p[i + 1]);
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? sub(mul(p[i + 1], 2), p[i]);
    const d1 = Math.sqrt(len(sub(p1, p0))) || 1e-6;
    const d2 = Math.sqrt(len(sub(p2, p1))) || 1e-6;
    const d3 = Math.sqrt(len(sub(p3, p2))) || 1e-6;
    const b1: Pt = [
      (d1 * d1 * p2[0] - d2 * d2 * p0[0] + (2 * d1 * d1 + 3 * d1 * d2 + d2 * d2) * p1[0]) /
        (3 * d1 * (d1 + d2)),
      (d1 * d1 * p2[1] - d2 * d2 * p0[1] + (2 * d1 * d1 + 3 * d1 * d2 + d2 * d2) * p1[1]) /
        (3 * d1 * (d1 + d2)),
    ];
    const b2: Pt = [
      (d3 * d3 * p1[0] - d2 * d2 * p3[0] + (2 * d3 * d3 + 3 * d3 * d2 + d2 * d2) * p2[0]) /
        (3 * d3 * (d3 + d2)),
      (d3 * d3 * p1[1] - d2 * d2 * p3[1] + (2 * d3 * d3 + 3 * d3 * d2 + d2 * d2) * p2[1]) /
        (3 * d3 * (d3 + d2)),
    ];
    out.push([p1, b1, b2, p2]);
  }
  return out;
}

/** Points along Bézier segments, `per` per segment (plus the last point). */
export function sampleBeziers(segs: [Pt, Pt, Pt, Pt][], per: number): Pt[] {
  const out: Pt[] = [];
  for (const [a, b, c, d] of segs) {
    for (let k = 0; k < per; k++) {
      const t = k / per;
      const u = 1 - t;
      out.push([
        u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
        u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
      ]);
    }
  }
  if (segs.length) out.push(segs[segs.length - 1][3]);
  return out;
}

/** Evenly spaced points along a polyline, `step` apart (first and last kept). */
export function resample(p: Pt[], step: number): Pt[] {
  const out: Pt[] = [p[0]];
  let carry = 0;
  for (let i = 1; i < p.length; i++) {
    const seg = sub(p[i], p[i - 1]);
    const l = len(seg);
    let d = step - carry;
    while (d <= l) {
      out.push(lerp(p[i - 1], p[i], d / l));
      d += step;
    }
    carry = l - (d - step);
  }
  const last = p[p.length - 1];
  if (len(sub(out[out.length - 1], last)) > step * 0.25) out.push(last);
  else out[out.length - 1] = last;
  return out;
}

/** Total length of a polyline. */
export function polyLength(p: Pt[]) {
  let l = 0;
  for (let i = 1; i < p.length; i++) l += len(sub(p[i], p[i - 1]));
  return l;
}

/** Nearest hit of the ray o + t·d (t > 0) on the polyline, or null. */
export function rayHit(o: Pt, d: Pt, line: Pt[], maxT = Infinity): Pt | null {
  let best = maxT;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1];
    const e = sub(line[i], a);
    const den = d[0] * e[1] - d[1] * e[0];
    if (Math.abs(den) < 1e-12) continue;
    const ao = sub(a, o);
    const t = (ao[0] * e[1] - ao[1] * e[0]) / den;
    const u = (ao[0] * d[1] - ao[1] * d[0]) / den;
    if (t > 1e-9 && t < best && u >= 0 && u <= 1) best = t;
  }
  return best < maxT ? add(o, mul(d, best)) : null;
}

/** Moving average (window ±r), ends pinned. */
function smooth(p: Pt[], r: number): Pt[] {
  return p.map((q, i) => {
    if (i === 0 || i === p.length - 1) return q;
    const k = Math.min(r, i, p.length - 1 - i);
    let x = 0;
    let y = 0;
    for (let j = i - k; j <= i + k; j++) {
      x += p[j][0];
      y += p[j][1];
    }
    return [x / (2 * k + 1), y / (2 * k + 1)];
  });
}

const tangent = (p: Pt[], i: number): Pt =>
  norm(sub(p[Math.min(i + 1, p.length - 1)], p[Math.max(i - 1, 0)]));

export type Station = {
  /** Midstream (km). */
  c: Pt;
  /** Where the normal meets the European and the Asian shore (km, capped at `MAX_HALF`). */
  w: Pt;
  e: Pt;
  /** Shore to shore along the normal, km (uncapped when both shores are hit). */
  width: number;
  /** Distance to the nearest European and Asian shore point, km. */
  dw: number;
  de: number;
};

/** Half-width cap at the open ends (Marmara, Black Sea) and across inlets, km. */
const MAX_HALF = 1.5;
/** Station spacing along the centreline, km. */
export const STATION_STEP = 0.2;

const EU_KM: Pt[] = EUROPE.map((p) => toKm(p));
const AS_KM: Pt[] = ASIA.map((p) => toKm(p));

/** Nearest point on a polyline. */
export function nearestOn(p: Pt, line: Pt[]): Pt {
  let best: Pt = line[0];
  let bd = Infinity;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1];
    const ab = sub(line[i], a);
    const l2 = ab[0] * ab[0] + ab[1] * ab[1];
    const t = l2
      ? Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / l2))
      : 0;
    const q = add(a, mul(ab, t));
    const d = len(sub(p, q));
    if (d < bd) {
      bd = d;
      best = q;
    }
  }
  return best;
}

/**
 * The channel: stations every 200 m from the Marmara approach to the Black Sea. The guide line
 * is re-centred between the shores three times — each station moves to the midpoint of the
 * nearest European and nearest Asian shore point (a medial line, robust through the bends; at
 * the open ends a shore further than 1.5 km counts as 1.5 km), then the line is lightly smoothed
 * and resampled. Widths are measured along each station's normal.
 */
export function channel(): Station[] {
  let c = resample(sampleBeziers(catmullRom(GUIDE.map((p) => toKm(p))), 12), STATION_STEP);
  for (let pass = 0; pass < 3; pass++) {
    const moved = c.map((ci) => {
      const capped = (q: Pt) => {
        const d = sub(q, ci);
        const l = len(d);
        return l > MAX_HALF ? add(ci, mul(d, MAX_HALF / l)) : q;
      };
      const w = capped(nearestOn(ci, EU_KM));
      const e = capped(nearestOn(ci, AS_KM));
      return lerp(w, e, 0.5);
    });
    c = resample(smooth(moved, 2), STATION_STEP);
  }
  const st = c.map((ci, i) => {
    const t = tangent(c, i);
    const left: Pt = [-t[1], t[0]]; // west of a northbound heading
    const right: Pt = [t[1], -t[0]];
    const w = rayHit(ci, left, EU_KM, 6);
    const e = rayHit(ci, right, AS_KM, 6);
    const hw = Math.min(w ? len(sub(w, ci)) : MAX_HALF, MAX_HALF);
    const he = Math.min(e ? len(sub(e, ci)) : MAX_HALF, MAX_HALF);
    return {
      c: ci,
      w: add(ci, mul(left, hw)),
      e: add(ci, mul(right, he)),
      width: w && e ? len(sub(e, w)) : hw + he,
      dw: len(sub(nearestOn(ci, EU_KM), ci)),
      de: len(sub(nearestOn(ci, AS_KM), ci)),
    };
  });
  // Shore points jump where a normal slips into an inlet; the streak frame wants them calm.
  const ws = smooth(
    st.map((s) => s.w),
    2
  );
  const es = smooth(
    st.map((s) => s.e),
    2
  );
  return st.map((s, i) => ({ ...s, w: ws[i], e: es[i] }));
}

/**
 * Lane centre lines (km): northbound keeps to the Asian side, southbound to the European — half
 * way to that side's shore along the normal, at most 420 m out, and never past half the distance
 * to the nearest point of that shore (a cape such as Kandilli).
 */
export function lanes(st: Station[]) {
  const lane = (side: "w" | "e") =>
    smooth(
      st.map((s) => {
        const half = len(sub(s[side], s.c));
        const near = side === "w" ? s.dw : s.de;
        const off = Math.min(0.48 * half, 0.42, 0.5 * near);
        return add(s.c, mul(norm(sub(s[side], s.c)), off));
      }),
      3
    );
  return { north: lane("e"), south: lane("w"), separation: st.map((s) => s.c) };
}

/** Index of the station nearest a map point. */
export function nearestStation(st: Station[], p: Pt) {
  let best = 0;
  let bd = Infinity;
  st.forEach((s, i) => {
    const d = len(sub(s.c, p));
    if (d < bd) {
      bd = d;
      best = i;
    }
  });
  return best;
}

/** A bridge deck from shore to shore (km), extended onto the land by `over` km. */
export function bridgeDeck(b: Bridge, over = 0.12): [Pt, Pt] {
  const c = toKm(b.at);
  const a = ((90 - b.bearing) * Math.PI) / 180;
  const d: Pt = [Math.cos(a), Math.sin(a)];
  const east = rayHit(c, d, AS_KM, 3) ?? add(c, mul(d, b.span / 2000));
  const west = rayHit(c, mul(d, -1), EU_KM, 3) ?? sub(c, mul(d, b.span / 2000));
  return [add(west, mul(d, -over)), add(east, mul(d, over))];
}

/* ---------- SVG path strings ---------- */

/** Tenths of a px, as integers: paths are written from these so relative steps never drift. */
const T = (n: number) => Math.round(n * 10);
const num = (t: number) => {
  const v = t / 10;
  const s = String(v);
  return s.startsWith("0.") ? s.slice(1) : s.startsWith("-0.") ? `-${s.slice(2)}` : s;
};
/** Numbers joined with the fewest separators the path grammar allows. */
const nums = (ts: number[]) =>
  ts.map(num).reduce((acc, n, i) => acc + (i && !n.startsWith("-") ? " " : "") + n, "");

/** Cubic Bézier segments → compact relative path ("M… c… c…"), optionally closed through `close`. */
export function bezierPath(segs: [Pt, Pt, Pt, Pt][], close: Pt[] = []): string {
  if (!segs.length) return "";
  let cx = T(segs[0][0][0]);
  let cy = T(segs[0][0][1]);
  let out = `M${nums([cx, cy])}`;
  for (const [, b, c, d] of segs) {
    const q = [T(b[0]), T(b[1]), T(c[0]), T(c[1]), T(d[0]), T(d[1])];
    out += `c${nums([q[0] - cx, q[1] - cy, q[2] - cx, q[3] - cy, q[4] - cx, q[5] - cy])}`;
    cx = q[4];
    cy = q[5];
  }
  for (const p of close) {
    const x = T(p[0]);
    const y = T(p[1]);
    out += `l${nums([x - cx, y - cy])}`;
    cx = x;
    cy = y;
  }
  return close.length ? `${out}z` : out;
}

/** Polyline → smoothed compact path. */
export function smoothPath(p: Pt[]): string {
  return p.length < 2 ? "" : bezierPath(catmullRom(p));
}

/** Whether a view point lies within the view expanded by `m` px. */
const within = (view: ChartView, q: Pt, m: number) =>
  q[0] >= -m && q[1] >= -m && q[0] <= view.width + m && q[1] <= view.height + m;

/**
 * A shore as one closed path in view px: the coast simplified finely where it can be seen and
 * coarsely elsewhere, smoothed, then closed through `close` (points far inland). Filled, it is the
 * land tint; stroked, the coastline (the closing lines lie far outside the view).
 */
export function shorePath(view: ChartView, line: readonly LatLon[], close: LatLon[]) {
  const pr = projector(view);
  const pts = line.map((p) => pr(toKm(p)));
  const M = 40;
  const runs: { inside: boolean; p: Pt[] }[] = [];
  pts.forEach((q, i) => {
    const inside = within(view, q, M);
    const last = runs[runs.length - 1];
    // Each run starts at the previous run's last point, so they join exactly.
    if (!last || last.inside !== inside) runs.push({ inside, p: i ? [pts[i - 1], q] : [q] });
    else last.p.push(q);
  });
  const simple: Pt[] = [];
  for (const r of runs) {
    const s = simplify(r.p, r.inside ? 0.4 : 8);
    simple.push(...(simple.length ? s.slice(1) : s));
  }
  return bezierPath(
    catmullRom(simple),
    close.map((p) => pr(toKm(p)))
  );
}

export type ChartLabel = {
  id: string;
  /** One or two lines. */
  lines: string[];
  at: Pt;
  anchor: "start" | "middle" | "end";
  kind: "sea" | "land" | "place" | "bridge" | "mark";
};

/** A ship's pose: position (view px) and heading (degrees clockwise from +x, y down). */
export type Pose = { at: Pt; heading: number };

export type Chart = {
  view: ChartView;
  /** Closed shore paths (fill: land tint; stroke: coastline). */
  europe: string;
  asia: string;
  /** Traffic separation line (the channel's centreline), dashed on the chart. */
  separation: string;
  bridges: { id: Bridge["id"]; name: string; a: Pt; b: Pt }[];
  tower: Pt;
  /** The tanker's track: southbound lane, Black Sea → abeam Maiden's Tower (view px). */
  route: Pt[];
  /** Northbound lane, Marmara → Black Sea, for the ambient ships (view px). */
  traffic: Pt[];
  /** Streak frame, north → south: [cx, cy, hx, hy] per station — the centre and the half-width
   * vector toward Asia (capped), view px. */
  frame: [number, number, number, number][];
  /** Channel width at each frame station, km. */
  widths: number[];
  /** The tanker at rest (end of `route`), and the ambient ships at rest. */
  ship: Pose;
  ambient: Pose[];
  /** Lane direction marks, and surface-current marks (north → south). */
  arrows: Pose[];
  current: Pose[];
  graticule: { d: string; ticks: { text: string; at: Pt; anchor: "start" | "end" | "middle" }[] };
  labels: ChartLabel[];
  /** One nautical mile, view px. */
  nm: number;
  /** Narrowest channel width, km. */
  narrowest: number;
};

const headingOf = (a: Pt, b: Pt) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;

/** Pose at fraction `t` (0..1) of a polyline. */
export function along(p: Pt[], t: number): Pose {
  const total = polyLength(p);
  let d = Math.max(0, Math.min(1, t)) * total;
  for (let i = 1; i < p.length; i++) {
    const l = len(sub(p[i], p[i - 1]));
    if (d <= l || i === p.length - 1) {
      return {
        at: lerp(p[i - 1], p[i], l ? Math.min(1, d / l) : 0),
        heading: headingOf(p[i - 1], p[i]),
      };
    }
    d -= l;
  }
  return { at: p[0], heading: 0 };
}

const round1 = (p: Pt): Pt => [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10];

/** The Black Sea entrance, midway between Rumelifeneri and Anadolufeneri: where the tanker waits. */
const ENTRANCE: LatLon = [
  (PLACES.rumelifeneri[0] + PLACES.anadolufeneri[0]) / 2,
  (PLACES.rumelifeneri[1] + PLACES.anadolufeneri[1]) / 2,
];

/**
 * The footer's view: north up, the strait from Seraglio Point and Kadıköy to the Black Sea
 * entrance, 400 × 640 (shown at about 340–470 px wide).
 */
export const FOOTER_VIEW: ChartView = {
  width: 400,
  height: 640,
  rotate: 0,
  scale: 21.6,
  center: toKm([41.118, 29.068]),
};

/** Everything the footer chart draws, for one view. */
export function buildChart(view: ChartView = FOOTER_VIEW): Chart {
  const pr = projector(view);
  const st = channel();
  const ln = lanes(st);
  const inView = (q: Pt, m = 0) => within(view, q, -m);
  const tower = toKm(MAIDENS_TOWER);
  const iTower = nearestStation(st, tower);

  // The tanker: southbound lane from the Black Sea entrance (between the two lighthouses) down to
  // abeam the tower (stations run south → north).
  const south = ln.south.map(pr);
  const iTop = Math.max(nearestStation(st, toKm(ENTRANCE)), iTower + 2);
  const route = simplify(south.slice(iTower, iTop + 1).reverse(), 0.25).map(round1);
  // Ambient traffic: the whole visible northbound lane.
  const north = ln.north.map(pr).filter((q) => inView(q, -6));
  const traffic = simplify(north, 0.25).map(round1);
  const sep = ln.separation.map(pr).filter((q) => inView(q, -2));

  const end = route[route.length - 1];
  const ship: Pose = { at: end, heading: headingOf(route[route.length - 2], end) };
  const ambient = [0.2, 0.52, 0.8].map((t) => along(traffic, t));
  const arrows = [0.3, 0.62].flatMap((t) => [along(route, t), along(traffic, 1 - t)]);
  const current = [0.16, 0.47, 0.78].map((t) => {
    const a = along(sep, t);
    // South along the channel: the lane runs north → south in `route` order.
    const s = along(route, t);
    return { at: a.at, heading: s.heading };
  });

  // Streak frame: centre and a half-width vector toward Asia, capped (0.42 of the width, at most
  // 600 m) so the streaks keep to the channel, clear of the shores and out of the bays.
  const frameSt = st.filter((s, i) => i % 2 === 0 && inView(pr(s.c), -24));
  const frame = frameSt
    .map((s) => {
      const c0 = pr(s.c);
      const half = Math.min(0.42 * s.width, 0.6);
      const e = pr(add(s.c, mul(norm(sub(s.e, s.c)), half)));
      return [...round1(c0), ...round1(sub(e, c0))] as [number, number, number, number];
    })
    .reverse();
  const widths = frameSt.map((s) => Math.round(s.width * 100) / 100).reverse();
  const narrowest = Math.min(...st.slice(5, -5).map((s) => s.width));

  // Graticule every 5′ of arc, with ticks on the west and south edges.
  const lines: string[] = [];
  const ticks: Chart["graticule"]["ticks"] = [];
  const dm = (v: number, h: string) => {
    const d = Math.floor(v + 1e-9);
    const m = Math.round((v - d) * 60);
    return `${d}°${String(m).padStart(2, "0")}′${h}`;
  };
  // Parallels labelled on the west edge, meridians on the south edge, clear of the corners.
  for (let k = -1; k < 5; k++) {
    const v = 41 + k / 12;
    const y = pr(toKm([v, 29]))[1];
    if (y < 8 || y > view.height - 8) continue;
    lines.push(`M0 ${num(T(y))}H${view.width}`);
    if (y > 40 && y < view.height - 60)
      ticks.push({ text: dm(v, "N"), at: [6, y - 5], anchor: "start" });
  }
  for (let k = 0; k < 4; k++) {
    const v = 29 + (k - 1) / 12;
    const x = pr(toKm([41.1, v]))[0];
    if (x < 8 || x > view.width - 8) continue;
    lines.push(`M${num(T(x))} 0V${view.height}`);
    // Clear of the Marmara label (bottom left) and the scale bar (bottom right).
    if (x > 170 && x < 270)
      ticks.push({ text: dm(v, "E"), at: [x + 4, view.height - 8], anchor: "start" });
  }

  const L = (
    id: string,
    lines: string[],
    p: LatLon,
    anchor: ChartLabel["anchor"],
    kind: ChartLabel["kind"],
    dx = 0,
    dy = 0
  ): ChartLabel => {
    const q = pr(toKm(p));
    return { id, lines, at: round1([q[0] + dx, q[1] + dy]), anchor, kind };
  };
  const b = BRIDGES.map((x) => {
    const [a, c] = bridgeDeck(x);
    return { id: x.id, name: x.name, a: round1(pr(a)), b: round1(pr(c)) };
  });
  const [b1, b2, b3] = b;
  const labels: ChartLabel[] = [
    L("blacksea", ["BLACK SEA"], [41.247, 29.142], "middle", "sea"),
    L("marmara", ["SEA OF", "MARMARA"], [40.9955, 28.992], "middle", "sea"),
    L("europe", ["EUROPE"], [41.152, 28.995], "middle", "land"),
    L("asia", ["ASIA"], [41.052, 29.135], "middle", "land"),
    L("tower", ["MAIDEN’S TOWER"], MAIDENS_TOWER, "start", "mark", 8, 0),
    L("arnavutkoy", ["ARNAVUTKÖY"], PLACES.arnavutkoy, "end", "place", -7, 0),
    L("kandilli", ["KANDİLLİ"], PLACES.kandilli, "start", "place", 7, 1),
    L("yenikoy", ["YENİKÖY"], PLACES.yenikoy, "end", "place", -8, 0),
    {
      id: "b1",
      lines: ["15 JULY MARTYRS"],
      at: round1([b1.b[0] + 5, b1.b[1] + 5]),
      anchor: "start",
      kind: "bridge",
    },
    {
      id: "b2",
      lines: ["FATIH SULTAN MEHMET"],
      at: round1([b2.b[0] + 5, b2.b[1]]),
      anchor: "start",
      kind: "bridge",
    },
    {
      id: "b3",
      lines: ["YAVUZ SULTAN SELİM"],
      at: round1([b3.a[0] - 5, b3.a[1]]),
      anchor: "end",
      kind: "bridge",
    },
  ];

  return {
    view,
    europe: shorePath(view, EUROPE, [
      [41.4, 28.4],
      [40.85, 28.4],
    ]),
    asia: shorePath(view, ASIA, [
      [41.4, 29.8],
      [40.8, 29.8],
    ]),
    separation: smoothPath(simplify(sep, 0.3)),
    bridges: b,
    tower: round1(pr(tower)),
    route,
    traffic,
    frame,
    widths,
    ship,
    ambient,
    arrows,
    current,
    graticule: { d: lines.join(""), ticks },
    labels,
    nm: 1.852 * view.scale,
    narrowest,
  };
}
