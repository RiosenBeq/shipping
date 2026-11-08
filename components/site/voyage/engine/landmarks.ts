import * as THREE from "three";
import { COMMON, type SharedUniforms } from "./glsl";
import { Builder, KIND, PRIM, xf } from "./geom";
import { glslColor } from "./land";
import { lin } from "./palette";
import { DEG, rng, type V2, type V3 } from "./math";
import { MOSQUES, SHORE_LIST, SITES, TOWERS, ground, type MosqueKind } from "./world";

const C = {
  stone: lin(0xdcd5c6),
  stoneWarm: lin(0xd7c7ab),
  hagia: lin(0xc99a7f),
  lead: lin(0x7c8890),
  leadDark: lin(0x56626b),
  rock: lin(0x8e877b),
  white: lin(0xece6d8),
  steel: lin(0xc9ced0),
  brass: lin(0xb8893a),
  glassA: lin(0x8c9aa3),
  glassB: lin(0xb6c0c5),
  glassC: lin(0x5a6872),
  city: [lin(0xdccdb0), lin(0xe9e3d4), lin(0xc9a676), lin(0xb9b2a4), lin(0xd2c2a0), lin(0x9ea4a6)],
};

/** Thin linear features (bridge cables, hangers) drawn as screen-space lines. */
export interface WireSeg {
  a: V3;
  b: V3;
  w: number;
}

type Place = (lx: number, lz: number) => V2;
function placer(x: number, z: number, yawDeg: number): Place {
  const c = Math.cos(yawDeg * DEG);
  const s = Math.sin(yawDeg * DEG);
  return (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
}

function minaret(
  b: Builder,
  x: number,
  y0: number,
  z: number,
  h: number,
  r: number,
  balconies: number,
  stone: THREE.Color
): void {
  b.add(PRIM.cyl8, xf(x, y0, z, 0, r * 1.5, h * 0.14, r * 1.5), stone, KIND.stone);
  b.add(PRIM.cyl12, xf(x, y0, z, 0, r, h * 0.86, r), stone, KIND.stone);
  for (let i = 0; i < balconies; i++) {
    const by = y0 + h * (0.6 + i * 0.12);
    b.add(
      PRIM.cyl12,
      xf(x, by, z, 0, r * 1.55, Math.max(0.6, h * 0.016), r * 1.55),
      stone,
      KIND.stone
    );
  }
  b.add(PRIM.cyl12, xf(x, y0 + h * 0.86, z, 0, r * 0.82, h * 0.06, r * 0.82), stone, KIND.stone);
  b.add(PRIM.cone12, xf(x, y0 + h * 0.92, z, 0, r * 0.95, h * 0.2, r * 0.95), C.lead, KIND.lead);
  b.add(PRIM.cyl8, xf(x, y0 + h * 1.12, z, 0, r * 0.1, h * 0.035, r * 0.1), C.brass, KIND.plain);
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
      return {
        base: [22, 15, 22],
        dome: 8.5,
        domeY: 1.0,
        semi: 0,
        minarets: [
          [-12.5, 10],
          [12.5, 10],
        ],
        minH: 38,
        minR: 1.25,
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
  b: Builder,
  wire: WireSeg[],
  at: V2,
  kind: MosqueKind,
  scale: number,
  yawDeg: number
): void {
  const sp = mosqueSpec(kind);
  const g = ground(at[0], at[1]).h;
  const y0 = g - 1;
  const P = placer(at[0], at[1], yawDeg);
  const k = scale;
  const yaw = yawDeg * DEG;
  const [bw, bh, bd] = sp.base;
  b.add(PRIM.boxBase, xf(at[0], y0, at[1], yaw, bw * k, bh * k, bd * k), sp.stone, KIND.stone);
  // stepped cornice + drum
  b.add(
    PRIM.boxBase,
    xf(at[0], y0 + bh * k, at[1], yaw, bw * 0.78 * k, 2.2 * k, bd * 0.78 * k),
    sp.stone,
    KIND.stone
  );
  const drumY = y0 + (bh + 2.2) * k;
  b.add(
    PRIM.cyl20,
    xf(at[0], drumY, at[1], 0, sp.dome * 0.98 * k, 4.2 * k, sp.dome * 0.98 * k),
    sp.stone,
    KIND.stone
  );
  b.add(
    PRIM.dome,
    xf(at[0], drumY + 4.2 * k, at[1], 0, sp.dome * k, sp.dome * sp.domeY * k, sp.dome * k),
    C.lead,
    KIND.lead
  );
  b.add(
    PRIM.cyl8,
    xf(at[0], drumY + 4.2 * k + sp.dome * sp.domeY * k, at[1], 0, 0.3 * k, 4 * k, 0.3 * k),
    C.brass,
    KIND.plain
  );
  // cascading semi-domes on the main axes
  for (let i = 0; i < sp.semi; i++) {
    const ang = yaw + (i * Math.PI) / 2;
    const [sx, sz] = P(
      Math.sin((i * Math.PI) / 2) * sp.dome * 0.95 * k,
      Math.cos((i * Math.PI) / 2) * sp.dome * 0.95 * k
    );
    b.add(
      PRIM.halfDome,
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
      const [sx, sz] = P(cx * bw * 0.36 * k, cz * bd * 0.36 * k);
      b.add(
        PRIM.cyl12,
        xf(sx, y0 + bh * k, sz, 0, 3.8 * k, 1.8 * k, 3.8 * k),
        sp.stone,
        KIND.stone
      );
      b.add(
        PRIM.domeLo,
        xf(sx, y0 + (bh + 1.8) * k, sz, 0, 3.9 * k, 3.4 * k, 3.9 * k),
        C.lead,
        KIND.lead
      );
    }
    // courtyard arcade (low) in front
    const [fx, fz] = P(0, bd * 0.95 * k);
    b.add(
      PRIM.boxBase,
      xf(fx, y0, fz, yaw, bw * 0.95 * k, 9 * k, bd * 0.9 * k),
      sp.stone,
      KIND.stone
    );
    for (let i = -2; i <= 2; i++) {
      const [ax, az] = P(i * bw * 0.18 * k, bd * 1.32 * k);
      b.add(PRIM.domeLo, xf(ax, y0 + 9 * k, az, 0, 3 * k, 2.6 * k, 3 * k), C.lead, KIND.lead);
    }
  }
  if (kind === "hagia") {
    // heavy buttresses
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const [px, pz] = P(sx * bw * 0.42 * k, sz * bd * 0.2 * k);
        b.add(
          PRIM.boxBase,
          xf(px, y0, pz, yaw, 10 * k, (bh + 8) * k, 14 * k),
          sp.stone,
          KIND.stone
        );
      }
    }
  }
  for (const [mx, mz] of sp.minarets) {
    const [x, z] = P(mx * k, mz * k);
    const gy = Math.min(y0 + 1, ground(x, z).h - 0.5);
    minaret(b, x, gy, z, sp.minH * k, sp.minR * k, sp.balconies, sp.stone);
  }
  // the crescent mast on the main dome reads as a hairline at distance
  wire.push({
    a: [at[0], drumY + 4.2 * k + sp.dome * sp.domeY * k, at[1]],
    b: [at[0], drumY + 4.2 * k + sp.dome * sp.domeY * k + 6 * k, at[1]],
    w: 0.35 * k,
  });
}

