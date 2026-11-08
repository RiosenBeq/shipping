import * as THREE from "three";
import { COMMON, type SharedUniforms } from "./glsl";
import { ArchBuilder, KIND, SRGB_DECODE, archPrims, xf, type ArchPrims } from "./geom";
import { CITY_GLSL, forestMask, glslColor } from "./land";
import { lin } from "./palette";
import { DEG, clamp, rng, smoothstep, type V2, type V3 } from "./math";
import { SHOTS } from "./timeline";
import { MAIDEN, MOSQUES, SHORE_LIST, SITES, TOWERS, ground, type MosqueKind } from "./world";

const C = {
  stone: lin(0xdcd5c6),
  stoneWarm: lin(0xd7c7ab),
  hagia: lin(0xc49f86),
  lead: lin(0x7c8890),
  leadDark: lin(0x56626b),
  rock: lin(0x5f5a52),
  rockLight: lin(0x7b7468),
  quay: lin(0xb3a68f),
  white: lin(0xe6dfcf),
  steel: lin(0xb4babd),
  steelDark: lin(0x7d8589),
  brass: lin(0xb8893a),
  glass: [lin(0x8e989e), lin(0x9ea6aa), lin(0x7f8a91)],
  tree: [lin(0x2b3a30), lin(0x33443a), lin(0x2a372f)],
  // façades: muted limewash, ochre and grey, kept in the middle values
  wall: [
    lin(0xb7a88c),
    lin(0xbfae92),
    lin(0xa98d6d),
    lin(0xae8b72),
    lin(0x9d9a90),
    lin(0xc2b7a0),
    lin(0xa69677),
    lin(0x958f84),
  ],
  // the upper Bosphorus yalı: dark timber and ox-blood
  yali: [lin(0x6e5442), lin(0x7a4a3a), lin(0x8a7a66), lin(0xa49a86)],
  terra: [lin(0x9a5a43), lin(0x8c4f3b), lin(0xa5664b), lin(0x93604a)],
  leadRoof: [lin(0x6b7178), lin(0x777b7b), lin(0x5f666c)],
};

/** Thin linear features (bridge cables, hangers) drawn as screen-space lines. */
export interface WireSeg {
  a: V3;
  b: V3;
  /** Physical width (m). */
  w: number;
  /** Minimum opacity once thinner than a pixel (legibility floor), default 0.18. */
  minA?: number;
}

