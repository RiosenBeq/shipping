/**
 * A ship's lines plan as line segments (DESIGN-V2 §6.3 `P-lines`): 21 stations, 8 waterlines,
 * 5 buttocks (the centreline profile and two either side), the deck outline and a deck kit —
 * pipe rack and manifold (tanker), domes and vent masts (gas), or bullet tanks (pressurised).
 *
 * A parametric hull (half-breadth as a function of length and height, shaped by the block
 * coefficient, the bow rake and the transom) so any two classes morph by interpolating their
 * numbers. Pure and framework-free: returns typed arrays the renderer uploads as they are.
 *
 * Output frame (world units, `displayScale`): x along the ship, bow +x, midships at 0;
 * y up, design waterline at 0; z athwartships, port +z.
 */
import { displayScale, type DeckKit, type HullParams } from "./classes";

export const STATIONS = 21;
export const WATERLINES = 8;
export const BUTTOCKS = 5;

/** Line weights: brass-light at .55, the design waterline at .9 (§6.3). */
export const ALPHA = { line: 0.55, dwl: 0.9, profile: 0.7, beam: 0.3, kit: 0.55 } as const;

export interface LinesGeometry {
  /** xyz per vertex, two vertices per segment. */
  position: Float32Array;
  /** Per-vertex opacity. */
  alpha: Float32Array;
  /** Position along the design waterline loop (0..1) for the light ribbon; -1 elsewhere. */
  ribbon: Float32Array;
  segments: number;
  /** Which lines were drawn (tests, debugging). */
  counts: { stations: number; waterlines: number; buttocks: number; kit: number };
  /** Bounding box in world units. */
  bounds: { min: [number, number, number]; max: [number, number, number] };
}

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

/** The hull form derived from the class parameters. */
export function hullForm(p: HullParams) {
  const half = p.B / 2;
  const r = Math.min(0.1 * p.B, 0.6 * p.T);
  const pmb = clamp((p.Cb - 0.62) * 2.4, 0.08, 0.62);
  const fe = (1 - pmb) * 0.42;
  const fr = (1 - pmb) * 0.58;
  const pe = 1.4 + (p.Cb - 0.65) * 6;
  const pr = 1.3 + (p.Cb - 0.65) * 4;

  /** Stem contour: bulb below the waterline, raked stem above it. */
  const bow = (z: number) => {
    const bulb = 0.028 * p.L * Math.exp(-(((z - 0.5 * p.T) / (0.28 * p.T)) ** 2));
    const forefoot = 0.02 * p.L * (1 - smooth(0, 0.35 * p.T, z));
    const rake = z > p.T ? p.bowRake * 4 * (z - p.T) : 0;
    return p.L + bulb - forefoot + rake;
  };
  /** Stern contour: the keel ends ahead of the transom, the transom overhangs aft. */
  const stern = (z: number) =>
    0.03 * p.L * (1 - smooth(0, 0.85 * p.T, z)) - 0.015 * p.L * smooth(0.85 * p.T, p.D, z);

  /** Half-breadth at (x along the ship from the aft perpendicular, z above the keel), m. */
  const halfBreadth = (x: number, z: number) => {
    if (z < 0 || z > p.D + 1e-6) return 0;
    const xs = stern(z);
    const xb = bow(z);
    if (x < xs || x > xb) return 0;
    const u = (x - xs) / (xb - xs);
    const sec = z < r ? (half - r + Math.sqrt(Math.max(0, r * r - (r - z) ** 2))) / half : 1;
    const ua = fr;
    const uf = 1 - fe;
    let lon = 1;
    if (u > uf) {
      const s = (u - uf) / fe;
      const peZ = pe * (0.75 + 0.5 * smooth(0, p.D, z));
      lon = 1 - Math.pow(s, peZ);
    } else if (u < ua) {
      const s = (ua - u) / ua;
      const low = 1 - Math.pow(s, pr);
      const high = 1 - (1 - p.stern) * s * s;
      lon = low + (high - low) * smooth(0.35 * p.T, 1.05 * p.T, z);
    }
    return half * sec * Math.max(0, lon);
  };

  return { half, bilge: r, parallel: pmb, bow, stern, halfBreadth };
}

/** Waterline heights (m above the keel): five up to the design waterline, three to the deck. */
export function waterlineLevels(p: HullParams): number[] {
  const below = [0.1, 0.35, 0.6, 0.85, 1].map((f) => f * p.T);
  const above = [1 / 3, 2 / 3, 1].map((f) => p.T + f * (p.D - p.T));
  return [...below, ...above];
}

type V3 = [number, number, number];