function galata(b: Builder): void {
  const [x, z] = SITES.galata;
  const g = ground(x, z).h - 1;
  const k = 1.25;
  b.add(PRIM.cyl20, xf(x, g, z, 0, 8.8 * k, 49 * k, 8.8 * k), C.stoneWarm, KIND.stone);
  b.add(PRIM.cyl20, xf(x, g + 47 * k, z, 0, 9.8 * k, 2.2 * k, 9.8 * k), C.stoneWarm, KIND.stone);
  b.add(PRIM.cyl20, xf(x, g + 49 * k, z, 0, 8.2 * k, 7.5 * k, 8.2 * k), C.stoneWarm, KIND.windows);
  b.add(PRIM.cone12, xf(x, g + 56.5 * k, z, 0, 9.2 * k, 19 * k, 9.2 * k), C.leadDark, KIND.lead);
  b.add(PRIM.cyl8, xf(x, g + 75 * k, z, 0, 0.35 * k, 5 * k, 0.35 * k), C.brass, KIND.plain);
}

/** Kız Kulesi on its islet (scaled up ~1.45× so it reads in the hero and contact frames). */
export const MAIDEN_SCALE = 1.45;
function maiden(b: Builder): void {
  const [x, z] = SITES.maiden;
  const k = MAIDEN_SCALE;
  b.add(PRIM.cyl20, xf(x, -2.5, z + 4 * k, 0, 30 * k, 5.2, 21 * k), C.rock, KIND.plain);
  b.add(PRIM.cyl12, xf(x - 9 * k, -2, z + 14 * k, 0.4, 12 * k, 3.6, 8 * k), C.rock, KIND.plain);
  // seawall terrace
  b.add(PRIM.boxBase, xf(x, 2.5, z + 3 * k, 0, 40 * k, 2.2, 28 * k), C.stoneWarm, KIND.stone);
  // low wing to the south
  b.add(
    PRIM.boxBase,
    xf(x + 3 * k, 4.6, z + 9 * k, 0, 26 * k, 6.5 * k, 11 * k),
    C.white,
    KIND.windows
  );
  b.add(
    PRIM.boxBase,
    xf(x + 3 * k, 4.6 + 6.5 * k, z + 9 * k, 0, 27 * k, 0.8 * k, 12 * k),
    C.leadDark,
    KIND.lead
  );
  // tower: square base, octagonal shaft, gallery, lantern, lead cupola, mast
  const ty = 4.6;
  b.add(
    PRIM.boxBase,
    xf(x - 4 * k, ty, z - 2 * k, 0, 11 * k, 12 * k, 11 * k),
    C.white,
    KIND.windows
  );
  b.add(
    PRIM.cyl8,
    xf(x - 4 * k, ty + 12 * k, z - 2 * k, Math.PI / 8, 5.3 * k, 9.5 * k, 5.3 * k),
    C.white,
    KIND.windows
  );
  b.add(
    PRIM.cyl8,
    xf(x - 4 * k, ty + 21.5 * k, z - 2 * k, Math.PI / 8, 6.4 * k, 0.9 * k, 6.4 * k),
    C.stoneWarm,
    KIND.stone
  );
  b.add(
    PRIM.cyl8,
    xf(x - 4 * k, ty + 22.4 * k, z - 2 * k, Math.PI / 8, 3.6 * k, 3.6 * k, 3.6 * k),
    C.white,
    KIND.lamp
  );
  b.add(
    PRIM.cone8,
    xf(x - 4 * k, ty + 26 * k, z - 2 * k, Math.PI / 8, 4.3 * k, 6.5 * k, 4.3 * k),
    C.leadDark,
    KIND.lead
  );
}

