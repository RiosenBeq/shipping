/**
 * Hull data for the `P-hero` plate ("Lines to light"): the repo's P-lines hull form
 * (lines/classes.ts, lines/geometry.ts — hullForm, waterlineLevels, displayScale) drawn as
 *  1. an instanced fat-line lines plan (21 stations, 8 waterlines, 2×2 buttocks, profile,
 *     sheer, deck kit) with per-segment data the light needs: outward normal (hidden-line
 *     dimming), arc length along its chain (light trails), reveal order (draw-in from the stem,
 *     rising from the waterline) and the design-waterline ribbon parameter;
 *  2. a closed glass surface of the same form (sides, bottom, deck, transom), analytic normals;
 *  3. the design waterline as numbers for the sea shader's hull distance field.
 *
 * Frames as in geometry.ts: world x along the ship (bow +x, midships 0), y up (design waterline
 * 0), z athwartships (port +z). Ship coordinates: x from the aft perpendicular, y athwartships,
 * z above keel.
 */
import { SHIP_CLASSES, displayScale, type HullParams, type ShipClassSlug } from "../../lines/classes";
import { ALPHA, STATIONS, hullForm, waterlineLevels } from "../../lines/geometry";

export const KIND = {
  station: 0,
  beam: 1,
  waterline: 2,
  dwl: 3,
  profile: 4,
  sheer: 5,
  buttock: 6,
  kit: 7,
} as const;

type V3 = [number, number, number];
type HullForm = ReturnType<typeof hullForm>;

export interface HullSpec {
  p: HullParams;
  f: HullForm;
  k: number;
}

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const unit = (v: V3): V3 => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};

export function hullSpec(slug: ShipClassSlug = "vlcc"): HullSpec {
  const p = SHIP_CLASSES[slug].params;
  return { p, f: hullForm(p), k: displayScale(p.L) };
}

interface PolyOpts {
  trail?: boolean;
  ribbon?: number[] | null;
  normal?: V3 | null;
  edgeUp?: boolean;
}

class LineBuilder {
  A: number[] = [];
  B: number[] = [];
  N: number[] = [];
  /** alpha, kind, chain hash, trail flag */
  M: number[] = [];
  /** ribbon at A, B */
  R: number[] = [];
  /** arc length at A, B */
  S: number[] = [];
  chain = 0;

  constructor(
    readonly p: HullParams,
    readonly f: HullForm,
    readonly k: number
  ) {}

  w(x: number, y: number, z: number): V3 {
    const { p, k } = this;
    return [(x - p.L / 2) * k, (z - p.T) * k, y * k];
  }

  /** Outward normal (world) of the hull surface |y| = hb(x, z) at a ship point. */
  n(x: number, y: number, z: number): V3 {
    const { f, p } = this;
    const e = 0.004 * p.L;
    const hx = (f.halfBreadth(x + e, z) - f.halfBreadth(x - e, z)) / (2 * e);
    const z1 = Math.min(z + e, p.D);
    const z0 = Math.max(z - e, 0);
    const hz = z1 > z0 ? (f.halfBreadth(x, z1) - f.halfBreadth(x, z0)) / (z1 - z0) : 0;
    return unit([-hx, -hz, Math.sign(y) || 1]);
  }

  push(a: V3, b: V3, na: V3, nb: V3, alpha: number, kind: number, trail: boolean, ra: number, rb: number, sa: number, sb: number) {
    this.A.push(...a);
    this.B.push(...b);
    this.N.push(...unit([na[0] + nb[0], na[1] + nb[1], na[2] + nb[2]]));
    this.M.push(alpha, kind, hash(this.chain + 1), trail ? 1 : 0);
    this.R.push(ra, rb);
    this.S.push(sa, sb);
  }

  /** A polyline of ship points; normals from the surface or a fixed world normal. */
  poly(pts: V3[], alpha: number, kind: number, o: PolyOpts = {}) {
    if (pts.length < 2) return;
    const { trail = false, ribbon = null, normal = null, edgeUp = false } = o;
    this.chain++;
    const W = pts.map((q) => this.w(q[0], q[1], q[2]));
    const Nn = pts.map((q): V3 => {
      if (normal) return normal;
      const s = this.n(q[0], q[1], q[2]);
      return edgeUp ? unit([s[0], s[1] + 1, s[2]]) : s;
    });
    let s = 0;
    for (let i = 0; i < W.length - 1; i++) {
      const a = W[i];
      const b = W[i + 1];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      this.push(a, b, Nn[i], Nn[i + 1], alpha, kind, trail, ribbon ? ribbon[i] : -1, ribbon ? ribbon[i + 1] : -1, s, s + len);
      s += len;
    }
  }