class Builder {
  pos: number[] = [];
  alpha: number[] = [];
  ribbon: number[] = [];
  constructor(
    private readonly k: number,
    private readonly p: HullParams
  ) {}
  /** Ship coordinates (x from AP, y athwartships, z above keel) → world. */
  w(x: number, y: number, z: number): V3 {
    return [(x - this.p.L / 2) * this.k, (z - this.p.T) * this.k, y * this.k];
  }
  seg(a: V3, b: V3, alpha: number, ra = -1, rb = -1) {
    this.pos.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    this.alpha.push(alpha, alpha);
    this.ribbon.push(ra, rb);
  }
  poly(points: V3[], alpha: number, ribbon?: number[]) {
    for (let i = 0; i < points.length - 1; i++)
      this.seg(points[i], points[i + 1], alpha, ribbon?.[i] ?? -1, ribbon?.[i + 1] ?? -1);
  }
  ring(cx: number, cy: number, cz: number, r: number, axis: "x" | "y", alpha: number, n = 20) {
    const pts: V3[] = [];
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const c = Math.cos(a) * r;
      const s = Math.sin(a) * r;
      pts.push(axis === "x" ? this.w(cx, cy + c, cz + s) : this.w(cx + c, cy + s, cz));
    }
    this.poly(pts, alpha);
  }
  box(x0: number, x1: number, hw: number, z0: number, z1: number, alpha: number) {
    const c = (x: number, y: number, z: number) => this.w(x, y, z);
    for (const z of [z0, z1]) {
      this.seg(c(x0, -hw, z), c(x1, -hw, z), alpha);
      this.seg(c(x0, hw, z), c(x1, hw, z), alpha);
      this.seg(c(x0, -hw, z), c(x0, hw, z), alpha);
      this.seg(c(x1, -hw, z), c(x1, hw, z), alpha);
    }
    for (const x of [x0, x1]) for (const y of [-hw, hw]) this.seg(c(x, y, z0), c(x, y, z1), alpha);
  }
}

function stations(b: Builder, p: HullParams, f: ReturnType<typeof hullForm>): number {
  const steps = 18;
  let drawn = 0;
  for (let i = 0; i < STATIONS; i++) {
    const x = (i / (STATIONS - 1)) * p.L;
    for (const side of [1, -1]) {
      let prev: V3 | null = null;
      for (let k = 0; k <= steps; k++) {
        const z = (k / steps) * p.D;
        const y = f.halfBreadth(x, z);
        const pt = y > 1e-3 ? b.w(x, side * y, z) : null;
        if (pt && prev) b.seg(prev, pt, ALPHA.line);
        prev = pt;
      }
    }
    // Flat of bottom and deck beam close the section.
    const z0 = [...Array(steps + 1).keys()]
      .map((k) => (k / steps) * p.D)
      .find((z) => f.halfBreadth(x, z) > 1e-3);
    if (z0 !== undefined) {
      const y0 = f.halfBreadth(x, z0);
      b.seg(b.w(x, -y0, z0), b.w(x, y0, z0), ALPHA.beam);
      const yd = f.halfBreadth(x, p.D);
      if (yd > 1e-3) b.seg(b.w(x, -yd, p.D), b.w(x, yd, p.D), ALPHA.beam);
      drawn++;
    }
  }
  return drawn;
}

function waterlines(b: Builder, p: HullParams, f: ReturnType<typeof hullForm>): number {
  const n = 64;
  let drawn = 0;
  for (const z of waterlineLevels(p)) {
    const dwl = Math.abs(z - p.T) < 1e-6;
    const xs = f.stern(z);
    const xb = f.bow(z);
    const star: V3[] = [];
    const port: V3[] = [];
    for (let i = 0; i <= n; i++) {
      const x = xs + ((xb - xs) * i) / n;
      const y = f.halfBreadth(x, z);
      star.push(b.w(x, -y, z));
      port.push(b.w(x, y, z));
    }
    const alpha = dwl ? ALPHA.dwl : ALPHA.line;
    // The design waterline carries the ribbon: starboard stern→bow (0..½), port bow→stern (½..1).
    const rs = dwl ? star.map((_, i) => (i / n) * 0.5) : undefined;
    const rp = dwl ? port.map((_, i) => 1 - (i / n) * 0.5) : undefined;
    b.poly(star, alpha, rs);
    b.poly(port, alpha, rp);
    // Transom across the stern where the waterline meets it with some breadth.
    const yt = f.halfBreadth(xs, z);
    if (yt > 1e-3) b.seg(star[0], port[0], alpha);
    drawn++;
  }
  return drawn;
}

