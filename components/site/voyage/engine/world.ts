import { perlin2, fbm2 } from "./noise";
import { clamp, lerp, smoothstep, DEG, type V2 } from "./math";
import { SHOTS } from "./timeline";

/**
 * Stylised Istanbul, top view: x = east, z = south (north is −z, up the strait).
 * The Bosphorus runs north between the European shore (west) and the Asian shore
 * (east) and opens south into the Sea of Marmara. Distances are cheated for the
 * lens (the strait is ~1.1 km wide here) but the topology is the real one.
 */
interface ShoreDef {
  pts: readonly V2[];
  /** Land lies to the right of the walking direction. */
  landRight: boolean;
  /** Ridge height (m) along the normalised arc length. */
  ridge: readonly V2[];
  /** How built-up the shore is (0 green hills .. 1 dense city). */
  city: readonly V2[];
  /** Inland reach of the terrain ribbon (m). */
  reach: number;
}

const DEFS: Record<"eu" | "hp" | "as", ShoreDef> = {
  // European shore: from the upper Bosphorus south to Karaköy, then west into the Golden Horn.
  eu: {
    pts: [
      [-900, -15000],
      [-760, -11000],
      [-640, -8200],
      [-560, -6600],
      [-540, -5400],
      [-600, -4500],
      [-540, -3500],
      [-500, -2600],
      [-500, -2000],
      [-410, -1700],
      [-620, -1300],
      [-580, -1000],
      [-660, -560],
      [-960, -430],
      [-1600, -470],
      [-2600, -600],
      [-4200, -800],
    ],
    landRight: true,
    ridge: [
      [0, 250],
      [0.2, 220],
      [0.42, 175],
      [0.55, 150],
      [0.7, 135],
      [0.82, 125],
      [0.9, 105],
      [1, 85],
    ],
    city: [
      [0, 0.25],
      [0.35, 0.5],
      [0.6, 0.85],
      [0.8, 1],
      [1, 1],
    ],
    reach: 1300,
  },
  // Historic peninsula: Golden Horn south shore → Sarayburnu → Marmara coast westward.
  hp: {
    pts: [
      [-4200, -380],
      [-2600, -250],
      [-1700, -150],
      [-1100, -60],
      [-760, 60],
      [-700, 400],
      [-820, 800],
      [-1200, 1200],
      [-1900, 1450],
      [-3000, 1600],
      [-5000, 1750],
      [-8000, 1900],
      [-12000, 2100],
      [-18000, 2500],
    ],
    landRight: true,
    ridge: [
      [0, 90],
      [0.15, 100],
      [0.25, 82],
      [0.35, 75],
      [0.5, 66],
      [0.7, 58],
      [1, 50],
    ],
    city: [
      [0, 1],
      [0.5, 0.9],
      [0.8, 0.6],
      [1, 0.4],
    ],
    reach: 1300,
  },
  // Asian shore: upper Bosphorus south to Üsküdar/Salacak, then east along the Marmara.
  as: {
    pts: [
      [1000, -15000],
      [800, -11000],
      [640, -8200],
      [560, -6600],
      [540, -5400],
      [580, -4400],
      [520, -3400],
      [520, -2400],
      [480, -1500],
      [440, -800],
      [420, -200],
      [460, 400],
      [580, 1000],
      [900, 1600],
      [1300, 2100],
      [2000, 2500],
      [3000, 2700],
      [5000, 3000],
      [8000, 3600],
      [12000, 4400],
      [18000, 5600],
    ],
    landRight: false,
    ridge: [
      [0, 280],
      [0.2, 250],
      [0.3, 235],
      [0.36, 300],
      [0.4, 250],
      [0.46, 160],
      [0.52, 120],
      [0.6, 95],
      [0.75, 75],
      [1, 65],
    ],
    city: [
      [0, 0.3],
      [0.3, 0.55],
      [0.42, 0.9],
      [0.6, 1],
      [0.8, 0.8],
      [1, 0.5],
    ],
    reach: 1600,
  },
};

const NOISE_A = perlin2(101, 4096);
const NOISE_B = perlin2(202, 4096);

function interp(table: readonly V2[], s: number): number {
  if (s <= table[0][0]) return table[0][1];
  for (let i = 1; i < table.length; i++) {
    const [s1, v1] = table[i];
    if (s <= s1) {
      const [s0, v0] = table[i - 1];
      return lerp(v0, v1, smoothstep(0, 1, (s - s0) / (s1 - s0)));
    }
  }
  return table[table.length - 1][1];
}

export class Shore {
  readonly xs: Float64Array;
  readonly zs: Float64Array;
  readonly acc: Float64Array;
  readonly total: number;

