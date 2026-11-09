/**
 * A tiny SVG path writer for the drawings: ship coordinates in metres go in (x along the
 * ship, z up or y athwartships), compact absolute path data comes out (one decimal of a view
 * unit, H/V where they are shorter). It also measures the longest run between two moves, so
 * the draw-in can size its dash to the longest stroke of a layer.
 */

/** Ship metres → view units (y down). */
export type Tx = (x: number, z: number) => [number, number];
export type Pt = [number, number];

/** One decimal, no leading zero, no "-0". */
export function num(v: number): string {
  const r = Math.round(v * 10) / 10;
  if (r === 0) return "0";
  const s = String(r);
  if (s.startsWith("0.")) return s.slice(1);
  if (s.startsWith("-0.")) return `-${s.slice(2)}`;
  return s;
}

const round = (v: number) => Math.round(v * 10) / 10;

export class Pen {
  d = "";
  /** Longest run (view units) between two moves so far. */
  max = 0;
  private run = 0;
  private cx = 0;
  private cy = 0;
  private sx = 0;
  private sy = 0;

  constructor(
    readonly tx: Tx,
    /** View units per metre (arc radii). */
    readonly k: number
  ) {}

  private put(cmd: string, vals: number[]) {
    let s = cmd;
    vals.forEach((v, i) => {
      const n = num(v);
      s += i > 0 && n[0] !== "-" ? ` ${n}` : n;
    });
    this.d += s;
  }

  private at(x: number, z: number): Pt {
    const [X, Y] = this.tx(x, z);
    return [round(X), round(Y)];
  }

  private go(X: number, Y: number, len: number) {
    this.run += len;
    this.cx = X;
    this.cy = Y;
  }

  M(x: number, z: number) {
    this.flush();
    const [X, Y] = this.at(x, z);
    this.put("M", [X, Y]);
    this.cx = this.sx = X;
    this.cy = this.sy = Y;
    this.run = 0;
    return this;
  }

  L(x: number, z: number) {
    const [X, Y] = this.at(x, z);
    if (X === this.cx && Y === this.cy) return this;
    if (Y === this.cy) this.put("H", [X]);
    else if (X === this.cx) this.put("V", [Y]);
    else this.put("L", [X, Y]);
    this.go(X, Y, Math.hypot(X - this.cx, Y - this.cy));
    return this;
  }

  C(x1: number, z1: number, x2: number, z2: number, x: number, z: number) {
    const a = this.at(x1, z1);
    const b = this.at(x2, z2);
    const [X, Y] = this.at(x, z);
    this.put("C", [...a, ...b, X, Y]);
    const poly =
      Math.hypot(a[0] - this.cx, a[1] - this.cy) +
      Math.hypot(b[0] - a[0], b[1] - a[1]) +
      Math.hypot(X - b[0], Y - b[1]);
    this.go(X, Y, (poly + Math.hypot(X - this.cx, Y - this.cy)) / 2);
    return this;
  }

  Q(x1: number, z1: number, x: number, z: number) {
    const a = this.at(x1, z1);
    const [X, Y] = this.at(x, z);
    this.put("Q", [...a, X, Y]);
    const poly = Math.hypot(a[0] - this.cx, a[1] - this.cy) + Math.hypot(X - a[0], Y - a[1]);
    this.go(X, Y, (poly + Math.hypot(X - this.cx, Y - this.cy)) / 2);
    return this;
  }

  /** Circular arc of radius `r` metres to (x, z); `sweep` 1 = clockwise on screen. */
  A(r: number, x: number, z: number, sweep: 0 | 1, large: 0 | 1 = 0) {
    const [X, Y] = this.at(x, z);
    const R = round(r * this.k);
    this.put("A", [R, R, 0, large, sweep, X, Y]);
    const chord = Math.hypot(X - this.cx, Y - this.cy);
    const ang = 2 * Math.asin(Math.min(1, chord / (2 * Math.max(R, 1e-6))));
    this.go(X, Y, R * (large ? 2 * Math.PI - ang : ang));
    return this;
  }

  Z() {
    this.d += "Z";
    this.go(this.sx, this.sy, Math.hypot(this.sx - this.cx, this.sy - this.cy));
    return this;
  }