  seg(a: V3, b: V3, alpha: number, kind: number, normal: V3) {
    this.poly([a, b], alpha, kind, { normal });
  }

  box(x0: number, x1: number, hw: number, z0: number, z1: number, alpha: number, tiers = 0) {
    const up: V3 = [0, 1, 0];
    for (const z of [z0, z1]) this.loop(x0, x1, hw, z, alpha);
    for (const x of [x0, x1])
      for (const y of [-hw, hw]) this.seg([x, y, z0], [x, y, z1], alpha, KIND.kit, up);
    for (let t = 1; t < tiers; t++) this.loop(x0, x1, hw, z0 + ((z1 - z0) * t) / tiers, alpha * 0.7);
  }

  loop(x0: number, x1: number, hw: number, z: number, alpha: number) {
    const pts: V3[] = [[x0, -hw, z], [x1, -hw, z], [x1, hw, z], [x0, hw, z], [x0, -hw, z]];
    this.poly(pts, alpha, KIND.kit, { normal: [0, 1, 0] });
  }
}

export interface LinesPlan {
  count: number;
  A: Float32Array;
  B: Float32Array;
  N: Float32Array;
  M: Float32Array;
  R: Float32Array;
  S: Float32Array;
  V: Float32Array;
}

/**
 * The lines plan as instanced fat-line attributes. `detail` (0.5..1) thins the polyline
 * sampling for lighter tiers (phones): same lines, fewer segments.
 */