type Place = (lx: number, lz: number) => V2;
function placer(x: number, z: number, yawDeg: number): Place {
  const c = Math.cos(yawDeg * DEG);
  const s = Math.sin(yawDeg * DEG);
  return (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
}

// ---------------------------------------------------------------------------
// Mosques: the readable landmarks (lead domes, pencil minarets)
// ---------------------------------------------------------------------------

function minaret(
  b: ArchBuilder,
  P: ArchPrims,
  x: number,
  y0: number,
  z: number,
  h: number,
  r: number,
  balconies: number,
  stone: THREE.Color
): void {
  b.add(P.oct, xf(x, y0, z, Math.PI / 8, r * 1.5, h * 0.14, r * 1.5), stone, KIND.stone);
  b.add(P.shaft, xf(x, y0, z, 0, r, h * 0.86, r), stone, KIND.stone);
  for (let i = 0; i < balconies; i++) {
    const by = y0 + h * (0.58 + i * 0.12);
    b.add(P.shaft, xf(x, by, z, 0, r * 1.6, Math.max(0.6, h * 0.016), r * 1.6), stone, KIND.stone);
  }
  b.add(P.shaft, xf(x, y0 + h * 0.86, z, 0, r * 0.8, h * 0.06, r * 0.8), stone, KIND.stone);
  // the pencil: a tall, sharp lead cone
  b.add(P.cone, xf(x, y0 + h * 0.92, z, 0, r * 0.92, h * 0.25, r * 0.92), C.lead, KIND.lead);
}

interface MosqueSpec {
  base: [number, number, number];
  dome: number;
  domeY: number;
  semi: number;
  minarets: V2[];
  minH: number;
  minR: number;
  balconies: number;
  smallDomes: boolean;
  stone: THREE.Color;
  flat: number;
}

function mosqueSpec(kind: MosqueKind): MosqueSpec {
  switch (kind) {
    case "two":
      return {
        base: [34, 17, 34],
        dome: 11,
        domeY: 0.9,
        semi: 0,
        minarets: [
          [-19, 19],
          [19, 19],
        ],
        minH: 50,
        minR: 1.6,
        balconies: 2,
        smallDomes: true,
        stone: C.stone,
        flat: 1,
      };
    case "four":
      return {
        base: [48, 21, 48],
        dome: 15,
        domeY: 0.88,
        semi: 2,
        minarets: [
          [-27, -27],
          [27, -27],
          [-27, 27],
          [27, 27],
        ],
        minH: 64,
        minR: 1.9,
        balconies: 3,
        smallDomes: true,
        stone: C.stone,
        flat: 1,
      };
    case "six":
      return {
        base: [58, 23, 58],
        dome: 17,
        domeY: 0.86,
        semi: 4,
        minarets: [
          [-32, -32],
          [32, -32],
          [-32, 32],
          [32, 32],
          [-36, 80],
          [36, 80],
        ],
        minH: 64,
        minR: 1.9,
        balconies: 3,
        smallDomes: true,
        stone: C.stone,
        flat: 1,
      };
    case "ortakoy":
      // Ortaköy: one tall dome on a cubic prayer hall, two slender minarets at the front corners
      return {
        base: [24, 17, 24],
        dome: 9.5,
        domeY: 1.0,
        semi: 0,
        minarets: [
          [-13.5, 13],
          [13.5, 13],
        ],
        minH: 42,
        minR: 1.3,
        balconies: 1,
        smallDomes: false,
        stone: C.white,
        flat: 1,
      };
    case "hagia":
      return {
        base: [72, 30, 76],
        dome: 17,
        domeY: 0.62,
        semi: 2,
        minarets: [
          [-41, -42],
          [41, -42],
          [-41, 42],
          [41, 42],
        ],
        minH: 58,
        minR: 2.2,
        balconies: 2,
        smallDomes: false,
        stone: C.hagia,
        flat: 0.62,
      };
  }
}

function mosque(
  b: ArchBuilder,
  P: ArchPrims,
  wire: WireSeg[],
  at: V2,
  kind: MosqueKind,
  scale: number,
  yawDeg: number
): void {
  const sp = mosqueSpec(kind);
  const g = ground(at[0], at[1]).h;
  const y0 = g - 1;
  const pl = placer(at[0], at[1], yawDeg);
  const k = scale;
  const yaw = yawDeg * DEG;
  const [bw, bh, bd] = sp.base;
  b.add(P.boxBase, xf(at[0], y0 - 3, at[1], yaw, bw * k, bh * k + 3, bd * k), sp.stone, KIND.stone);
  // stepped cornice + drum
  b.add(
    P.boxBase,
    xf(at[0], y0 + bh * k, at[1], yaw, bw * 0.78 * k, 2.2 * k, bd * 0.78 * k),
    sp.stone,
    KIND.stone
  );
  const drumY = y0 + (bh + 2.2) * k;
  b.add(
    P.cylWide,
    xf(at[0], drumY, at[1], 0, sp.dome * 0.98 * k, 4.2 * k, sp.dome * 0.98 * k),
    sp.stone,
    KIND.stone
  );
  const domeTop = drumY + 4.2 * k + sp.dome * sp.domeY * k;
  b.add(
    P.dome,
    xf(at[0], drumY + 4.2 * k, at[1], 0, sp.dome * k, sp.dome * sp.domeY * k, sp.dome * k),
    C.lead,
    KIND.lead
  );
  // cascading semi-domes on the main axes
  for (let i = 0; i < sp.semi; i++) {
    const ang = yaw + (i * Math.PI) / 2;
    const [sx, sz] = pl(
      Math.sin((i * Math.PI) / 2) * sp.dome * 0.95 * k,
      Math.cos((i * Math.PI) / 2) * sp.dome * 0.95 * k
    );
    b.add(
      P.halfDome,
      xf(
        sx,
        y0 + bh * k,
        sz,
        ang,
        sp.dome * 0.72 * k,
        sp.dome * 0.62 * k * sp.flat,
        sp.dome * 0.72 * k
      ),
      C.lead,
      KIND.lead
    );
  }
  if (sp.smallDomes) {
    for (const [cx, cz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ] as const) {
      const [sx, sz] = pl(cx * bw * 0.36 * k, cz * bd * 0.36 * k);
      b.add(P.cylMid, xf(sx, y0 + bh * k, sz, 0, 3.8 * k, 1.8 * k, 3.8 * k), sp.stone, KIND.stone);
      b.add(
        P.smallDome,
        xf(sx, y0 + (bh + 1.8) * k, sz, 0, 3.9 * k, 3.4 * k, 3.9 * k),
        C.lead,
        KIND.lead
      );
    }
    // courtyard arcade (low) in front, crowned by a row of small domes
    const [fx, fz] = pl(0, bd * 0.95 * k);
    b.add(
      P.boxBase,
      xf(fx, y0 - 3, fz, yaw, bw * 0.95 * k, 9 * k + 3, bd * 0.9 * k),
      sp.stone,
      KIND.stone
    );
    for (let i = -2; i <= 2; i++) {
      const [ax, az] = pl(i * bw * 0.18 * k, bd * 1.32 * k);
      b.add(P.smallDome, xf(ax, y0 + 9 * k, az, 0, 3 * k, 2.6 * k, 3 * k), C.lead, KIND.lead);
    }
  }
  if (kind === "hagia") {
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const [px, pz] = pl(sx * bw * 0.42 * k, sz * bd * 0.2 * k);
        b.add(
          P.boxBase,
          xf(px, y0 - 2, pz, yaw, 10 * k, (bh + 10) * k, 14 * k),
          sp.stone,
          KIND.stone
        );
      }
    }
  }
  for (const [mx, mz] of sp.minarets) {
    const [x, z] = pl(mx * k, mz * k);
    const gy = Math.min(y0 + 1, ground(x, z).h - 0.5);
    minaret(b, P, x, gy, z, sp.minH * k, sp.minR * k, sp.balconies, sp.stone);
    // the alem on the cap reads as a hairline
    const top = gy + sp.minH * k * 1.17;
    wire.push({ a: [x, top - 0.5, z], b: [x, top + 3 * k, z], w: 0.3 * k, minA: 0.2 });
  }
  wire.push({ a: [at[0], domeTop - 0.3, at[1]], b: [at[0], domeTop + 6 * k, at[1]], w: 0.35 * k });
}

function galata(b: ArchBuilder, P: ArchPrims): void {
  const [x, z] = SITES.galata;
  const g = ground(x, z).h - 1;
  const k = 1.25;
  b.add(P.cylWide, xf(x, g - 4, z, 0, 8.8 * k, 49 * k + 4, 8.8 * k), C.stoneWarm, KIND.stone);
  b.add(P.cylWide, xf(x, g + 47 * k, z, 0, 9.8 * k, 2.2 * k, 9.8 * k), C.stoneWarm, KIND.stone);
  b.add(P.cylWide, xf(x, g + 49 * k, z, 0, 8.2 * k, 7.5 * k, 8.2 * k), C.stoneWarm, KIND.windows);
  b.add(P.cone, xf(x, g + 56.5 * k, z, 0, 9.2 * k, 19 * k, 9.2 * k), C.leadDark, KIND.lead);
  b.add(P.mast, xf(x, g + 75 * k, z, 0, 0.35 * k, 5 * k, 0.35 * k), C.brass, KIND.plain);
}

