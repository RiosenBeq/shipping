/**
 * Builds the footer's Bosphorus chart from `geo.ts` for one view (rotation, scale, size): shore
 * and land paths, the channel's stations (west and east shore along the centreline's normals),
 * the traffic lanes, bridge glyphs, label anchors and the ship's starting point. Pure and
 * deterministic; runs on the server (the browser gets path strings, not this module).
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

/** Direction in the view (unit, y down) of a compass bearing (degrees clockwise from north). */
export function bearingInView(view: ChartView, bearing: number): Pt {
  const a = ((90 - bearing + view.rotate) * Math.PI) / 180;
  return [Math.cos(a), -Math.sin(a)];
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
};

/** Half-width cap at the open ends (Marmara, Black Sea) and across inlets, km. */
const MAX_HALF = 1.5;
/** Station spacing along the centreline, km. */
export const STATION_STEP = 0.2;

const EU_KM: Pt[] = EUROPE.map((p) => toKm(p));
const AS_KM: Pt[] = ASIA.map((p) => toKm(p));

/**
 * The channel: stations every 200 m from the Marmara approach to the Black Sea. The guide line
 * is re-centred between the shores four times (each pass moves every station to the midpoint
 * of its normal's shore hits, then smooths), so the centreline follows the real channel through
 * the bends.
 */