/** Top of the Maiden's Tower mast (world), for the beacon. */
export function maidenBeacon(): V3 {
  const [x, z] = SITES.maiden;
  return [x - 4 * MAIDEN_SCALE, 4.6 + 32.5 * MAIDEN_SCALE, z - 2 * MAIDEN_SCALE];
}

function palace(b: Builder): void {
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
      PRIM.boxBase,
      xf(cx, 1.2, cz, yaw, (len / seg) * 1.01, h + g - 1.2, 34),
      C.white,
      KIND.palace
    );
    b.add(PRIM.boxBase, xf(cx, g + h, cz, yaw, (len / seg) * 0.98, 1.6, 30), C.lead, KIND.lead);
  }
  // quay wall in front
  b.add(
    PRIM.boxBase,
    xf(ax + tx * len * 0.5 + nx * 3, -1, az + tz * len * 0.5 + nz * 3, yaw, len * 1.04, 3.2, 6),
    C.stoneWarm,
    KIND.stone
  );
}

function bridge(b: Builder, wire: WireSeg[]): void {
  const { z, eu, as } = SITES.bridge;
  const H = 200;
  const deckY = 70;
  for (const x of [eu, as]) {
    const g = ground(x, z).h - 2;
    for (const dz of [-18, 18])
      b.add(PRIM.boxBase, xf(x, g, z + dz, 0, 7, H - g, 7), C.steel, KIND.plain);
    for (const y of [deckY - 6, 135, H - 6])
      b.add(PRIM.boxBase, xf(x, y, z, 0, 6, 5, 43), C.steel, KIND.plain);
  }
  const x0 = eu - 330;
  const x1 = as + 330;
  b.add(PRIM.boxBase, xf((x0 + x1) / 2, deckY - 2.5, z, 0, x1 - x0, 4.2, 33), C.steel, KIND.plain);
  // gentle camber: a thin dark underside line
  b.add(
    PRIM.boxBase,
    xf((x0 + x1) / 2, deckY - 3.4, z, 0, x1 - x0, 0.9, 30),
    lin(0x6d7478),
    KIND.plain
  );
  // main cables (parabola), backstays, hangers
  const sag = 112;
  const N = 48;
  for (const dz of [-16.5, 16.5]) {
    const cz = z + dz;
    let prev: V3 = [eu, H, cz];
    for (let i = 1; i <= N; i++) {
      const f = i / N;
      const x = eu + (as - eu) * f;
      const y = H - sag * (1 - (2 * f - 1) * (2 * f - 1));
      const cur: V3 = [x, y, cz];
      wire.push({ a: prev, b: cur, w: 0.75 });
      prev = cur;
    }
    for (const [tx, ax] of [
      [eu, eu - 300],
      [as, as + 300],
    ] as const) {
      const ag = ground(ax, z).h + 4;
      wire.push({ a: [tx, H, cz], b: [ax, ag, cz], w: 0.75 });
    }
    for (let x = eu + 18; x < as - 9; x += 18) {
      const f = (x - eu) / (as - eu);
      const y = H - sag * (1 - (2 * f - 1) * (2 * f - 1));
      wire.push({ a: [x, y, cz], b: [x + 9, deckY + 1.5, cz], w: 0.16 });
    }
  }
}