// ---------------------------------------------------------------------------
// Maiden's Tower (Kız Kulesi) on its own islet
// ---------------------------------------------------------------------------

/** Kız Kulesi scale (×1.45 so it reads in the hero and contact frames). */
export const MAIDEN_SCALE = MAIDEN.scale;

function maiden(b: ArchBuilder, P: ArchPrims): void {
  const [x, z] = SITES.maiden;
  const k = MAIDEN_SCALE;
  const tx = x - 4 * k;
  const tz = z - 2 * k;
  // rocks breaking the waterline around a stone quay
  const r = rng(41);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + r() * 0.4;
    const rx = 26 * k * (0.86 + r() * 0.2);
    const rz = 18 * k * (0.86 + r() * 0.2);
    const s = (5 + r() * 5) * k;
    b.add(
      P.rock,
      xf(
        x + Math.cos(a) * rx,
        -1.4,
        z + 3 * k + Math.sin(a) * rz,
        r() * 6,
        s,
        1.6 + r() * 1.6,
        s * 0.8
      ),
      r() < 0.5 ? C.rock : C.rockLight,
      KIND.rock
    );
  }
  b.add(P.disc, xf(x, -3, z + 3 * k, 0, 25 * k, 4.6, 17 * k), C.quay, KIND.rock);
  // seawall terrace
  b.add(P.boxBase, xf(x, 1.2, z + 3 * k, 0, 34 * k, 2.2, 24 * k), C.quay, KIND.rock);
  // low wing to the south with a lead roof
  b.add(P.boxBase, xf(x + 3 * k, 3.4, z + 9 * k, 0, 24 * k, 6.2 * k, 10 * k), C.white, KIND.beacon);
  b.add(
    P.boxBase,
    xf(x + 3 * k, 3.4 + 6.2 * k, z + 9 * k, 0, 25 * k, 0.8 * k, 11 * k),
    C.leadDark,
    KIND.lead
  );
  // tower: square base, octagonal shaft, gallery, lantern, lead cupola (base level 4.6 m,
  // which the window lamps in lights.ts assume)
  const ty = 4.6;
  b.add(P.boxBase, xf(tx, 3.0, tz, 0, 11 * k, ty - 3 + 12 * k, 11 * k), C.white, KIND.beacon);
  b.add(
    P.boxBase,
    xf(tx, ty + 12 * k, tz, 0, 11.8 * k, 0.7 * k, 11.8 * k),
    C.stoneWarm,
    KIND.stone
  );
  b.add(
    P.oct,
    xf(tx, ty + 12 * k, tz, Math.PI / 8, 5.3 * k, 9.5 * k, 5.3 * k),
    C.white,
    KIND.beacon
  );
  b.add(
    P.oct,
    xf(tx, ty + 21.5 * k, tz, Math.PI / 8, 6.4 * k, 0.9 * k, 6.4 * k),
    C.stoneWarm,
    KIND.stone
  );
  b.add(
    P.oct,
    xf(tx, ty + 22.4 * k, tz, Math.PI / 8, 3.6 * k, 3.6 * k, 3.6 * k),
    C.white,
    KIND.lamp
  );
  b.add(
    P.octCone,
    xf(tx, ty + 26 * k, tz, Math.PI / 8, 4.3 * k, 6.5 * k, 4.3 * k),
    C.leadDark,
    KIND.lead
  );
  b.add(P.mast, xf(tx, ty + 32.4 * k, tz, 0, 0.18 * k, 2.6 * k, 0.18 * k), C.brass, KIND.plain);
}

/** Top of the Maiden's Tower mast (world), for the beacon. */
export function maidenBeacon(): V3 {
  const [x, z] = SITES.maiden;
  return [x - 4 * MAIDEN_SCALE, 4.6 + 32.5 * MAIDEN_SCALE, z - 2 * MAIDEN_SCALE];
}

// ---------------------------------------------------------------------------
// Dolmabahçe-like palace and the bridge
// ---------------------------------------------------------------------------

function palace(b: ArchBuilder, P: ArchPrims): void {
  const [ax, az] = SITES.palace.a;
  const [bx, bz] = SITES.palace.b;
  const len = Math.hypot(bx - ax, bz - az);
  const tx = (bx - ax) / len;
  const tz = (bz - az) / len;
  const yaw = Math.atan2(-tz, tx);
  // inland is to the right of a→b on the European shore
  const nx = -tz;
  const nz = tx;
  const seg = 12;
  for (let i = 0; i < seg; i++) {
    const f = (i + 0.5) / seg;
    const cx = ax + tx * len * f + nx * 24;
    const cz = az + tz * len * f + nz * 24;
    const g = Math.max(2.5, ground(cx, cz).h);
    const mid = Math.abs(f - 0.5) < 0.07;
    const end = f < 0.09 || f > 0.91;
    const h = mid ? 31 : end ? 24 : 20;
    b.add(
      P.boxBase,
      xf(cx, 1.2, cz, yaw, (len / seg) * 1.01, h + g - 1.2, 34),
      C.white,
      KIND.palace
    );
    b.add(P.boxBase, xf(cx, g + h, cz, yaw, (len / seg) * 0.98, 1.6, 30), C.lead, KIND.lead);
  }
  b.add(
    P.boxBase,
    xf(ax + tx * len * 0.5 + nx * 3, -1, az + tz * len * 0.5 + nz * 3, yaw, len * 1.04, 3.2, 6),
    C.stoneWarm,
    KIND.stone
  );
}

/** Bridge constants shared with the lamps in lights.ts (towers at SITES.bridge.eu/as). */
export const BRIDGE = { H: 200, deckY: 70, sag: 112, cableZ: 16.5 } as const;