/** Marching squares of halfBreadth − offset over the profile plane. */
function buttock(
  b: Builder,
  p: HullParams,
  f: ReturnType<typeof hullForm>,
  offset: number,
  side: number
) {
  const nx = 80;
  const nz = 20;
  const x0 = -0.03 * p.L;
  const x1 = 1.06 * p.L;
  const X = (i: number) => x0 + ((x1 - x0) * i) / nx;
  const Z = (j: number) => (p.D * j) / nz;
  const val: number[] = [];
  for (let j = 0; j <= nz; j++)
    for (let i = 0; i <= nx; i++) val.push(f.halfBreadth(X(i), Z(j)) - offset);
  const at = (i: number, j: number) => val[j * (nx + 1) + i];
  const lerp = (a: number, bb: number) => a / (a - bb);
  for (let j = 0; j < nz; j++)
    for (let i = 0; i < nx; i++) {
      const a = at(i, j);
      const c1 = at(i + 1, j);
      const c2 = at(i + 1, j + 1);
      const c3 = at(i, j + 1);
      const pts: [number, number][] = [];
      if (a > 0 !== c1 > 0) pts.push([X(i) + (X(i + 1) - X(i)) * lerp(a, c1), Z(j)]);
      if (c1 > 0 !== c2 > 0) pts.push([X(i + 1), Z(j) + (Z(j + 1) - Z(j)) * lerp(c1, c2)]);
      if (c3 > 0 !== c2 > 0) pts.push([X(i) + (X(i + 1) - X(i)) * lerp(c3, c2), Z(j + 1)]);
      if (a > 0 !== c3 > 0) pts.push([X(i), Z(j) + (Z(j + 1) - Z(j)) * lerp(a, c3)]);
      for (let k = 0; k + 1 < pts.length; k += 2)
        b.seg(
          b.w(pts[k][0], side * offset, pts[k][1]),
          b.w(pts[k + 1][0], side * offset, pts[k + 1][1]),
          ALPHA.line
        );
    }
}

function profile(b: Builder, p: HullParams, f: ReturnType<typeof hullForm>) {
  const n = 24;
  const stem: V3[] = [];
  const stern: V3[] = [];
  for (let k = 0; k <= n; k++) {
    const z = (k / n) * p.D;
    stem.push(b.w(f.bow(z), 0, z));
    stern.push(b.w(f.stern(z), 0, z));
  }
  b.poly(stem, ALPHA.profile);
  b.poly(stern, ALPHA.profile);
  b.seg(b.w(f.stern(0), 0, 0), b.w(f.bow(0), 0, 0), ALPHA.profile);
  // Deck edge either side (the sheer line), stem to transom.
  for (const side of [1, -1]) {
    const pts: V3[] = [];
    const xs = f.stern(p.D);
    const xb = f.bow(p.D);
    for (let i = 0; i <= 48; i++) {
      const x = xs + ((xb - xs) * i) / 48;
      pts.push(b.w(x, side * f.halfBreadth(x, p.D), p.D));
    }
    b.poly(pts, ALPHA.profile);
  }
}