export function channel(): Station[] {
  let c = resample(sampleBeziers(catmullRom(GUIDE.map((p) => toKm(p))), 12), STATION_STEP);
  const hits = (q: Pt[]) =>
    q.map((ci, i) => {
      const t = tangent(q, i);
      const left: Pt = [-t[1], t[0]]; // west of a northbound heading
      const right: Pt = [t[1], -t[0]];
      const w = rayHit(ci, left, EU_KM, 6);
      const e = rayHit(ci, right, AS_KM, 6);
      return { ci, left, right, w, e };
    });
  for (let pass = 0; pass < 4; pass++) {
    const moved = hits(c).map(({ ci, right, w, e }) => {
      const hw = Math.min(w ? len(sub(w, ci)) : MAX_HALF, MAX_HALF);
      const he = Math.min(e ? len(sub(e, ci)) : MAX_HALF, MAX_HALF);
      return add(ci, mul(right, (he - hw) / 2));
    });
    c = resample(smooth(moved, 4), STATION_STEP);
  }
  const st = hits(c).map(({ ci, left, right, w, e }) => {
    const hw = Math.min(w ? len(sub(w, ci)) : MAX_HALF, MAX_HALF);
    const he = Math.min(e ? len(sub(e, ci)) : MAX_HALF, MAX_HALF);
    return {
      c: ci,
      w: add(ci, mul(left, hw)),
      e: add(ci, mul(right, he)),
      width: w && e ? len(sub(e, w)) : hw + he,
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

/** Lane centre lines (km): northbound keeps to the Asian side, southbound to the European. */
export function lanes(st: Station[]) {
  const lane = (side: "w" | "e") =>
    smooth(
      st.map((s) => {
        const half = len(sub(s[side], s.c));
        const off = Math.min(0.48 * half, 0.42);
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

const f = (n: number) => {
  const r = Math.round(n * 10) / 10;
  return Object.is(r, -0) ? "0" : String(r);
};
const P = (p: Pt) => `${f(p[0])} ${f(p[1])}`;

/** Polyline → smoothed cubic path. */
export function smoothPath(p: Pt[]): string {
  if (p.length < 2) return "";
  const segs = catmullRom(p);
  return `M${P(segs[0][0])}` + segs.map(([, b, c, d]) => `C${P(b)} ${P(c)} ${P(d)}`).join("");
}

/** Polyline → straight-segment path. */
export function linePath(p: Pt[]): string {
  return p.map((q, i) => `${i ? "L" : "M"}${P(q)}`).join("");
}

/** Whether a view point lies within the view expanded by `m` px. */
const within = (view: ChartView, q: Pt, m: number) =>
  q[0] >= -m && q[1] >= -m && q[0] <= view.width + m && q[1] <= view.height + m;

/**
 * A shore in view px: simplified finely where it can be seen and coarsely elsewhere, smoothed
 * once. `stroke` holds only the visible runs (the hairline); `fill` closes the full line through
 * `close` (points far inland) for the land tint. Both share the same curves.
 */
export function shorePaths(view: ChartView, line: readonly LatLon[], close: LatLon[]) {
  const pr = projector(view);
  const pts = line.map((p) => pr(toKm(p)));
  const M = 40;
  // Split into runs inside / outside the padded view, simplify each at its own tolerance.
  const runs: { inside: boolean; p: Pt[] }[] = [];
  pts.forEach((q, i) => {
    const inside = within(view, q, M);
    const last = runs[runs.length - 1];
    if (!last || last.inside !== inside) {
      // Each run starts at the previous run's last point, so they join exactly.
      runs.push({ inside, p: i ? [pts[i - 1], q] : [q] });
    } else last.p.push(q);
  });
  const simple: Pt[] = [];
  for (const r of runs) {
    const s = simplify(r.p, r.inside ? 0.45 : 8);
    simple.push(...(simple.length ? s.slice(1) : s));
  }
  const segs = catmullRom(simple);
  let stroke = "";
  let open = false;
  for (const [a, b, c, d] of segs) {
    const show = within(view, a, M) || within(view, d, M);
    if (show) {
      if (!open) stroke += `M${P(a)}`;
      stroke += `C${P(b)} ${P(c)} ${P(d)}`;
    }
    open = show;
  }
  const fill =
    `M${P(segs[0][0])}` +
    segs.map(([, b, c, d]) => `C${P(b)} ${P(c)} ${P(d)}`).join("") +
    close.map((p) => `L${P(pr(toKm(p)))}`).join("") +
    "Z";
  return { stroke, fill };
}

export type ChartLabel = {
  id: string;
  text: string;
  /** Anchor in view px. */
  at: Pt;
  kind: "sea" | "land" | "place" | "bridge" | "mark";
};

export type Chart = {
  view: ChartView;
  europe: { stroke: string; fill: string };
  asia: { stroke: string; fill: string };
  /** Lanes as smoothed paths (view px). `north` starts abeam Maiden's Tower. */
  north: string;
  south: string;
  separation: string;
  /** Bridge decks (view px). */
  bridges: { id: Bridge["id"]; name: string; a: Pt; b: Pt }[];
  maidensTower: Pt;
  /** Station frame for the current streaks: [wx, wy, ex, ey] per station, view px. */
  frame: [number, number, number, number][];
  /** Width of the channel at each frame station, km. */
  widths: number[];
  /** The tanker at rest: abeam Maiden's Tower, heading (degrees, view, clockwise from +x). */
  ship: { at: Pt; heading: number };
  /** Southbound ships at rest (fractions of the southbound lane), with headings. */
  ambient: { at: Pt; heading: number }[];
  /** Direction-of-traffic chevrons: points and headings on each lane. */
  arrows: { at: Pt; heading: number; lane: "north" | "south" }[];
  /** Surface current marks (north → south), on the separation line. */
  current: { at: Pt; heading: number }[];
  labels: ChartLabel[];
  /** North in the view (unit vector, y down). */
  north0: Pt;
  /** Narrowest width found, km (for the text alternative and tests). */
  narrowest: number;
};

const headingOf = (a: Pt, b: Pt) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;

/** Point and heading at fraction `t` (0..1) of a view-px polyline. */
export function along(p: Pt[], t: number): { at: Pt; heading: number } {
  const total = polyLength(p);
  let d = Math.max(0, Math.min(1, t)) * total;
  for (let i = 1; i < p.length; i++) {
    const l = len(sub(p[i], p[i - 1]));
    if (d <= l || i === p.length - 1) {
      return { at: lerp(p[i - 1], p[i], l ? Math.min(1, d / l) : 0), heading: headingOf(p[i - 1], p[i]) };
    }
    d -= l;
  }
  return { at: p[0], heading: 0 };
}

/** Everything the chart component draws, for one view. */
export function buildChart(view: ChartView): Chart {
  const pr = projector(view);
  const st = channel();
  const ln = lanes(st);
  const mt = toKm(MAIDENS_TOWER);
  const i0 = nearestStation(st, mt);
  const northPx = ln.north.slice(i0).map(pr);
  const southPx = ln.south.map(pr).reverse();
  const sepPx = ln.separation.map(pr);
  const lanePx = (p: Pt[]) => simplify(p, 0.3);

  const europe = shorePaths(view, EUROPE, [
    [41.32, 28.5],
    [40.9, 28.5],
  ]);
  const asia = shorePaths(view, ASIA, [
    [41.3, 29.7],
    [40.85, 29.7],
  ]);

  const startDir = norm(sub(northPx[1], northPx[0]));
  const ship = { at: northPx[0], heading: (Math.atan2(startDir[1], startDir[0]) * 180) / Math.PI };
  const ambient = [0.22, 0.55, 0.83].map((t) => along(southPx, t));

  const arrows: Chart["arrows"] = [];
  for (const t of [0.2, 0.5, 0.8]) {
    arrows.push({ ...along(northPx, t), lane: "north" });
    arrows.push({ ...along(southPx, 1 - t), lane: "south" });
  }
  const current = [0.3, 0.62].map((t) => {
    const a = along(sepPx, t);
    return { at: a.at, heading: a.heading + 180 };
  });

  const frame = st
    .filter((_, i) => i % 2 === 0)
    .map((s) => {
      const w = pr(s.w);
      const e = pr(s.e);
      return [w[0], w[1], e[0], e[1]].map((n) => Math.round(n * 10) / 10) as [
        number,
        number,
        number,
        number,
      ];
    });
  const widths = st.filter((_, i) => i % 2 === 0).map((s) => Math.round(s.width * 100) / 100);
  // The narrows: only where both shores were hit, away from the open ends.
  const narrowest = Math.min(...st.slice(5, -5).map((s) => s.width));

  const label = (id: string, text: string, p: LatLon, kind: ChartLabel["kind"]) => ({
    id,
    text,
    at: pr(toKm(p)),
    kind,
  });
  const labels: ChartLabel[] = [
    label("marmara", "SEA OF MARMARA", [40.997, 28.999], "sea"),
    label("blacksea", "BLACK SEA", [41.252, 29.14], "sea"),
    label("europe", "EUROPE", [41.15, 29.0], "land"),
    label("asia", "ASIA", [41.07, 29.12], "land"),
    label("tower", "MAIDEN'S TOWER", MAIDENS_TOWER, "mark"),
    label("arnavutkoy", "ARNAVUTKÖY", PLACES.arnavutkoy, "place"),
    label("kandilli", "KANDİLLİ", PLACES.kandilli, "place"),
    label("yenikoy", "YENİKÖY", PLACES.yenikoy, "place"),
    ...BRIDGES.map((b) => label(b.id, b.name.toUpperCase(), b.at, "bridge")),
  ];

  return {
    view,
    europe,
    asia,
    north: smoothPath(lanePx(northPx)),
    south: smoothPath(lanePx(southPx)),
    separation: smoothPath(lanePx(sepPx)),
    bridges: BRIDGES.map((b) => {
      const [a, c] = bridgeDeck(b);
      return { id: b.id, name: b.name, a: pr(a), b: pr(c) };
    }),
    maidensTower: pr(mt),
    frame,
    widths,
    ship,
    ambient,
    arrows,
    current,
    labels,
    north0: bearingInView(view, 0),
    narrowest,
  };
}