function bridge(b: ArchBuilder, P: ArchPrims, wire: WireSeg[]): void {
  const { z, eu, as } = SITES.bridge;
  const { H, deckY, sag, cableZ } = BRIDGE;
  for (const x of [eu, as]) {
    const g = ground(x, z).h - 2;
    // two tapered steel legs per tower (a thin box pair reads as one leg each)
    for (const dz of [-18, 18]) {
      b.add(P.boxBase, xf(x, g, z + dz, 0, 8, deckY - g, 8.6), C.steel, KIND.plain);
      b.add(P.boxBase, xf(x, deckY, z + dz * 0.985, 0, 6.6, H - deckY, 7), C.steel, KIND.plain);
    }
    // portal beams
    for (const y of [deckY - 6, 132, H - 7])
      b.add(P.boxBase, xf(x, y, z, 0, 6, 6, 42), C.steelDark, KIND.plain);
    // saddles on the tower tops
    for (const dz of [-cableZ, cableZ])
      b.add(P.boxBase, xf(x, H - 1, z + dz, 0, 7.4, 3, 4.2), C.steelDark, KIND.plain);
  }
  const x0 = eu - 330;
  const x1 = as + 330;
  // deck: a thin aerodynamic box with a dark soffit
  b.add(P.boxBase, xf((x0 + x1) / 2, deckY - 2.5, z, 0, x1 - x0, 4.2, 33), C.steel, KIND.plain);
  b.add(P.boxBase, xf((x0 + x1) / 2, deckY - 3.6, z, 0, x1 - x0, 1.2, 30), C.steelDark, KIND.plain);
  // approach piers
  for (const x of [x0 + 60, x0 + 180, x1 - 180, x1 - 60]) {
    const g = ground(x, z).h - 2;
    if (deckY - 3 - g > 4)
      b.add(P.boxBase, xf(x, g, z, 0, 5, deckY - 3 - g, 20), C.steelDark, KIND.plain);
  }
  // main cables (parabola), backstays, hangers
  const N = 48;
  for (const dz of [-cableZ, cableZ]) {
    const cz = z + dz;
    let prev: V3 = [eu, H, cz];
    for (let i = 1; i <= N; i++) {
      const f = i / N;
      const x = eu + (as - eu) * f;
      const y = H - sag * (1 - (2 * f - 1) * (2 * f - 1));
      const cur: V3 = [x, y, cz];
      wire.push({ a: prev, b: cur, w: 0.9, minA: 0.6 });
      prev = cur;
    }
    for (const [tx, ax] of [
      [eu, eu - 300],
      [as, as + 300],
    ] as const) {
      const ag = ground(ax, z).h + 4;
      wire.push({ a: [tx, H, cz], b: [ax, ag, cz], w: 0.9, minA: 0.55 });
    }
    for (let x = eu + 18; x < as - 9; x += 18) {
      const f = (x - eu) / (as - eu);
      const y = H - sag * (1 - (2 * f - 1) * (2 * f - 1));
      wire.push({ a: [x, y, cz], b: [x, deckY + 1.5, cz], w: 0.3, minA: 0.3 });
    }
  }
}

// ---------------------------------------------------------------------------
// Modern towers far behind the old skyline: hazy flat silhouettes
// ---------------------------------------------------------------------------

function towers(b: ArchBuilder, P: ArchPrims, tops: V3[], quality: number): void {
  for (const t of TOWERS) {
    const r = rng(t.seed);
    const count = quality > 0 ? t.count : Math.ceil(t.count * 0.6);
    for (let i = 0; i < count; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * t.spread;
      const x = t.at[0] + Math.cos(a) * d;
      const z = t.at[1] + Math.sin(a) * d * 0.6;
      const g = ground(x, z).h - 2;
      const h = t.maxH * (0.35 + 0.65 * Math.pow(r(), 0.7)) * (1 - (d / t.spread) * 0.4);
      const w = 22 + r() * 22;
      const dd = 22 + r() * 20;
      const col = C.glass[Math.floor(r() * C.glass.length)];
      const yaw = (r() - 0.5) * 0.5;
      b.add(P.boxBase, xf(x, g, z, yaw, w, h, dd), col, KIND.glass);
      if (h > t.maxH * 0.6) tops.push([x, g + h + 1, z]);
      if (r() < 0.45)
        b.add(P.boxBase, xf(x, g + h, z, yaw, w * 0.62, h * 0.08, dd * 0.62), col, KIND.glass);
    }
  }
}

// ---------------------------------------------------------------------------
// Maiden's Tower must stand alone: nothing built in its backdrop
// ---------------------------------------------------------------------------

/** Ground positions of the hero (and contact) cameras: desktop, plus the phone offset if any. */
function towerViews(withContact: boolean): V2[] {
  const out: V2[] = [];
  const shots = withContact ? [SHOTS[0], SHOTS[SHOTS.length - 1]] : [SHOTS[0]];
  for (const s of shots) {
    out.push([s.pos[0], s.pos[2]]);
    const mob: unknown = "mob" in s ? s.mob : undefined;
    if (mob && typeof mob === "object" && "dx" in mob && "dz" in mob) {
      const { dx, dz } = mob;
      if (typeof dx === "number" && typeof dz === "number" && (dx !== 0 || dz !== 0))
        out.push([s.pos[0] + dx, s.pos[2] + dz]);
    }
  }
  return out;
}

/**
 * True when (x, z) lies behind Maiden's Tower as seen from a hero or contact camera,
 * inside the islet's silhouette plus ~40 px of open water on each side, and no more
 * than `maxBehind` metres beyond it (low houses only matter close behind the tower;
 * minarets on a far ridge still rise above it).
 */
function inTowerBackdrop(
  views: readonly V2[],
  x: number,
  z: number,
  maxBehind = Infinity
): boolean {
  const [tx, tz] = SITES.maiden;
  return views.some(([cx, cz]) => {
    const ax = tx - cx;
    const az = tz - cz;
    const bx = x - cx;
    const bz = z - cz;
    const la = Math.hypot(ax, az);
    const lb = Math.hypot(bx, bz);
    if (lb < la + 25 || lb > la + maxBehind) return false;
    const ang = Math.acos(clamp((ax * bx + az * bz) / (la * lb), -1, 1));
    return ang < Math.atan(48 / la) + 3 * DEG;
  });
}