  constructor(readonly def: ShoreDef) {
    // Densify the control polygon with a centripetal-ish Catmull-Rom (uniform is fine here).
    const p = def.pts;
    const xs: number[] = [];
    const zs: number[] = [];
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[Math.max(0, i - 1)];
      const p1 = p[i];
      const p2 = p[i + 1];
      const p3 = p[Math.min(p.length - 1, i + 2)];
      const segLen = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
      const n = Math.max(2, Math.ceil(segLen / 12));
      for (let j = 0; j < n; j++) {
        const t = j / n;
        const t2 = t * t;
        const t3 = t2 * t;
        const cr = (a: number, b: number, c: number, d: number): number =>
          0.5 *
          (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        xs.push(cr(p0[0], p1[0], p2[0], p3[0]));
        zs.push(cr(p0[1], p1[1], p2[1], p3[1]));
      }
    }
    const last = p[p.length - 1];
    xs.push(last[0]);
    zs.push(last[1]);
    this.xs = Float64Array.from(xs);
    this.zs = Float64Array.from(zs);
    this.acc = new Float64Array(xs.length);
    for (let i = 1; i < xs.length; i++) {
      this.acc[i] = this.acc[i - 1] + Math.hypot(xs[i] - xs[i - 1], zs[i] - zs[i - 1]);
    }
    this.total = this.acc[xs.length - 1];
  }

  /** Point and unit tangent at arc length s (m). */
  at(s: number): { x: number; z: number; tx: number; tz: number } {
    const sc = clamp(s, 0, this.total);
    let lo = 0;
    let hi = this.acc.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (this.acc[mid] <= sc) lo = mid;
      else hi = mid;
    }
    const seg = Math.max(1e-6, this.acc[hi] - this.acc[lo]);
    const f = (sc - this.acc[lo]) / seg;
    const x = lerp(this.xs[lo], this.xs[hi], f);
    const z = lerp(this.zs[lo], this.zs[hi], f);
    // Smooth tangent over ±40 m so inland offsets do not kink at every vertex.
    const a = this.rawAt(sc - 40);
    const b = this.rawAt(sc + 40);
    const l = Math.max(1e-6, Math.hypot(b[0] - a[0], b[1] - a[1]));
    return { x, z, tx: (b[0] - a[0]) / l, tz: (b[1] - a[1]) / l };
  }

  private rawAt(s: number): V2 {
    const sc = clamp(s, 0, this.total);
    let lo = 0;
    let hi = this.acc.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (this.acc[mid] <= sc) lo = mid;
      else hi = mid;
    }
    const f = (sc - this.acc[lo]) / Math.max(1e-6, this.acc[hi] - this.acc[lo]);
    return [lerp(this.xs[lo], this.xs[hi], f), lerp(this.zs[lo], this.zs[hi], f)];
  }

  /** Unit vector pointing inland for a tangent. */
  inland(tx: number, tz: number): V2 {
    return this.def.landRight ? [-tz, tx] : [tz, -tx];
  }

  /** Nearest arc position and signed inland distance (positive on land). */
  nearest(x: number, z: number): { s: number; d: number } {
    let best = Infinity;
    let bi = 0;
    let bf = 0;
    for (let i = 0; i < this.xs.length - 1; i++) {
      const ax = this.xs[i];
      const az = this.zs[i];
      const dx = this.xs[i + 1] - ax;
      const dz = this.zs[i + 1] - az;
      const l2 = dx * dx + dz * dz || 1e-9;
      const f = clamp(((x - ax) * dx + (z - az) * dz) / l2, 0, 1);
      const px = ax + dx * f - x;
      const pz = az + dz * f - z;
      const dd = px * px + pz * pz;
      if (dd < best) {
        best = dd;
        bi = i;
        bf = f;
      }
    }
    const s = this.acc[bi] + (this.acc[bi + 1] - this.acc[bi]) * bf;
    const t = this.at(s);
    const [nx, nz] = this.inland(t.tx, t.tz);
    const d = (x - t.x) * nx + (z - t.z) * nz;
    return { s, d };
  }

  city(s: number): number {
    return interp(this.def.city, s / this.total);
  }

  /** Terrain height (m) at arc s, inland distance d, world (x, z). */
  height(s: number, d: number, x: number, z: number): number {
    if (d <= 0) return lerp(-9, 1.2, clamp((d + 40) / 40, 0, 1));
    const ridge = interp(this.def.ridge, s / this.total);
    const rise = 1 - Math.exp(-d / 330);
    const n = fbm2(NOISE_A, x / 700, z / 700, 3);
    const hills = ridge * rise * (0.72 + 0.62 * n);
    const quay = 1.2 + 3.5 * smoothstep(0, 40, d);
    const c = this.city(s);
    const blocks = c * smoothstep(25, 90, d) * Math.max(0, NOISE_B(x / 55, z / 55)) * 9;
    return Math.max(quay, hills) + blocks;
  }
}