export function buildLinesPlan(spec: HullSpec, detail = 1): LinesPlan {
  const { p, f, k } = spec;
  const b = new LineBuilder(p, f, k);
  const T = p.T;
  const D = p.D;
  const L = p.L;
  const B = p.B;
  const q = (n: number) => Math.max(8, Math.round(n * detail));

  // Stations (21), each side a polyline keel → deck; flat-of-bottom and deck beams close them.
  const steps = q(22);
  for (let i = 0; i < STATIONS; i++) {
    const x = (i / (STATIONS - 1)) * L;
    const trail = i % 4 === 2;
    for (const side of [1, -1]) {
      let run: V3[] = [];
      for (let kk = 0; kk <= steps; kk++) {
        const z = (kk / steps) * D;
        const y = f.halfBreadth(x, z);
        if (y > 1e-3) run.push([x, side * y, z]);
        else if (run.length) {
          b.poly(run, ALPHA.line, KIND.station, { trail });
          run = [];
        }
      }
      if (run.length) b.poly(run, ALPHA.line, KIND.station, { trail });
    }
    let z0: number | undefined;
    for (let kk = 0; kk <= steps; kk++) {
      const z = (kk / steps) * D;
      if (f.halfBreadth(x, z) > 1e-3) {
        z0 = z;
        break;
      }
    }
    if (z0 !== undefined) {
      const y0 = f.halfBreadth(x, z0);
      b.seg([x, -y0, z0], [x, y0, z0], ALPHA.beam, KIND.beam, [0, -1, 0]);
      const yd = f.halfBreadth(x, D);
      if (yd > 1e-3) b.seg([x, -yd, D], [x, yd, D], ALPHA.beam, KIND.beam, [0, 1, 0]);
    }
  }

  // Waterlines (8); the design waterline carries the ribbon (starboard stern→bow 0..½, port
  // bow→stern ½..1).
  const n = q(72);
  waterlineLevels(p).forEach((z, li) => {
    const dwl = Math.abs(z - T) < 1e-6;
    const xs = f.stern(z);
    const xb = f.bow(z);
    const star: V3[] = [];
    const port: V3[] = [];
    for (let i = 0; i <= n; i++) {
      const x = xs + ((xb - xs) * i) / n;
      const y = f.halfBreadth(x, z);
      star.push([x, -y, z]);
      port.push([x, y, z]);
    }
    const alpha = dwl ? ALPHA.dwl : ALPHA.line;
    const kind = dwl ? KIND.dwl : KIND.waterline;
    const trail = dwl || li === 2 || li === 6;
    b.poly(star, alpha, kind, { trail, ribbon: dwl ? star.map((_, i) => (i / n) * 0.5) : null });
    b.poly(port.slice().reverse(), alpha, kind, {
      trail,
      ribbon: dwl ? port.map((_, i) => 0.5 + (i / n) * 0.5) : null,
    });
    const yt = f.halfBreadth(xs, z);
    if (yt > 1e-3) b.seg(star[0], port[0], alpha, kind, [-1, 0, 0]);
  });

  // Profile: stem, stern contour, keel; the sheer line either side.
  const np = q(28);
  const stem: V3[] = [];
  const stern: V3[] = [];
  for (let kk = 0; kk <= np; kk++) {
    const z = (kk / np) * D;
    stem.push([f.bow(z), 0, z]);
    stern.push([f.stern(z), 0, z]);
  }
  b.poly(stem, ALPHA.profile, KIND.profile, { trail: true, normal: [1, 0, 0] });
  b.poly(stern, ALPHA.profile, KIND.profile, { normal: [-1, 0, 0] });
  b.poly([[f.stern(0), 0, 0], [f.bow(0), 0, 0]], ALPHA.profile, KIND.profile, {
    trail: true,
    normal: [0, -1, 0],
  });
  const ns = q(64);
  for (const side of [1, -1]) {
    const pts: V3[] = [];
    const xs = f.stern(D);
    const xb = f.bow(D);
    for (let i = 0; i <= ns; i++) {
      const x = xs + ((xb - xs) * i) / ns;
      pts.push([x, side * f.halfBreadth(x, D), D]);
    }
    b.poly(pts, ALPHA.profile, KIND.sheer, { trail: true, edgeUp: true });
  }

  // Buttocks: marching squares of halfBreadth − offset over the profile plane (as geometry.ts).
  for (const off of [0.3, 0.62])
    for (const side of [1, -1]) {
      const offset = off * f.half;
      const nx = q(96);
      const nz = 24;
      const x0 = -0.03 * L;
      const x1 = 1.06 * L;
      const X = (i: number) => x0 + ((x1 - x0) * i) / nx;
      const Z = (j: number) => (D * j) / nz;
      const val: number[] = [];
      for (let j = 0; j <= nz; j++)
        for (let i = 0; i <= nx; i++) val.push(f.halfBreadth(X(i), Z(j)) - offset);
      const at = (i: number, j: number) => val[j * (nx + 1) + i];
      const lerp = (a: number, c: number) => a / (a - c);
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
          for (let s = 0; s + 1 < pts.length; s += 2)
            b.poly(
              [
                [pts[s][0], side * offset, pts[s][1]],
                [pts[s + 1][0], side * offset, pts[s + 1][1]],
              ],
              ALPHA.line * 0.9,
              KIND.buttock
            );
        }
    }

  // Deck kit (tanker): accommodation with deck tiers, bridge wings, funnel, masts, pipe rack,
  // manifold and hose crane — as geometry.ts, plus the tiers for an architect's elevation.
  const a = ALPHA.kit;
  const up: V3 = [0, 1, 0];
  const house = clamp(0.065 * L, 9, 24);
  b.box(0.02 * L, 0.12 * L, 0.42 * B, D, D + house, a, 5);
  b.seg([0.1 * L, -0.5 * B, D + house], [0.1 * L, 0.5 * B, D + house], a, KIND.kit, up);
  b.box(0.028 * L, 0.06 * L, 0.1 * B, D + house * 0.7, D + house * 1.28, a);
  b.seg([0.09 * L, 0, D + house], [0.09 * L, 0, D + house * 1.35], a, KIND.kit, up);
  b.seg([0.94 * L, 0, D], [0.94 * L, 0, D + house * 0.5], a, KIND.kit, up);
  b.seg([0.94 * L, -0.08 * B, D + house * 0.42], [0.94 * L, 0.08 * B, D + house * 0.42], a, KIND.kit, up);
  const rack = Math.max(1.6, 0.012 * L);
  b.poly([[0.14 * L, 0, D + rack], [0.9 * L, 0, D + rack]], a, KIND.kit, { normal: up, trail: true });
  for (let x = 0.15; x <= 0.9001; x += 0.05) b.seg([x * L, 0, D], [x * L, 0, D + rack], a * 0.8, KIND.kit, up);
  for (const dx of [-0.012, 0, 0.012]) {
    const x = (0.5 + dx) * L;
    const hw = f.halfBreadth(x, D) * 0.92;
    b.seg([x, -hw, D + rack * 0.7], [x, hw, D + rack * 0.7], a, KIND.kit, up);
  }
  const cx = 0.535 * L;
  const cy = 0.3 * B;
  b.seg([cx, cy, D], [cx, cy, D + house * 0.75], a, KIND.kit, up);
  b.seg([cx, cy, D + house * 0.68], [cx + 0.07 * L, cy * 0.2, D + house * 0.5], a, KIND.kit, up);

  // Reveal: a front of light leaves the stem at the waterline and runs aft, each line climbing
  // out of the waterline (the tide) — 80 % distance from the stem, 20 % height off the water.
  const stemW = b.w(f.bow(T), 0, T);
  const count = b.A.length / 3;
  let maxD = 0;
  const raw = new Float32Array(count * 2);
  for (let i = 0; i < count; i++)
    for (let e = 0; e < 2; e++) {
      const P = e ? b.B : b.A;
      const dd = Math.hypot(P[i * 3] - stemW[0], P[i * 3 + 1] * 0.6, P[i * 3 + 2]);
      raw[i * 2 + e] = dd;
      maxD = Math.max(maxD, dd);
    }
  let maxY = 0;
  for (let i = 0; i < count; i++) maxY = Math.max(maxY, Math.abs(b.A[i * 3 + 1]), Math.abs(b.B[i * 3 + 1]));
  const delay: Record<number, [number, number]> = {
    [KIND.dwl]: [0, 0.62],
    [KIND.profile]: [0.02, 0.8],
    [KIND.sheer]: [0.05, 0.8],
    [KIND.waterline]: [0.06, 0.86],
    [KIND.station]: [0.08, 0.86],
    [KIND.beam]: [0.2, 0.75],
    [KIND.buttock]: [0.14, 0.82],
    [KIND.kit]: [0.55, 0.45],
  };
  const rev = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const [d0, span] = delay[b.M[i * 4 + 1]];
    for (let e = 0; e < 2; e++) {
      const P = e ? b.B : b.A;
      const h = Math.abs(P[i * 3 + 1]) / maxY;
      rev[i * 2 + e] = clamp(d0 + span * (0.8 * (raw[i * 2 + e] / maxD) + 0.2 * h), 0, 1);
    }
  }

  return {
    count,
    A: new Float32Array(b.A),
    B: new Float32Array(b.B),
    N: new Float32Array(b.N),
    M: new Float32Array(b.M),
    R: new Float32Array(b.R),
    S: new Float32Array(b.S),
    V: rev,
  };
}