/** Slide a landmark along its shore (keeping its distance inland) until it clears the backdrop. */
function clearOfTower(views: readonly V2[], at: V2, pad: number): V2 {
  const hit = (x: number, z: number): boolean =>
    inTowerBackdrop(views, x, z) ||
    inTowerBackdrop(views, x + pad, z) ||
    inTowerBackdrop(views, x - pad, z) ||
    inTowerBackdrop(views, x, z + pad) ||
    inTowerBackdrop(views, x, z - pad);
  if (!hit(at[0], at[1])) return at;
  const sh = ground(at[0], at[1]).shore;
  const { s, d } = sh.nearest(at[0], at[1]);
  // up the strait first (keeps the old city's skyline south of the tower uncluttered)
  const north = sh.at(s + 50).z < sh.at(s).z ? 1 : -1;
  for (const dir of [north, -north]) {
    for (let k = 1; k < 50; k++) {
      const p = sh.at(s + dir * k * 50);
      const [nx, nz] = sh.inland(p.tx, p.tz);
      const x = p.x + nx * d;
      const z = p.z + nz * d;
      if (!hit(x, z)) return [x, z];
    }
  }
  return at;
}

// ---------------------------------------------------------------------------
// The city fabric: terraces of 3–6-storey houses stepping up from the shore
// ---------------------------------------------------------------------------

interface Exclusion {
  x: number;
  z: number;
  r: number;
}

const blocked = (excl: Exclusion[], x: number, z: number, pad: number): boolean =>
  excl.some((e) => (e.x - x) ** 2 + (e.z - z) ** 2 < (e.r + pad) ** 2);

/** How much the cameras care about a spot (1 along the strait and its mouth, 0 far away). */
function importance(x: number, z: number, far: number): number {
  // distance to the camera corridor: up the strait, the Golden Horn mouth, the Marmara anchorage
  const segs: readonly [number, number, number, number][] = [
    [-100, -5600, 0, -1600],
    [0, -1600, -300, 1300],
    [-300, 1300, 300, 3600],
  ];
  let best = Infinity;
  for (const [ax, az, bx, bz] of segs) {
    const dx = bx - ax;
    const dz = bz - az;
    const f = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz), 0, 1);
    best = Math.min(best, Math.hypot(ax + dx * f - x, az + dz * f - z));
  }
  return 1 - smoothstep(1800, far, best);
}

type Vec = [number, number, number];

/**
 * One house: three walls (the back wall never faces the water) and a roof. Every wall
 * stores the street-front normal, so the shader gives all faces one value.
 */
function house(
  b: ArchBuilder,
  c: V2,
  n: V2,
  w: number,
  dep: number,
  y0: number,
  y1: number,
  wall: THREE.Color,
  roof: THREE.Color,
  roofKind: 0 | 1 | 2
): void {
  const [nx, nz] = n;
  // right-hand direction for someone on the water looking inland
  const rx = -nz;
  const rz = nx;
  const hw = w / 2;
  const hd = dep / 2;
  const at = (u: number, v: number, y: number): Vec => [
    c[0] + rx * u + nx * v,
    y,
    c[1] + rz * u + nz * v,
  ];
  const foot = wall.clone().multiplyScalar(0.62);
  const front: Vec = [-nx, 0, -nz];
  // front wall (faces the water), left and right walls
  b.quad(
    at(-hw, -hd, y0),
    at(hw, -hd, y0),
    at(hw, -hd, y1),
    at(-hw, -hd, y1),
    foot,
    KIND.facade,
    wall,
    front
  );
  b.quad(
    at(-hw, hd, y0),
    at(-hw, -hd, y0),
    at(-hw, -hd, y1),
    at(-hw, hd, y1),
    foot,
    KIND.facade,
    wall,
    front
  );
  b.quad(
    at(hw, -hd, y0),
    at(hw, hd, y0),
    at(hw, hd, y1),
    at(hw, -hd, y1),
    foot,
    KIND.facade,
    wall,
    front
  );
  // roof on the base rectangle P0..P3 (counter-clockwise from above: FL, FR, BR, BL)
  let p0 = at(-hw, -hd, y1);
  let p1 = at(hw, -hd, y1);
  let p2 = at(hw, hd, y1);
  let p3 = at(-hw, hd, y1);
  if (roofKind === 2) {
    b.quad(p0, p1, p2, p3, roof, KIND.roof);
    return;
  }
  if (dep > w) [p0, p1, p2, p3] = [p1, p2, p3, p0];
  const l01 = Math.hypot(p1[0] - p0[0], p1[2] - p0[2]);
  const l12 = Math.hypot(p2[0] - p1[0], p2[2] - p1[2]);
  const ux = (p1[0] - p0[0]) / l01;
  const uz = (p1[2] - p0[2]) / l01;
  const rh = l12 * (roofKind === 0 ? 0.27 : 0.3);
  const inset = roofKind === 0 ? l12 / 2 : 0;
  const ma: Vec = [(p0[0] + p3[0]) / 2 + ux * inset, y1 + rh, (p0[2] + p3[2]) / 2 + uz * inset];
  const mb: Vec = [(p1[0] + p2[0]) / 2 - ux * inset, y1 + rh, (p1[2] + p2[2]) / 2 - uz * inset];
  b.quad(p0, p1, mb, ma, roof, KIND.roof);
  b.quad(p2, p3, ma, mb, roof, KIND.roof);
  if (roofKind === 0) {
    b.tri(p3, p0, ma, roof, KIND.roof);
    b.tri(p1, p2, mb, roof, KIND.roof);
  } else {
    // gable ends are wall, lit like the rest of the house
    b.tri(p3, p0, ma, wall, KIND.facade, front);
    b.tri(p1, p2, mb, wall, KIND.facade, front);
  }
}

