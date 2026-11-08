/**
 * Contour-line art for the blog (the static form of the stage's `P-bathy`
 * plate, DESIGN-V2 §6.3 and §10): a seeded fbm height field, optionally cut
 * by a meandering channel (a nod to the Bosphorus) and raised around a pin,
 * traced into iso-lines with marching squares and written as SVG.
 *
 * Used for the type-set covers (/blog/<slug>/cover.svg), the night mastheads
 * (/blog/masthead.svg) and the share cards (/blog/<slug>/og.png). Pure and
 * deterministic: the same options always give the same bytes.
 */

export type ContourOptions = {
  seed: number;
  /** viewBox size; the image is drawn to cover its box (xMidYMid slice). */
  width: number;
  height: number;
  /** Grid step in viewBox units (smaller = smoother, heavier). */
  step?: number;
  /** Number of iso-levels; every 5th is an index line. */
  levels?: number;
  /** Noise frequency across the height. */
  scale?: number;
  /** Cut a meandering channel across the field. */
  trench?: boolean;
  /** Raise a sounding around [x, y] (0–1) and mark it with a sonar ping. */
  pin?: [number, number] | null;
  color?: string;
  indexColor?: string;
  /** Line width in viewBox units. */
  lineWidth?: number;
};

/* ---------- noise ---------- */

function hash(x: number, y: number, s: number): number {
  let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function noise(x: number, y: number, s: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, s);
  const b = hash(xi + 1, yi, s);
  const c = hash(xi, yi + 1, s);
  const d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number, s: number): number {
  let t = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < 4; i++) {
    t += amp * noise(x * f, y * f, s + i * 17);
    f *= 2.03;
    amp *= 0.5;
  }
  return t;
}

/** A pin position from a seed: right of centre, upper middle (clear of the cover's text). */
export function pinFromSeed(seed: number): [number, number] {
  return [0.58 + 0.22 * hash(seed, 1, 7), 0.3 + 0.2 * hash(seed, 2, 7)];
}

/* ---------- marching squares → polylines ---------- */

type Pt = [number, number];

/** Ramer–Douglas–Peucker: drop points closer than `eps` to the line between their neighbours. */
function simplify(points: Pt[], eps: number): Pt[] {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack: [number, number][] = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    const [ax, ay] = points[a];
    const [bx, by] = points[b];
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    let max = 0;
    let idx = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * (points[i][0] - ax) - dx * (points[i][1] - ay)) / len;
      if (d > max) {
        max = d;
        idx = i;
      }
    }
    if (idx > 0 && max > eps) {
      keep[idx] = 1;
      stack.push([a, idx], [idx, b]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

/** Compact path data: absolute move, then relative integer steps. */
function pathData(lines: Pt[][]): string {
  let out = "";
  for (const line of lines) {
    if (line.length < 2) continue;
    const pts = line.map(([x, y]) => [Math.round(x), Math.round(y)] as Pt);
    let [px, py] = pts[0];
    const steps: string[] = [];
    for (let i = 1; i < pts.length; i++) {
      const [x, y] = pts[i];
      if (x === px && y === py) continue;
      steps.push(`${x - px} ${y - py}`);
      px = x;
      py = y;
    }
    // A path with a dangling command would stop the renderer: skip dots.
    if (steps.length) {
      out += `M${pts[0][0]} ${pts[0][1]}l${steps.join(" ").replace(/ -/g, "-")}`;
    }
  }
  return out;
}

/** Iso-lines of the field at every level, as minor and index (every 5th) path data. */
export function contourPaths(o: ContourOptions): { minor: string; index: string } {
  const step = o.step ?? 10;
  const levels = o.levels ?? 24;
  const scale = o.scale ?? 2.4;
  const W = o.width;
  const H = o.height;
  const nx = Math.ceil(W / step) + 1;
  const ny = Math.ceil(H / step) + 1;
  const aspect = W / H;
  const f = new Float64Array(nx * ny);
  let mn = Infinity;
  let mx = -Infinity;
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const u = (i * step) / W;
      const v = (j * step) / H;
      let h = fbm(u * scale * aspect, v * scale, o.seed);
      if (o.trench) {
        const cy = 0.5 + 0.16 * Math.sin(u * 5.2 + 0.6) + 0.06 * Math.sin(u * 13.0);
        const d = (v - cy) / 0.09;
        h -= 0.42 * Math.exp(-d * d);
      }
      if (o.pin) {
        const dx = (u - o.pin[0]) * aspect;
        const dy = v - o.pin[1];
        h += 0.18 * Math.exp(-(dx * dx + dy * dy) / 0.006);
      }
      f[j * nx + i] = h;
      if (h < mn) mn = h;
      if (h > mx) mx = h;
    }
  }

  // Edge ids: horizontal edge (i,j)→(i+1,j) = j*nx+i; vertical (i,j)→(i,j+1) = V+j*nx+i.
  const V = nx * ny;
  const minor: Pt[][] = [];
  const index: Pt[][] = [];
  for (let L = 1; L < levels; L++) {
    const iso = mn + ((mx - mn) * L) / levels;
    const point = (edge: number): Pt => {
      if (edge < V) {
        const i = edge % nx;
        const j = (edge - i) / nx;
        const a = f[j * nx + i];
        const b = f[j * nx + i + 1];
        return [(i + (iso - a) / (b - a)) * step, j * step];
      }
      const e = edge - V;
      const i = e % nx;
      const j = (e - i) / nx;
      const a = f[j * nx + i];
      const b = f[(j + 1) * nx + i];
      return [i * step, (j + (iso - a) / (b - a)) * step];
    };
    // Segments as pairs of edge ids, linked into polylines through shared edges.
    const links = new Map<number, number[]>();
    const add = (p: number, q: number) => {
      (links.get(p) ?? links.set(p, []).get(p)!).push(q);
      (links.get(q) ?? links.set(q, []).get(q)!).push(p);
    };
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const a = f[j * nx + i];
        const b = f[j * nx + i + 1];
        const c = f[(j + 1) * nx + i + 1];
        const d = f[(j + 1) * nx + i];
        let k = 0;
        if (a > iso) k |= 8;
        if (b > iso) k |= 4;
        if (c > iso) k |= 2;
        if (d > iso) k |= 1;
        if (k === 0 || k === 15) continue;
        const T = j * nx + i;
        const B = (j + 1) * nx + i;
        const Lf = V + j * nx + i;
        const R = V + j * nx + i + 1;
        switch (k) {
          case 1:
          case 14:
            add(Lf, B);
            break;
          case 2:
          case 13:
            add(B, R);
            break;
          case 3:
          case 12:
            add(Lf, R);
            break;
          case 4:
          case 11:
            add(T, R);
            break;
          case 5:
            add(Lf, T);
            add(B, R);
            break;
          case 6:
          case 9:
            add(T, B);
            break;
          case 7:
          case 8:
            add(Lf, T);
            break;
          case 10:
            add(T, R);
            add(Lf, B);
            break;
        }
      }
    }
    const used = new Set<number>();
    const walk = (start: number) => {
      const ids = [start];
      used.add(start);
      let cur = start;
      for (;;) {
        const next = (links.get(cur) ?? []).find((n) => !used.has(n));
        if (next === undefined) break;
        used.add(next);
        ids.push(next);
        cur = next;
      }
      // Close loops back to their start.
      if (ids.length > 2 && (links.get(cur) ?? []).includes(start)) ids.push(start);
      return simplify(ids.map(point), 0.45);
    };
    const target = L % 5 === 0 ? index : minor;
    // Open lines start at their ends (edges with one neighbour), then loops.
    for (const [edge, n] of links) if (n.length === 1 && !used.has(edge)) target.push(walk(edge));
    for (const edge of links.keys()) if (!used.has(edge)) target.push(walk(edge));
  }
  return { minor: pathData(minor), index: pathData(index) };
}