/** The closed hull surface (sides, flat bottom, deck, transom) with analytic outward normals. */
export function buildHullSurface(spec: HullSpec, nu = 128, nz = 30) {
  const { p, f, k } = spec;
  const pos: number[] = [];
  const nrm: number[] = [];
  const idx: number[] = [];
  const W = (x: number, y: number, z: number): V3 => [(x - p.L / 2) * k, (z - p.T) * k, y * k];
  const e = 0.004 * p.L;
  const N = (x: number, y: number, z: number): V3 => {
    const hx = (f.halfBreadth(x + e, z) - f.halfBreadth(x - e, z)) / (2 * e);
    const z1 = Math.min(z + e, p.D);
    const z0 = Math.max(z - e, 0);
    const hz = (f.halfBreadth(x, z1) - f.halfBreadth(x, z0)) / (z1 - z0);
    return unit([-hx, -hz, Math.sign(y) || 1]);
  };
  // Rows denser at the bilge, columns denser at the ends.
  const zs: number[] = [];
  for (let j = 0; j <= nz; j++) zs.push(p.D * Math.pow(j / nz, 1.45));
  const us: number[] = [];
  for (let i = 0; i <= nu; i++) us.push(0.5 - 0.5 * Math.cos(Math.PI * (i / nu)));
  for (const side of [1, -1]) {
    const base = pos.length / 3;
    for (let j = 0; j <= nz; j++) {
      const z = zs[j];
      const xs = f.stern(z);
      const xb = f.bow(z);
      for (let i = 0; i <= nu; i++) {
        const x = xs + (xb - xs) * us[i];
        const y = side * f.halfBreadth(x, z);
        pos.push(...W(x, y, z));
        nrm.push(...N(x, y, z));
      }
    }
    for (let j = 0; j < nz; j++)
      for (let i = 0; i < nu; i++) {
        const a0 = base + j * (nu + 1) + i;
        const a1 = a0 + 1;
        const c0 = a0 + nu + 1;
        const c1 = c0 + 1;
        // Counter-clockwise seen from outside: port faces +z, starboard −z.
        if (side > 0) idx.push(a0, a1, c0, a1, c1, c0);
        else idx.push(a0, c0, a1, a1, c0, c1);
      }
  }
  // Caps: flat of bottom (z = 0, normal down), deck (z = D, up), transom (normal aft).
  const cap = (z: number, normal: V3, across = 4) => {
    const base = pos.length / 3;
    const xs = f.stern(z);
    const xb = f.bow(z);
    for (let i = 0; i <= nu; i++) {
      const x = xs + (xb - xs) * us[i];
      const hb = f.halfBreadth(x, z);
      for (let s = 0; s <= across; s++) {
        pos.push(...W(x, -hb + (2 * hb * s) / across, z));
        nrm.push(...normal);
      }
    }
    for (let i = 0; i < nu; i++)
      for (let s = 0; s < across; s++) {
        const a0 = base + i * (across + 1) + s;
        const a1 = a0 + 1;
        const c0 = a0 + across + 1;
        const c1 = c0 + 1;
        if (normal[1] > 0) idx.push(a0, a1, c0, a1, c1, c0);
        else idx.push(a0, c0, a1, a1, c0, c1);
      }
  };
  cap(0, [0, -1, 0]);
  cap(p.D, [0, 1, 0]);
  {
    const base = pos.length / 3;
    for (let j = 0; j <= nz; j++) {
      const z = zs[j];
      const xs = f.stern(z);
      const hb = f.halfBreadth(xs + 1e-4, z);
      for (let s = 0; s <= 4; s++) {
        pos.push(...W(xs, -hb + (2 * hb * s) / 4, z));
        nrm.push(-1, 0, 0);
      }
    }
    for (let j = 0; j < nz; j++)
      for (let s = 0; s < 4; s++) {
        const a0 = base + j * 5 + s;
        idx.push(a0, a0 + 1, a0 + 5, a0 + 1, a0 + 6, a0 + 5);
      }
  }
  return { position: new Float32Array(pos), normal: new Float32Array(nrm), index: new Uint32Array(idx) };
}