function cityFabric(
  b: ArchBuilder,
  excl: Exclusion[],
  views: readonly V2[],
  quality: number
): void {
  const r = rng(77);
  const hi = quality > 0;
  const far = hi ? 8200 : 5600;
  const pick = <T>(list: readonly T[]): T => list[Math.floor(r() * list.length)];
  for (const sh of SHORE_LIST) {
    let s = 0;
    while (s < sh.total) {
      const p = sh.at(s);
      const imp = importance(p.x, p.z, far);
      const city = sh.city(s);
      const width = (9 + r() * 11) * (hi ? 1 : 1.45) * (1 + (1 - imp) * 0.9);
      if (imp > 0.02 && city > 0.25) {
        const [nx, nz] = sh.inland(p.tx, p.tz);
        // upper Bosphorus: a sparse string of waterfront yalı; the city: rows climbing the hill
        const yali = city < 0.5;
        const rows = yali
          ? 1
          : 1 + Math.round((hi ? 3.2 : 0.9) * imp * smoothstep(0.45, 1, city) + r() * 0.4);
        let d = 10 + r() * 6;
        for (let row = 0; row < rows; row++) {
          const dep = 11 + r() * 8;
          const w = row === 0 ? width : width * (0.75 + r() * 0.5);
          const x = p.x + nx * (d + dep / 2);
          const z = p.z + nz * (d + dep / 2);
          const gap = row === 0 ? 0 : r() < 0.25 ? 1 : 0;
          const skip = yali ? r() > city * 1.4 : gap === 1;
          if (!skip && !blocked(excl, x, z, w * 0.5) && !inTowerBackdrop(views, x, z, 1800)) {
            const gF = sh.height(s, d, p.x + nx * d, p.z + nz * d);
            const gB = sh.height(s, d + dep, p.x + nx * (d + dep), p.z + nz * (d + dep));
            const tall = !yali && r() < 0.07 * city * imp;
            const storeys = yali
              ? 2 + Math.floor(r() * 2)
              : tall
                ? 7 + Math.floor(r() * 3)
                : 3 + Math.floor(Math.pow(r(), 1.25) * 4);
            const y0 = Math.min(gF, gB) - 2;
            const y1 = Math.max(gF, gB * 0.6 + gF * 0.4) + storeys * 3.1 + 1;
            const wallCol = (yali ? pick(C.yali) : pick(C.wall))
              .clone()
              .multiplyScalar(0.94 + r() * 0.1);
            const roll = r();
            const roofKind: 0 | 1 | 2 = tall || roll > 0.8 ? 2 : roll > 0.68 ? 1 : 0;
            const roof = roofKind === 2 ? pick(C.leadRoof) : pick(C.terra);
            house(b, [x, z], [nx, nz], w * 0.98, dep, y0, y1, wallCol, roof, roofKind);
          }
          d += dep + (row === 0 ? 6 + r() * 6 : 3 + r() * 7);
        }
      }
      s += width + (r() < 0.18 ? 3 + r() * 8 : 0.3);
    }
  }
}

// ---------------------------------------------------------------------------
// Cypress and umbrella-pine masses (ridges, parks, cemeteries)
// ---------------------------------------------------------------------------

function groves(
  b: ArchBuilder,
  P: ArchPrims,
  excl: Exclusion[],
  mosques: readonly { at: V2; scale: number }[],
  quality: number
): void {
  const r = rng(303);
  const hi = quality > 0;
  const far = hi ? 7600 : 5400;
  let budget = hi ? 520 : 170;
  const treeCol = (): THREE.Color =>
    C.tree[Math.floor(r() * C.tree.length)].clone().multiplyScalar(0.9 + r() * 0.2);
  const cypress = (x: number, y: number, z: number, h: number): void => {
    b.add(P.cypress, xf(x, y - 1.5, z, r() * 6, h * 0.14, h, h * 0.14), treeCol(), KIND.tree);
  };
  // cemetery cypresses around the mosques
  for (const m of mosques) {
    const n = hi ? 6 : 3;
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2;
      const d = (45 + r() * 35) * m.scale;
      const x = m.at[0] + Math.cos(a) * d;
      const z = m.at[1] + Math.sin(a) * d;
      const g = ground(x, z);
      if (g.d < 8) continue;
      cypress(x, g.h, z, 15 + r() * 8);
    }
  }
  // grove masses: one lumpy canopy per clump with a few cypress spikes above it, on the
  // painted forest masks (ridges, parks, the gaps between districts)
  for (const sh of SHORE_LIST) {
    const step = hi ? 60 : 100;
    for (let s = 0; s < sh.total && budget > 0; s += step * (0.7 + r() * 0.6)) {
      const p = sh.at(s);
      const imp = importance(p.x, p.z, far);
      if (imp < 0.05) continue;
      const [nx, nz] = sh.inland(p.tx, p.tz);
      // only on slopes seen against the land: on a far ridge a canopy reads as a dome
      for (const d0 of hi ? [40, 150, 290, 430] : [120, 360]) {
        const d = d0 * (0.85 + r() * 0.3);
        const x = p.x + nx * d;
        const z = p.z + nz * d;
        const m = forestMask(x, z, sh.city(s) * (1 - smoothstep(520, 1150, d)));
        if (m < 0.5 || r() > imp * m) continue;
        if (d < 160 && blocked(excl, x, z, 12)) continue;
        const y = sh.height(s, d, x, z);
        // the hill must keep rising behind the grove, or from the water it sits on the skyline
        const back = sh.height(s, d + 260, x + nx * 260, z + nz * 260);
        if (y < 3 || back < y + 14 || budget-- <= 0) continue;
        const size = (12 + r() * 10) * (1 + smoothstep(150, 450, d) * 0.4);
        b.add(
          P.grove,
          xf(x, y - 2.5, z, r() * 6, size, size * (0.3 + r() * 0.12), size * (0.7 + r() * 0.3)),
          treeCol(),
          KIND.tree
        );
        const spikes = d < 200 ? Math.floor(r() * (hi ? 3 : 2)) : 0;
        for (let i = 0; i < spikes; i++) {
          const ox = (r() - 0.5) * size;
          const oz = (r() - 0.5) * size;
          cypress(x + ox, sh.height(s, d, x + ox, z + oz), z + oz, size * (0.75 + r() * 0.35));
        }
      }
    }
  }
}