  /** Polyline through the points (closed with `close`). */
  poly(pts: Pt[], close = false) {
    pts.forEach(([x, z], i) => (i ? this.L(x, z) : this.M(x, z)));
    if (close) this.Z();
    return this;
  }

  line(x0: number, z0: number, x1: number, z1: number) {
    return this.M(x0, z0).L(x1, z1);
  }

  rect(x0: number, z0: number, x1: number, z1: number) {
    return this.M(x0, z0).L(x1, z0).L(x1, z1).L(x0, z1).Z();
  }

  circle(x: number, z: number, r: number) {
    return this.M(x - r, z)
      .A(r, x + r, z, 1)
      .A(r, x - r, z, 1);
  }

  /**
   * A capsule (a cylinder seen side-on: straight sides, round ends) between the centres of its
   * end caps, radius `r`.
   */
  capsule(ax: number, az: number, bx: number, bz: number, r: number) {
    const len = Math.hypot(bx - ax, bz - az) || 1;
    const nx = (-(bz - az) / len) * r;
    const nz = ((bx - ax) / len) * r;
    const sweep = this.sweep(
      [bx, bz],
      [bx + nx, bz + nz],
      [bx + ((bx - ax) / len) * r, bz + ((bz - az) / len) * r]
    );
    return this.M(ax + nx, az + nz)
      .L(bx + nx, bz + nz)
      .A(r, bx - nx, bz - nz, sweep)
      .L(ax - nx, az - nz)
      .A(r, ax + nx, az + nz, sweep)
      .Z();
  }

  /** The sweep flag that turns from `from` towards `via` round the centre `c` (view space). */
  sweep(c: Pt, from: Pt, via: Pt): 0 | 1 {
    const C = this.tx(c[0], c[1]);
    const F = this.tx(from[0], from[1]);
    const V = this.tx(via[0], via[1]);
    const cross = (F[0] - C[0]) * (V[1] - C[1]) - (F[1] - C[1]) * (V[0] - C[0]);
    return cross > 0 ? 1 : 0;
  }

  private flush() {
    if (this.run > this.max) this.max = this.run;
  }

  get path(): string {
    this.flush();
    return this.d;
  }

  /** Longest run, the current one included. */
  get longest(): number {
    this.flush();
    return Math.ceil(this.max);
  }
}

/* ---------- cubic Béziers for the hull contours ---------- */

export type Cubic = [Pt, Pt, Pt, Pt];

export function bez(c: Cubic, t: number): Pt {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const d = 3 * u * t * t;
  const e = t * t * t;
  return [
    a * c[0][0] + b * c[1][0] + d * c[2][0] + e * c[3][0],
    a * c[0][1] + b * c[1][1] + d * c[2][1] + e * c[3][1],
  ];
}

/**
 * The point of a cubic where coordinate `axis` (0: x, 1: the other) equals `v`, on a segment
 * that is monotonic in that coordinate; null when `v` is outside it.
 */
export function solve(c: Cubic, axis: 0 | 1, v: number): Pt | null {
  const a = c[0][axis];
  const b = c[3][axis];
  if ((v - a) * (v - b) > 1e-9) return null;
  const up = b > a;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 30; i++) {
    const m = (lo + hi) / 2;
    if (bez(c, m)[axis] < v === up) lo = m;
    else hi = m;
  }
  return bez(c, (lo + hi) / 2);
}

/** First hit of `v` along a chain of monotonic segments (straight lines are cubics too). */
export function solveChain(chain: Cubic[], axis: 0 | 1, v: number): Pt | null {
  for (const c of chain) {
    const p = solve(c, axis, v);
    if (p) return p;
  }
  return null;
}

/** A straight segment as a cubic (so it can sit in a contour chain). */
export const seg = (a: Pt, b: Pt): Cubic => [
  a,
  [a[0] + (b[0] - a[0]) / 3, a[1] + (b[1] - a[1]) / 3],
  [a[0] + (2 * (b[0] - a[0])) / 3, a[1] + (2 * (b[1] - a[1])) / 3],
  b,
];

export const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