function towers(b: Builder, tops: V3[]): void {
  for (const t of TOWERS) {
    const r = rng(t.seed);
    for (let i = 0; i < t.count; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * t.spread;
      const x = t.at[0] + Math.cos(a) * d;
      const z = t.at[1] + Math.sin(a) * d * 0.6;
      const g = ground(x, z).h - 2;
      const h = t.maxH * (0.35 + 0.65 * Math.pow(r(), 0.7)) * (1 - (d / t.spread) * 0.4);
      const w = 22 + r() * 22;
      const dd = 22 + r() * 20;
      const col = [C.glassA, C.glassB, C.glassC][Math.floor(r() * 3)];
      const yaw = (r() - 0.5) * 0.5;
      b.add(PRIM.boxBase, xf(x, g, z, yaw, w, h, dd), col, KIND.glass);
      if (h > t.maxH * 0.6) tops.push([x, g + h + 1, z]);
      if (r() < 0.45)
        b.add(PRIM.boxBase, xf(x, g + h, z, yaw, w * 0.62, h * 0.08, dd * 0.62), col, KIND.glass);
      if (r() < 0.3)
        b.add(
          PRIM.cone8,
          xf(x, g + h * (r() < 0.5 ? 1 : 1.08), z, 0, 1.2, h * 0.16, 1.2),
          C.steel,
          KIND.plain
        );
    }
  }
}

interface Exclusion {
  x: number;
  z: number;
  r: number;
}

function waterfront(b: Builder, excl: Exclusion[], quality: number): void {
  const r = rng(77);
  const range = quality > 0 ? 8200 : 6000;
  for (const sh of SHORE_LIST) {
    let s = 0;
    while (s < sh.total) {
      const p = sh.at(s);
      const step = 15 + r() * 18;
      const dc = Math.hypot(p.x, p.z + 2600);
      const city = sh.city(s);
      if (dc < range && city > 0.35) {
        const [nx, nz] = sh.inland(p.tx, p.tz);
        const yaw = Math.atan2(-p.tz, p.tx);
        for (let row = 0; row < 2; row++) {
          if (row === 1 && (quality === 0 || r() < 0.3)) continue;
          const d = row === 0 ? 13 + r() * 10 : 46 + r() * 22;
          const x = p.x + nx * d;
          const z = p.z + nz * d;
          if (excl.some((e) => Math.hypot(e.x - x, e.z - z) < e.r)) continue;
          const g = sh.height(sh.nearest(x, z).s, d, x, z);
          const h = (row === 0 ? 7 : 10) + r() * (row === 0 ? 11 : 17) * (0.5 + city * 0.6);
          const dep = 12 + r() * 14;
          const col = C.city[Math.floor(r() * C.city.length)];
          b.add(
            PRIM.boxBase,
            xf(x, Math.min(g, 1.5) - 1, z, yaw, step * 0.9, h + Math.max(0, g - 1.5) + 1, dep),
            col,
            KIND.windows
          );
          if (r() < 0.55) {
            const roof = lin(r() < 0.5 ? 0xa86d50 : 0x8b8f91);
            b.add(
              PRIM.boxBase,
              xf(x, g + h, z, yaw, step * 0.92, 0.9, dep * 1.02),
              roof,
              KIND.plain
            );
          }
        }
      }
      s += step;
    }
  }
}