const VERT = /* glsl */ `
attribute vec4 aCol;
varying vec3 vPos;
varying vec3 vN;
varying vec3 vCol;
varying float vKind;
${SRGB_DECODE}
void main() {
  vPos = position;
  vN = normal;
  vCol = srgbToLinear(aCol.rgb);
  vKind = floor(aCol.a * 255.0 + 0.5);
  gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
}
`;

/** Shared facade logic for buildings and ships (window grids, night lights, flood lighting). */
export const FACADE = /* glsl */ `
vec3 facade(vec3 alb, float kind, vec3 lp, vec3 n, float foot, out vec3 emit) {
  emit = vec3(0.0);
  float vertical = 1.0 - smoothstep(0.3, 0.6, abs(n.y));
  vec3 tng = normalize(vec3(-n.z, 0.0, n.x) + vec3(1e-5, 0.0, 0.0));
  float fu = dot(lp, tng);
  float fv = lp.y;
  vec3 warm = ${glslColor(0xffc477)};
  if (kind > 0.5 && kind < 1.5) {
    vec2 g = vec2(fu / 3.4, fv / 3.1);
    vec2 id = floor(g);
    vec2 f = fract(g);
    float win = step(0.3, f.x) * step(f.x, 0.72) * step(0.3, f.y) * step(f.y, 0.78);
    float detail = 1.0 - smoothstep(1.1, 2.4, foot / 3.1);
    float w = mix(0.2, win, detail) * vertical;
    alb = mix(alb, alb * 0.55, w * 0.7);
    float lit = step(0.72, hash12(id + floor(lp.xz / 40.0) * 7.0));
    emit = warm * mix(0.1, lit * win, detail) * vertical * 2.2;
  } else if (kind > 1.5 && kind < 2.5) {
    vec2 g = vec2(fu / 6.0, fv / 8.5);
    vec2 f = fract(g);
    float arch = length((f - vec2(0.5, 0.62)) * vec2(1.0, 1.3));
    float win = step(abs(f.x - 0.5), 0.17) * step(0.16, f.y) * step(f.y, 0.62) + step(arch, 0.17) * step(0.62, f.y);
    float pil = (1.0 - smoothstep(0.0, 0.06, f.x)) + smoothstep(0.94, 1.0, f.x);
    float detail = 1.0 - smoothstep(1.2, 2.6, foot / 6.0);
    alb = mix(alb, alb * 0.5, mix(0.22, clamp(win, 0.0, 1.0), detail) * vertical);
    alb = mix(alb, alb * 1.08, pil * detail * vertical);
    emit = warm * (0.4 + 0.5 * mix(0.25, clamp(win, 0.0, 1.0), detail)) * vertical * 0.9;
  } else if (kind > 5.5 && kind < 6.5) {
    vec2 g = vec2(fu / 2.6, fv / 3.6);
    vec2 id = floor(g);
    vec2 f = fract(g);
    float mull = step(0.12, f.x) * step(0.14, f.y);
    float detail = 1.0 - smoothstep(1.0, 2.2, foot / 2.6);
    alb = mix(alb, alb * 0.86, (1.0 - mix(0.85, mull, detail)) * vertical);
    float lit = step(0.8, hash12(id * vec2(1.0, 3.0) + floor(lp.xz / 30.0) * 5.0));
    emit = ${glslColor(0xe8ecf0)} * mix(0.12, lit * mull, detail) * vertical * 1.2;
  } else if (kind > 6.5 && kind < 7.5) {
    emit = warm * 2.6;
  } else if (kind > 8.5 && kind < 9.5) {
    // floodlit stone at night (mosques, towers)
    emit = ${glslColor(0xffcf8a)} * (0.16 + 0.3 * smoothstep(0.0, 40.0, lp.y));
  } else if (kind > 2.5 && kind < 3.5) {
    emit = ${glslColor(0xffcf8a)} * 0.1;
  }
  return alb;
}
`;