/**
 * The design waterline as the sea shader's numbers: halfBreadth at z = T as a function of world
 * x, evaluated in GLSL (same maths as hullForm at the waterline).
 */
export function waterplaneUniforms(spec: HullSpec) {
  const { p, f, k } = spec;
  const T = p.T;
  const pmb = clamp((p.Cb - 0.62) * 2.4, 0.08, 0.62);
  const fe = (1 - pmb) * 0.42;
  const fr = (1 - pmb) * 0.58;
  const pe = 1.4 + (p.Cb - 0.65) * 6;
  const pr = 1.3 + (p.Cb - 0.65) * 4;
  const peZ = pe * (0.75 + 0.5 * smooth(0, p.D, T));
  const mixT = smooth(0.35 * T, 1.05 * T, T);
  const xs = (f.stern(T) - p.L / 2) * k;
  const xb = (f.bow(T) - p.L / 2) * k;
  return {
    wl0: [xs, xb, (p.B / 2) * k, 1 - fe] as const,
    wl1: [fe, fr, peZ, pr] as const,
    wl2: [p.stern, mixT] as const,
  };
}

/** The half design waterline as 26 world (x, z) points: transom foot, transom edge, aft → stem. */
export function waterlinePolyline({ p, f, k }: HullSpec): [number, number][] {
  const T = p.T;
  const xs = f.stern(T);
  const xb = f.bow(T);
  const W = (x: number, y: number): [number, number] => [(x - p.L / 2) * k, y * k];
  const pts = [W(xs, 0), W(xs, f.halfBreadth(xs + 1e-4 * p.L, T))];
  for (let i = 1; i < 24; i++) {
    const u = 0.5 - 0.5 * Math.cos((Math.PI * i) / 24);
    const x = xs + (xb - xs) * u;
    pts.push(W(x, f.halfBreadth(x, T)));
  }
  pts.push(W(xb, 0));
  return pts;
}