/** A complete SVG (transparent background) of the contour field, with the pin's ping. */
export function contourSvg(o: ContourOptions): string {
  const { minor, index } = contourPaths(o);
  const color = o.color ?? "rgba(217,176,113,0.18)";
  const indexColor = o.indexColor ?? "rgba(217,176,113,0.4)";
  const lw = o.lineWidth ?? 1;
  let pin = "";
  if (o.pin) {
    const px = Math.round(o.pin[0] * o.width);
    const py = Math.round(o.pin[1] * o.height);
    const r = Math.min(o.width, o.height) / 1000;
    const ring = (radius: number, alpha: number) =>
      `<circle cx="${px}" cy="${py}" r="${Math.round(radius * r)}" fill="none" stroke="rgba(217,176,113,${alpha})" stroke-width="${lw}"/>`;
    pin =
      `<radialGradient id="g"><stop offset="0" stop-color="#D9B071" stop-opacity=".55"/><stop offset="1" stop-color="#D9B071" stop-opacity="0"/></radialGradient>` +
      ring(150, 0.1) +
      ring(94, 0.18) +
      ring(46, 0.3) +
      `<circle cx="${px}" cy="${py}" r="${Math.round(36 * r)}" fill="url(#g)"/>` +
      `<circle cx="${px}" cy="${py}" r="${Math.max(3, Math.round(7 * r))}" fill="#D9B071"/>`;
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${o.width} ${o.height}" preserveAspectRatio="xMidYMid slice" fill="none" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="${minor}" stroke="${color}" stroke-width="${lw}"/>` +
    `<path d="${index}" stroke="${indexColor}" stroke-width="${lw * 1.15}"/>` +
    pin +
    `</svg>`
  );
}

/** The cover art of a type-set post cover (16:10, pin from the seed). */
export const coverSvg = (seed: number) =>
  contourSvg({
    seed,
    width: 1200,
    height: 750,
    step: 10,
    levels: 24,
    scale: 3,
    trench: true,
    pin: pinFromSeed(seed),
    color: "rgba(217,176,113,0.2)",
    indexColor: "rgba(217,176,113,0.42)",
    lineWidth: 1.4,
  });

/** The night masthead behind /blog headings: wide, quieter, no channel. */
export const mastheadSvg = () =>
  contourSvg({
    seed: 9,
    width: 1600,
    height: 480,
    step: 9,
    levels: 22,
    scale: 2.2,
    trench: false,
    pin: null,
    color: "rgba(217,176,113,0.11)",
    indexColor: "rgba(217,176,113,0.24)",
    lineWidth: 1.1,
  });