const FRAG = /* glsl */ `
${COMMON}
${FACADE}
${CITY_GLSL}
varying vec3 vPos;
varying vec3 vN;
varying vec3 vCol;
varying float vKind;

void main() {
  vec3 toCam = cameraPosition - vPos;
  float dist = length(toCam);
  vec3 V = toCam / dist;
  vec3 n = normalize(vN);
  float foot = dist * uPixAng;
  float k = vKind;
  vec3 col;
  vec3 emit = vec3(0.0);
  vec3 ambMid = mix(uAmbLow, uAmbTop, 0.62);
  if (k > 9.5 && k < 10.5) {
    // city façade: every wall carries its street-front normal, so a house is one value
    // (lit by how its street faces the light), with quiet windows by day and sparse lamps at night
    float lit = 0.3 + 0.7 * smoothstep(-0.25, 0.55, dot(n, uKeyDir));
    vec2 t = normalize(vec2(-n.z, n.x) + 1e-5);
    float u = dot(vPos.xz, t) + dot(vPos.xz, n.xz);
    vec2 g = vec2(u / 3.3, vPos.y / 3.1);
    vec2 id = floor(g);
    vec2 f = fract(g);
    float win = step(0.3, f.x) * step(f.x, 0.7) * step(0.3, f.y) * step(f.y, 0.76);
    float detail = 1.0 - smoothstep(1.2, 2.8, foot / 3.1);
    vec3 alb = vCol * (1.0 - 0.17 * mix(0.17, win, detail));
    col = alb * (ambMid + uKeyCol * lit * 0.72);
    float h = hash12(id + floor(vPos.xz / 37.0) * 3.1);
    float on = step(0.88, h);
    vec3 wc = h > 0.965 ? ${glslColor(0xf3e6c8)} : ${glslColor(0xffbf72)};
    emit = wc * mix(0.12 * 0.18, on * win, detail) * 1.9 * cityDim(vPos.xz);
  } else if (k > 10.5 && k < 11.5) {
    // roofs: terracotta and lead, a gentle light/shade split between the slopes
    float lit = 0.4 + 0.6 * smoothstep(-0.2, 0.7, dot(n, uKeyDir));
    vec3 amb = mix(uAmbLow, uAmbTop, clamp(n.y * 0.5 + 0.5, 0.0, 1.0));
    col = vCol * (amb * 0.92 + uKeyCol * lit * 0.62);
  } else if (k > 11.5 && k < 12.5) {
    // tree masses: dark, with a little light on the crown
    float lit = smoothstep(-0.2, 0.8, dot(n, uKeyDir));
    col = vCol * (mix(uAmbLow, uAmbTop, 0.5 + 0.5 * n.y) * 0.9 + uKeyCol * lit * 0.45);
  } else if (k > 12.5 && k < 13.5) {
    // islet rocks and quay: wet and dark at the waterline
    vec3 alb = mix(vCol * 0.42, vCol, smoothstep(0.2, 1.8, vPos.y));
    col = shadeSolid(alb, n, V, 0.25);
  } else if (k > 13.5) {
    // Maiden's Tower walls: soft stone by day; at night floodlit with every arched window warm
    vec3 tng = normalize(vec3(-n.z, 0.0, n.x) + vec3(1e-5, 0.0, 0.0));
    vec2 g = vec2(dot(vPos, tng) / 3.2, vPos.y / 5.2);
    vec2 f = fract(g);
    float arch = length((f - vec2(0.5, 0.6)) * vec2(1.0, 1.4));
    float win = step(abs(f.x - 0.5), 0.16) * step(0.18, f.y) * step(f.y, 0.6) + step(arch, 0.16) * step(0.6, f.y);
    win = clamp(win, 0.0, 1.0) * (1.0 - smoothstep(0.3, 0.6, abs(n.y)));
    float detail = 1.0 - smoothstep(1.2, 2.6, foot / 3.2);
    vec3 alb = vCol * (1.0 - 0.3 * mix(0.2, win, detail));
    col = shadeSolid(alb, n, V, 0.4);
    emit = ${glslColor(0xffd296)} * (0.42 + 0.25 * smoothstep(3.0, 30.0, vPos.y)) + ${glslColor(0xffb45c)} * mix(0.22, win, detail) * 2.6;
  } else {
    vec3 alb = facade(vCol, k, vPos, n, foot, emit);
    col = shadeSolid(alb, n, V, 0.35);
    if (k > 2.5 && k < 3.5) {
      // lead sheen on domes and caps
      vec3 H = normalize(uKeyDir + V);
      col += uKeyCol * pow(max(dot(n, H), 0.0), 24.0) * 0.25;
    }
    // floodlit stone, the palace and lit windows all stay behind Maiden's Tower at night
    if (k > 0.5 && k < 2.5 || k > 5.5 && k < 6.5 || k > 8.5 && k < 9.5) emit *= cityDim(vPos.xz);
  }
  col += emit * uNight;
  float fog = fogAmount(dist, vPos.y);
  col = mix(col, hazeColor(-V), fog);
  gl_FragColor = vec4(col, 0.32);
}
`;

export interface Landmarks {
  mesh: THREE.Mesh;
  wires: WireSeg[];
  towerTops: V3[];
}

export function createLandmarks(shared: SharedUniforms, quality: number): Landmarks {
  const b = new ArchBuilder();
  const P = archPrims(quality);
  const wires: WireSeg[] = [];
  const excl: Exclusion[] = [
    { x: SITES.ortakoy[0], z: SITES.ortakoy[1], r: 60 },
    { x: SITES.bridge.eu, z: SITES.bridge.z, r: 60 },
    { x: SITES.bridge.as, z: SITES.bridge.z, r: 60 },
    { x: SITES.galata[0], z: SITES.galata[1], r: 40 },
  ];
  const [pax, paz] = SITES.palace.a;
  const [pbx, pbz] = SITES.palace.b;
  for (let i = 0; i <= 8; i++)
    excl.push({ x: pax + ((pbx - pax) * i) / 8, z: paz + ((pbz - paz) * i) / 8, r: 62 });
  // houses stay out of the tower's backdrop in the hero and contact views; mosques are
  // placed in world.ts and only nudged along their shore if a hero camera puts one behind it
  const views = towerViews(true);
  const heroViews = towerViews(false);
  const mosques = MOSQUES.map((m) => ({ ...m, at: clearOfTower(heroViews, m.at, 45 * m.scale) }));
  for (const m of mosques) excl.push({ x: m.at[0], z: m.at[1], r: 50 * m.scale });
  for (const m of mosques) mosque(b, P, wires, m.at, m.kind, m.scale, m.yaw);
  galata(b, P);
  maiden(b, P);
  palace(b, P);
  bridge(b, P, wires);
  const towerTops: V3[] = [];
  towers(b, P, towerTops, quality);
  cityFabric(b, excl, views, quality);
  groves(b, P, excl, mosques, quality);
  const geo = b.build();
  const material = new THREE.ShaderMaterial({
    name: "voyage-architecture",
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: { ...shared },
  });
  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false;
  return { mesh, wires, towerTops };
}