function deckKit(
  b: Builder,
  p: HullParams,
  f: ReturnType<typeof hullForm>,
  kit: DeckKit,
  count: number,
  weight: number
): number {
  if (weight <= 0.001) return 0;
  const a = ALPHA.kit * weight;
  const before = b.pos.length;
  const L = p.L;
  const B = p.B;
  const D = p.D;
  const house = clamp(0.065 * L, 9, 24);
  // Accommodation aft, bridge wings, funnel, mast; the foremast on the forecastle.
  b.box(0.02 * L, 0.12 * L, 0.42 * B, D, D + house, a);
  b.seg(b.w(0.1 * L, -0.5 * B, D + house), b.w(0.1 * L, 0.5 * B, D + house), a);
  b.box(0.028 * L, 0.06 * L, 0.1 * B, D + house * 0.7, D + house * 1.28, a);
  b.seg(b.w(0.09 * L, 0, D + house), b.w(0.09 * L, 0, D + house * 1.35), a);
  b.seg(b.w(0.94 * L, 0, D), b.w(0.94 * L, 0, D + house * 0.5), a);
  b.seg(b.w(0.94 * L, -0.08 * B, D + house * 0.42), b.w(0.94 * L, 0.08 * B, D + house * 0.42), a);

  if (kit === "tanker") {
    const rack = Math.max(1.6, 0.012 * L);
    b.seg(b.w(0.14 * L, 0, D + rack), b.w(0.9 * L, 0, D + rack), a);
    for (let x = 0.15; x <= 0.9; x += 0.05) b.seg(b.w(x * L, 0, D), b.w(x * L, 0, D + rack), a);
    for (const dx of [-0.012, 0, 0.012]) {
      const x = (0.5 + dx) * L;
      const hw = f.halfBreadth(x, D) * 0.92;
      b.seg(b.w(x, -hw, D + rack * 0.7), b.w(x, hw, D + rack * 0.7), a);
    }
    const cx = 0.535 * L;
    const cy = 0.3 * B;
    b.seg(b.w(cx, cy, D), b.w(cx, cy, D + house * 0.75), a);
    b.seg(b.w(cx, cy, D + house * 0.68), b.w(cx + 0.07 * L, cy * 0.2, D + house * 0.5), a);
  } else if (kit === "gas") {
    const trunk = Math.max(1.5, 0.08 * D);
    b.box(0.17 * L, 0.88 * L, 0.3 * B, D, D + trunk, a);
    for (let i = 0; i < count; i++) {
      const x = (0.24 + (0.6 * (i + 0.5)) / count) * L;
      const r = 0.07 * B;
      b.ring(x, 0, D + trunk + 0.6, r, "y", a);
      b.ring(x, 0, D + trunk + 1.6, r * 0.7, "y", a);
      const vx = x + 0.035 * L;
      b.seg(b.w(vx, 0.18 * B, D + trunk), b.w(vx, 0.18 * B, D + trunk + house * 0.95), a);
      b.seg(
        b.w(vx - 0.01 * L, 0.18 * B, D + trunk + house * 0.95),
        b.w(vx + 0.01 * L, 0.18 * B, D + trunk + house * 0.95),
        a
      );
    }
  } else {
    const span = (0.66 * L) / count;
    const len = span * 0.86;
    const r = Math.min(0.2 * B, 0.42 * D);
    const zc = D + r + 0.6;
    for (let i = 0; i < count; i++) {
      const xa = 0.18 * L + i * span;
      const xb = xa + len;
      for (let k = 0; k <= 4; k++) b.ring(xa + ((xb - xa) * k) / 4, 0, zc, r, "x", a, 18);
      for (const [y, z] of [
        [0, r],
        [0, -r],
        [r, 0],
        [-r, 0],
      ])
        b.seg(b.w(xa, y, zc + z), b.w(xb, y, zc + z), a);
      // Hemispherical heads.
      for (const [x, s] of [
        [xa - 0.55 * r, 0.82],
        [xa - 0.9 * r, 0.42],
        [xb + 0.55 * r, 0.82],
        [xb + 0.9 * r, 0.42],
      ])
        b.ring(x, 0, zc, r * s, "x", a, 14);
      b.seg(
        b.w(xb - 0.2 * len, 0.5 * r, zc + r),
        b.w(xb - 0.2 * len, 0.5 * r, zc + r + house * 0.55),
        a
      );
    }
  }
  return (b.pos.length - before) / 6;
}

/**
 * Build the lines plan for one moment of a morph: the hull from `params`, the outgoing kit at
 * weight 1 − kitMix and the incoming one at kitMix (one kit when they are the same).
 */
export function buildLines(
  params: HullParams,
  kitFrom: { kit: DeckKit; count: number },
  kitTo: { kit: DeckKit; count: number } = kitFrom,
  kitMix = 1
): LinesGeometry {
  const f = hullForm(params);
  const b = new Builder(displayScale(params.L), params);
  const counts = { stations: 0, waterlines: 0, buttocks: 0, kit: 0 };
  counts.stations = stations(b, params, f);
  counts.waterlines = waterlines(b, params, f);
  profile(b, params, f);
  for (const off of [0.3, 0.62])
    for (const side of [1, -1]) buttock(b, params, f, off * f.half, side);
  counts.buttocks = 1 + 4;
  const same = kitFrom.kit === kitTo.kit && kitFrom.count === kitTo.count;
  if (same) counts.kit += deckKit(b, params, f, kitTo.kit, kitTo.count, 1);
  else {
    counts.kit += deckKit(b, params, f, kitFrom.kit, kitFrom.count, 1 - kitMix);
    counts.kit += deckKit(b, params, f, kitTo.kit, kitTo.count, kitMix);
  }
  const position = new Float32Array(b.pos);
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < position.length; i += 3)
    for (let c = 0; c < 3; c++) {
      min[c] = Math.min(min[c], position[i + c]);
      max[c] = Math.max(max[c], position[i + c]);
    }
  return {
    position,
    alpha: new Float32Array(b.alpha),
    ribbon: new Float32Array(b.ribbon),
    segments: position.length / 6,
    counts,
    bounds: { min, max },
  };
}