export const SHORES = { eu: new Shore(DEFS.eu), hp: new Shore(DEFS.hp), as: new Shore(DEFS.as) };
export const SHORE_LIST: readonly Shore[] = [SHORES.eu, SHORES.hp, SHORES.as];

/** Ground height at a world position (max over landmasses), and the inland distance. */
export function ground(x: number, z: number): { h: number; d: number; shore: Shore } {
  let best: { h: number; d: number; shore: Shore } | null = null;
  for (const sh of SHORE_LIST) {
    const { s, d } = sh.nearest(x, z);
    const h = sh.height(s, d, x, z);
    if (!best || d > best.d) best = { h, d, shore: sh };
  }
  return best ?? { h: 0, d: -1000, shore: SHORES.eu };
}

/** Landmarks (world x, z). Heights come from `ground`. */
export const SITES = {
  maiden: [300, -170] as V2,
  galata: [-770, -1430] as V2,
  bridge: { z: -4800, eu: -625, as: 625 },
  palace: { a: [-420, -1690] as V2, b: [-610, -1315] as V2 },
  ortakoy: [-628, -4655] as V2,
};

export type MosqueKind = "two" | "four" | "six" | "ortakoy" | "hagia";
export const MOSQUES: readonly { at: V2; kind: MosqueKind; scale: number; yaw: number }[] = [
  { at: [-650, -870], kind: "two", scale: 0.9, yaw: 10 },
  { at: [-1000, -2300], kind: "four", scale: 1.0, yaw: 0 },
  { at: SITES.ortakoy, kind: "ortakoy", scale: 1.0, yaw: 80 },
  { at: [520, -700], kind: "two", scale: 0.95, yaw: -10 },
  { at: [545, -420], kind: "four", scale: 0.85, yaw: 5 },
  { at: [1450, -3000], kind: "six", scale: 1.35, yaw: 0 },
  { at: [-1250, 650], kind: "six", scale: 1.1, yaw: 20 },
  { at: [-1050, 300], kind: "hagia", scale: 1.1, yaw: 20 },
  { at: [-2300, -60], kind: "four", scale: 1.15, yaw: 0 },
  { at: [-720, -3700], kind: "two", scale: 0.85, yaw: 0 },
  { at: [700, -2600], kind: "two", scale: 0.8, yaw: 0 },
];

/** Modern tower clusters (Levent, Ataşehir) far behind the old skyline. */
export const TOWERS: readonly {
  at: V2;
  count: number;
  spread: number;
  maxH: number;
  seed: number;
}[] = [
  { at: [-2600, -9400], count: 16, spread: 900, maxH: 230, seed: 3 },
  { at: [4600, -4600], count: 10, spread: 700, maxH: 170, seed: 9 },
  { at: [-5200, -2600], count: 6, spread: 600, maxH: 120, seed: 12 },
];

export type ShipKind = "tanker" | "gas" | "ferry";
export interface ShipPlacement {
  kind: ShipKind;
  x: number;
  z: number;
  /** Heading in radians (0 = north, +π/2 = east). */
  heading: number;
  /** Visual speed through the water (m/s) - drives the wake, not the position. */
  speed: number;
  anchored: boolean;
  scale: number;
}

function relToShot(shot: number, relYawDeg: number, dist: number): V2 {
  const s = SHOTS[shot];
  const a = (s.yaw + relYawDeg) * DEG;
  return [s.pos[0] + Math.sin(a) * dist, s.pos[2] - Math.cos(a) * dist];
}

function place(
  kind: ShipKind,
  shot: number,
  relYaw: number,
  dist: number,
  headingDeg: number,
  speed: number,
  scale = 1
): ShipPlacement {
  const [x, z] = relToShot(shot, relYaw, dist);
  return { kind, x, z, heading: headingDeg * DEG, speed, anchored: speed === 0, scale };
}

export const SHIPS: readonly ShipPlacement[] = [
  place("tanker", 0, 8, 800, -124, 3.2),
  place("tanker", 1, 10, 480, 300, 4.5),
  place("gas", 1, -17, 1900, 282, 4),
  place("gas", 2, 16, 1050, 160, 3),
  place("tanker", 3, -17, 900, 40, 0, 0.85),
  place("gas", 3, 7, 1250, 40, 0),
  place("tanker", 3, 21, 760, 40, 0, 0.8),
  place("tanker", 4, -9, 1500, 196, 0, 0.95),
  place("ferry", 0, -4, 1500, 70, 4),
];