const VERT = /* glsl */ `
attribute vec3 aCol;
attribute float aKind;
varying vec3 vPos;
varying vec3 vN;
varying vec3 vCol;
varying float vKind;
void main() {
  vPos = position;
  vN = normal;
  vCol = aCol;
  vKind = aKind;
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
    alb = mix(alb, alb * 0.42, w * 0.85);
    float lit = step(0.6, hash12(id + floor(lp.xz / 40.0) * 7.0));
    emit = warm * mix(0.16, lit * win, detail) * vertical * 2.4;
  } else if (kind > 1.5 && kind < 2.5) {
    vec2 g = vec2(fu / 6.0, fv / 8.5);
    vec2 f = fract(g);
    float arch = length((f - vec2(0.5, 0.62)) * vec2(1.0, 1.3));
    float win = step(abs(f.x - 0.5), 0.17) * step(0.16, f.y) * step(f.y, 0.62) + step(arch, 0.17) * step(0.62, f.y);
    float pil = (1.0 - smoothstep(0.0, 0.06, f.x)) + smoothstep(0.94, 1.0, f.x);
    float detail = 1.0 - smoothstep(1.2, 2.6, foot / 6.0);
    alb = mix(alb, alb * 0.5, mix(0.22, clamp(win, 0.0, 1.0), detail) * vertical);
    alb = mix(alb, alb * 1.08, pil * detail * vertical);
    emit = warm * (0.55 + 0.6 * mix(0.25, clamp(win, 0.0, 1.0), detail)) * vertical * 0.9;
  } else if (kind > 5.5 && kind < 6.5) {
    vec2 g = vec2(fu / 2.6, fv / 3.6);
    vec2 id = floor(g);
    vec2 f = fract(g);
    float mull = step(0.12, f.x) * step(0.14, f.y);
    float detail = 1.0 - smoothstep(1.0, 2.2, foot / 2.6);
    alb = mix(alb, alb * 0.75, (1.0 - mix(0.85, mull, detail)) * vertical);
    float lit = step(0.55, hash12(id * vec2(1.0, 3.0) + floor(lp.xz / 30.0) * 5.0));
    emit = ${glslColor(0xe8ecf0)} * mix(0.32, lit * mull, detail) * vertical * 1.6;
  } else if (kind > 6.5 && kind < 7.5) {
    emit = warm * 2.6;
  } else if (kind > 8.5 && kind < 9.5) {
    // floodlit stone at night (mosques, towers)
    emit = ${glslColor(0xffcf8a)} * (0.18 + 0.32 * smoothstep(0.0, 40.0, lp.y)) * 1.1;
  } else if (kind > 2.5 && kind < 3.5) {
    emit = ${glslColor(0xffcf8a)} * 0.12;
  }
  return alb;
}
`;

const FRAG = /* glsl */ `
${COMMON}
${FACADE}
varying vec3 vPos;
varying vec3 vN;
varying vec3 vCol;
varying float vKind;
void main() {
  vec3 toCam = cameraPosition - vPos;
  float dist = length(toCam);
  vec3 V = toCam / dist;
  vec3 n = normalize(vN);
  if (!gl_FrontFacing) n = -n;
  float foot = dist * uPixAng;
  vec3 emit;
  vec3 alb = facade(vCol, vKind, vPos, n, foot, emit);
  vec3 col = shadeSolid(alb, n, V, 0.35);
  if (vKind > 2.5 && vKind < 3.5) {
    // lead sheen on domes and caps
    vec3 H = normalize(uKeyDir + V);
    col += uKeyCol * pow(max(dot(n, H), 0.0), 24.0) * 0.25;
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
  const b = new Builder();
  const wires: WireSeg[] = [];
  const excl: Exclusion[] = [
    { x: SITES.ortakoy[0], z: SITES.ortakoy[1], r: 70 },
    { x: SITES.bridge.eu, z: SITES.bridge.z, r: 60 },
    { x: SITES.bridge.as, z: SITES.bridge.z, r: 60 },
    { x: SITES.galata[0], z: SITES.galata[1], r: 50 },
  ];
  const [pax, paz] = SITES.palace.a;
  const [pbx, pbz] = SITES.palace.b;
  for (let i = 0; i <= 8; i++)
    excl.push({ x: pax + ((pbx - pax) * i) / 8, z: paz + ((pbz - paz) * i) / 8, r: 75 });
  for (const m of MOSQUES) excl.push({ x: m.at[0], z: m.at[1], r: 55 * m.scale });
  for (const m of MOSQUES) mosque(b, wires, m.at, m.kind, m.scale, m.yaw);
  galata(b);
  maiden(b);
  palace(b);
  bridge(b, wires);
  const towerTops: V3[] = [];
  towers(b, towerTops);
  waterfront(b, excl, quality);
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
