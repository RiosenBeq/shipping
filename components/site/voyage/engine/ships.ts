import * as THREE from "three";
import { COMMON, type SharedUniforms } from "./glsl";
import { Builder, KIND, PRIM, xf } from "./geom";
import { FACADE } from "./landmarks";
import { glslColor } from "./land";
import { lin } from "./palette";
import { clamp, lerp } from "./math";
import type { ShipKind } from "./world";
import { sampleSwell } from "./ocean";
import { SHOTS } from "./timeline";

/** Ship-local frame: +x bow, +y up (waterline at 0), +z starboard. */
interface HullSpec {
  L: number;
  B: number;
  F: number;
  bowLen: number;
  sternLen: number;
  rake: number;
}

const BELOW = 5;

/** Lofted hull from horizontal waterline slices: raked stem, flared bow, slight transom taper. */
function hullGeometry(
  s: HullSpec,
  N: number
): {
  side: THREE.BufferGeometry;
  deck: THREE.BufferGeometry;
  sheer: THREE.BufferGeometry;
} {
  const levels = [-BELOW, -1.4, 0.6, s.F * 0.45, s.F * 0.82, s.F];
  const warp = (u: number): number => {
    // 45 % of stations in the bow entrance, the rest spread aft
    const k = 0.55;
    return u < k ? (u / k) * 0.78 : 0.78 + ((u - k) / (1 - k)) * 0.22;
  };
  const ring = (y: number): { x: number; hb: number }[] => {
    const yn = clamp((y + BELOW) / (s.F + BELOW), 0, 1);
    const xb = s.L / 2 - s.rake * (1 - yn) * (1 - yn * 0.4);
    const xs = -s.L / 2 + 0.8 * (1 - yn);
    const out: { x: number; hb: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const x = xs + (xb - xs) * warp(i / N);
      let hb = s.B / 2;
      const x0 = xb - s.bowLen;
      if (x > x0) {
        const t = clamp((x - x0) / (xb - x0), 0, 1);
        const e = lerp(1.65, 2.7, yn);
        hb *= Math.pow(Math.max(0, 1 - Math.pow(t, e)), 1 / e);
      }
      const x1 = xs + s.sternLen;
      if (x < x1) {
        const t = (x1 - x) / s.sternLen;
        hb *= 1 - t * t * (0.12 + 0.45 * (1 - yn));
      }
      out.push({ x, hb });
    }
    return out;
  };
  const rings = levels.map((y) => ({ y, pts: ring(y) }));
  const pos: number[] = [];
  const idx: number[] = [];
  const P = N + 1;
  // starboard grid then port grid
  for (const side of [1, -1]) {
    const base = pos.length / 3;
    for (const r of rings) for (const p of r.pts) pos.push(p.x, r.y, side * p.hb);
    for (let j = 0; j < rings.length - 1; j++) {
      for (let i = 0; i < N; i++) {
        const a = base + j * P + i;
        const b = a + 1;
        const c = a + P;
        const d = c + 1;
        if (side > 0) idx.push(a, b, d, a, d, c);
        else idx.push(a, d, b, a, c, d);
      }
    }
  }
  const sideGeo = new THREE.BufferGeometry();
  sideGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  sideGeo.setIndex(idx);
  sideGeo.computeVertexNormals();

  // deck + transom (flat shaded)
  const top = rings[rings.length - 1];
  const dp: number[] = [];
  for (let i = 0; i < N; i++) {
    const a = top.pts[i];
    const b = top.pts[i + 1];
    dp.push(a.x, s.F, a.hb, b.x, s.F, b.hb, b.x, s.F, -b.hb);
    dp.push(a.x, s.F, a.hb, b.x, s.F, -b.hb, a.x, s.F, -a.hb);
  }
  for (let j = 0; j < rings.length - 1; j++) {
    const a = rings[j].pts[0];
    const b = rings[j + 1].pts[0];
    const ya = rings[j].y;
    const yb = rings[j + 1].y;
    dp.push(a.x, ya, -a.hb, a.x, ya, a.hb, b.x, yb, b.hb);
    dp.push(a.x, ya, -a.hb, b.x, yb, b.hb, b.x, yb, -b.hb);
  }
  const deckGeo = new THREE.BufferGeometry();
  deckGeo.setAttribute("position", new THREE.Float32BufferAttribute(dp, 3));
  deckGeo.computeVertexNormals();

  // livery: a brass sheer line just proud of the hull along the deck edge (moonlit at night)
  const sp: number[] = [];
  const band = Math.min(0.9, s.F * 0.1);
  for (const side of [1, -1]) {
    for (let i = 0; i < N; i++) {
      const a = top.pts[i];
      const c = top.pts[i + 1];
      const za = side * (a.hb + 0.12);
      const zc = side * (c.hb + 0.12);
      const y0 = s.F - band;
      const y1 = s.F + 0.05;
      if (side > 0)
        sp.push(a.x, y0, za, c.x, y0, zc, c.x, y1, zc, a.x, y0, za, c.x, y1, zc, a.x, y1, za);
      else sp.push(a.x, y0, za, c.x, y1, zc, c.x, y0, zc, a.x, y0, za, a.x, y1, za, c.x, y1, zc);
    }
  }
  const sheerGeo = new THREE.BufferGeometry();
  sheerGeo.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
  sheerGeo.computeVertexNormals();
  return { side: sideGeo, deck: deckGeo, sheer: sheerGeo };
}

const COL = {
  hull: lin(0x0d2236),
  hullRed: lin(0x7e3428),
  hullWhite: lin(0xe9e5da),
  deck: lin(0x7d3d2e),
  deckGreen: lin(0x41584c),
  cabin: lin(0xeeeae0),
  funnel: lin(0x0a1f33),
  brass: lin(0xb8893a),
  black: lin(0x161a1d),
  pipe: lin(0xb9b4aa),
  tank: lin(0xe7e2d5),
  orange: lin(0xd0702e),
  grey: lin(0x8b9296),
};

export interface ShipModel {
  L: number;
  B: number;
  F: number;
  /** Local light points: [x, y, z, r, g, b, sizePx, kind]. */
  lights: number[][];
}

/** Ship-only material codes (beyond geom KIND): wheelhouse glazing, brass sheer line. */
const SHIPKIND = { wheel: 20, sheer: 21 } as const;

/**
 * Accommodation block aft: stacked white decks stepping back, a wheelhouse with a
 * continuous dark window band, bridge wings reaching the full beam, a compass deck.
 * Returns the height of the compass deck.
 */
function superstructure(
  b: Builder,
  si: number,
  x0: number,
  len: number,
  width: number,
  deckY: number,
  decks: number,
  wing: number
): number {
  const dh = 2.9;
  let y = deckY;
  for (let i = 0; i < decks; i++) {
    // upper decks step back from the stern
    const cut = i * len * 0.05;
    b.add(
      PRIM.boxBase,
      xf(x0 + len / 2 + cut / 2, y, 0, 0, len - cut, dh, width * (i > decks - 2 ? 0.94 : 1)),
      COL.cabin,
      KIND.cabin,
      si
    );
    y += dh;
  }
  // wheelhouse: forward part of the top, dark glazing all round
  const wl = len * 0.5;
  const wx = x0 + len - wl / 2;
  b.add(PRIM.boxBase, xf(wx, y, 0, 0, wl, dh, width * 0.92), COL.cabin, SHIPKIND.wheel, si);
  // bridge wings: slabs out to the ship's side, with a solid bulwark
  b.add(
    PRIM.boxBase,
    xf(wx + wl * 0.3, y - 0.05, 0, 0, 3.2, 0.35, wing),
    COL.cabin,
    KIND.cabin,
    si
  );
  for (const z of [-1, 1])
    b.add(
      PRIM.boxBase,
      xf(wx + wl * 0.3, y + 0.3, z * (wing / 2 - 0.1), 0, 3.2, 1.1, 0.2),
      COL.cabin,
      KIND.plain,
      si
    );
  y += dh;
  b.add(PRIM.boxBase, xf(wx, y, 0, 0, wl * 1.04, 0.45, width * 0.96), COL.grey, KIND.plain, si);
  return y + 0.45;
}

function funnel(
  b: Builder,
  si: number,
  x: number,
  y: number,
  h: number,
  w: number,
  d: number
): void {
  b.add(PRIM.boxBase, xf(x, y, 0, 0, d, h * 0.72, w), COL.funnel, KIND.plain, si);
  b.add(
    PRIM.boxBase,
    xf(x - d * 0.04, y + h * 0.72, 0, 0, d * 0.97, h * 0.12, w * 0.98),
    COL.brass,
    KIND.plain,
    si
  );
  b.add(
    PRIM.boxBase,
    xf(x - d * 0.08, y + h * 0.84, 0, 0, d * 0.94, h * 0.16, w * 0.96),
    COL.black,
    KIND.plain,
    si
  );
}

/** White lamp colour, red port, green starboard. */
const NAV = { white: [1, 0.95, 0.85], red: [1, 0.18, 0.12], green: [0.15, 1, 0.45] } as const;

function tanker(b: Builder, si: number, n: number): ShipModel {
  const s: HullSpec = { L: 250, B: 44, F: 8.5, bowLen: 46, sternLen: 34, rake: 7 };
  const g = hullGeometry(s, n);
  b.add(g.side, new THREE.Matrix4(), COL.hull, KIND.hull, si);
  b.add(g.deck, new THREE.Matrix4(), COL.deck, KIND.deck, si);
  b.add(g.sheer, new THREE.Matrix4(), COL.brass, SHIPKIND.sheer, si);
  const aft = -s.L / 2;
  // forecastle and poop steps
  b.add(PRIM.boxBase, xf(s.L / 2 - 20, s.F, 0, 0, 22, 2.4, s.B * 0.62), COL.deck, KIND.deck, si);
  b.add(PRIM.boxBase, xf(aft + 16, s.F, 0, 0, 30, 2.4, s.B * 0.86), COL.deck, KIND.deck, si);
  const top = superstructure(b, si, aft + 9, 27, s.B * 0.8, s.F + 2.4, 4, s.B);
  funnel(b, si, aft + 7, s.F + 2.4 + 9, 14, 8.5, 9);
  // radar mast on the compass deck
  b.add(PRIM.cyl8, xf(aft + 27, top, 0, 0, 0.55, 7, 0.55), COL.cabin, KIND.plain, si);
  b.add(PRIM.boxBase, xf(aft + 27, top + 5.2, 0, 0, 0.8, 0.4, 5.5), COL.cabin, KIND.plain, si);
  // free-fall lifeboat at the stern
  b.add(PRIM.boxBase, xf(aft + 3, s.F + 4, 0, 0, 9, 3.2, 3.6, 0, -0.5), COL.orange, KIND.plain, si);
  // centreline pipe rack with a brass handrail line, catwalk on top
  b.add(PRIM.boxBase, xf(-4, s.F, 0, 0, 176, 1.5, 3.2), COL.pipe, KIND.plain, si);
  b.add(PRIM.boxBase, xf(-4, s.F + 2.6, 0, 0, 176, 0.35, 1.6), COL.pipe, KIND.plain, si);
  b.add(PRIM.boxBase, xf(-4, s.F + 2.95, 0, 0, 176, 0.18, 0.2), COL.brass, KIND.plain, si);
  // manifold midships with ONE low hose crane
  b.add(PRIM.boxBase, xf(-10, s.F, 0, 0, 8, 2.6, s.B * 0.7), COL.pipe, KIND.plain, si);
  b.add(PRIM.cyl8, xf(-10, s.F, -s.B * 0.28, 0, 0.6, 4.2, 0.6), COL.cabin, KIND.plain, si);
  b.add(
    PRIM.boxBase,
    xf(-6, s.F + 3.8, -s.B * 0.28, 0, 9, 0.5, 0.5, 0, 0.12),
    COL.cabin,
    KIND.plain,
    si
  );
  // deck clutter: hatches and winches read as texture at distance; floodlight posts
  for (let i = 0; i < 9; i++) {
    const x = -78 + i * 19;
    for (const z of [-s.B * 0.3, s.B * 0.3])
      b.add(PRIM.boxBase, xf(x, s.F, z, 0, 3.2, 1.2, 2.4), COL.pipe, KIND.plain, si);
  }
  for (const x of [-80, -40, 0, 40, 80])
    b.add(PRIM.boxBase, xf(x, s.F, 3, 0, 0.3, 5, 0.3), COL.pipe, KIND.plain, si);
  // foremast
  b.add(PRIM.cyl8, xf(s.L / 2 - 12, s.F + 2.4, 0, 0, 0.6, 13, 0.6), COL.cabin, KIND.plain, si);
  const L = s.L;
  return {
    L,
    B: s.B,
    F: s.F,
    lights: [
      // masthead lights (fore lower, aft higher), sidelights on the wings, stern light
      [L / 2 - 12, s.F + 15.6, 0, ...NAV.white, 5, 0],
      [aft + 27, top + 7.2, 0, ...NAV.white, 5, 0],
      [aft + 31, top - 2.4, s.B / 2, ...NAV.green, 4, 0],
      [aft + 31, top - 2.4, -s.B / 2, ...NAV.red, 4, 0],
      [aft + 1, s.F + 3, 0, ...NAV.white, 3.5, 0],
      // deck floodlights along the pipe rack
      ...[-80, -40, 0, 40, 80].map((x) => [x, s.F + 5.2, 3, 1, 0.8, 0.52, 5, 1]),
    ],
  };
}

function gasCarrier(b: Builder, si: number, n: number): ShipModel {
  const s: HullSpec = { L: 112, B: 19, F: 6.2, bowLen: 24, sternLen: 16, rake: 4 };
  const g = hullGeometry(s, n);
  b.add(g.side, new THREE.Matrix4(), COL.hullRed, KIND.hull, si);
  b.add(g.deck, new THREE.Matrix4(), COL.deckGreen, KIND.deck, si);
  b.add(g.sheer, new THREE.Matrix4(), COL.brass, SHIPKIND.sheer, si);
  const aft = -s.L / 2;
  b.add(PRIM.boxBase, xf(s.L / 2 - 9, s.F, 0, 0, 12, 2.2, s.B * 0.6), COL.deckGreen, KIND.deck, si);
  const top = superstructure(b, si, aft + 5, 17, s.B * 0.86, s.F + 1.6, 3, s.B * 1.02);
  funnel(b, si, aft + 4, s.F + 1.6 + 6, 10.5, 4.4, 5);
  b.add(PRIM.cyl8, xf(aft + 17, top, 0, 0, 0.35, 5, 0.35), COL.cabin, KIND.plain, si);
  // three pressurised cargo tanks lying fore-aft, standing proud of the deck on dark saddles
  const tanks = [-13, 14, 40];
  const ty = s.F + 4.4;
  const r = 6.0;
  for (const x of tanks) {
    b.add(PRIM.tank, xf(x, ty, 0, 0, 24, r, r), COL.tank, KIND.plain, si);
    b.add(PRIM.sphere, xf(x - 12, ty, 0, 0, 1.8, r * 0.97, r * 0.97), COL.tank, KIND.plain, si);
    b.add(PRIM.sphere, xf(x + 12, ty, 0, 0, 1.8, r * 0.97, r * 0.97), COL.tank, KIND.plain, si);
    for (const dx of [-7, 7])
      b.add(PRIM.boxBase, xf(x + dx, s.F, 0, 0, 1.6, 2.6, s.B * 0.7), COL.black, KIND.plain, si);
    b.add(PRIM.cyl12, xf(x, ty + r - 0.4, 0, 0, 1.3, 1.6, 1.3), COL.pipe, KIND.plain, si);
  }
  // walkway on the tank tops with a brass rail
  b.add(PRIM.boxBase, xf(13, ty + r + 1.1, 0, 0, 64, 0.45, 1.3), COL.pipe, KIND.plain, si);
  b.add(PRIM.boxBase, xf(13, ty + r + 1.55, 0, 0, 64, 0.16, 0.18), COL.brass, KIND.plain, si);
  b.add(PRIM.cyl8, xf(s.L / 2 - 6, s.F + 2.2, 0, 0, 0.45, 11, 0.45), COL.cabin, KIND.plain, si);
  return {
    L: s.L,
    B: s.B,
    F: s.F,
    lights: [
      [s.L / 2 - 6, s.F + 13.2, 0, ...NAV.white, 4.5, 0],
      [aft + 17, top + 5, 0, ...NAV.white, 4.5, 0],
      [aft + 16, top - 2.4, s.B / 2, ...NAV.green, 3.5, 0],
      [aft + 16, top - 2.4, -s.B / 2, ...NAV.red, 3.5, 0],
      [aft + 1, s.F + 2, 0, ...NAV.white, 3.5, 0],
      ...tanks.map((x) => [x, ty + r + 2.4, 0, 1, 0.8, 0.52, 4.5, 1]),
    ],
  };
}

function ferry(b: Builder, si: number, n: number): ShipModel {
  const s: HullSpec = { L: 72, B: 13.5, F: 3.2, bowLen: 16, sternLen: 14, rake: 2.5 };
  const g = hullGeometry(s, n);
  b.add(g.side, new THREE.Matrix4(), COL.hullWhite, KIND.hull, si);
  b.add(g.deck, new THREE.Matrix4(), COL.grey, KIND.deck, si);
  b.add(PRIM.boxBase, xf(-1, s.F, 0, 0, 58, 2.8, s.B * 0.96), COL.cabin, KIND.cabin, si);
  b.add(PRIM.boxBase, xf(-3, s.F + 2.8, 0, 0, 50, 2.6, s.B * 0.9), COL.cabin, KIND.cabin, si);
  b.add(PRIM.boxBase, xf(-3, s.F + 5.4, 0, 0, 52, 0.4, s.B * 0.98), COL.grey, KIND.plain, si);
  b.add(PRIM.boxBase, xf(13, s.F + 5.8, 0, 0, 8, 2.4, s.B * 0.5), COL.cabin, KIND.cabin, si);
  b.add(PRIM.cyl12, xf(-6, s.F + 5.8, 0, 0, 1.7, 5.2, 1.7), COL.cabin, KIND.plain, si);
  b.add(PRIM.cyl12, xf(-6, s.F + 9.6, 0, 0, 1.75, 1.4, 1.75), COL.black, KIND.plain, si);
  b.add(PRIM.cyl8, xf(18, s.F + 8.2, 0, 0, 0.25, 5, 0.25), COL.cabin, KIND.plain, si);
  return {
    L: s.L,
    B: s.B,
    F: s.F,
    lights: [
      [18, s.F + 13, 0, 1, 0.95, 0.85, 4, 0],
      [13, s.F + 7, s.B / 2, 0.15, 1, 0.45, 3.5, 0],
      [13, s.F + 7, -s.B / 2, 1, 0.18, 0.12, 3.5, 0],
      ...[-20, -8, 4].map((x) => [x, s.F + 3, 0, 1, 0.82, 0.55, 4, 1]),
    ],
  };
}

const BUILD: Record<ShipKind, (b: Builder, si: number, n: number) => ShipModel> = {
  tanker,
  gas: gasCarrier,
  ferry,
};

export const MAX_SHIPS = 10;

const VERT = /* glsl */ `
attribute vec3 aCol;
attribute float aKind;
attribute float aShip;
uniform mat4 uShipM[${MAX_SHIPS}];
varying vec3 vPos;
varying vec3 vLocal;
varying vec3 vN;
varying vec3 vCol;
varying float vKind;
void main() {
  mat4 M = uShipM[int(aShip + 0.5)];
  vec4 wp = M * vec4(position, 1.0);
  vPos = wp.xyz;
  vLocal = position;
  vN = normalize(mat3(M) * normal);
  vCol = aCol;
  vKind = aKind;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const FRAG = /* glsl */ `
${COMMON}
${FACADE}
varying vec3 vPos;
varying vec3 vLocal;
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
  vec3 alb = vCol;
  vec3 emit = vec3(0.0);
  float rim = 0.0;
  float vertical = 1.0 - smoothstep(0.3, 0.6, abs(n.y));
  vec3 warm = ${glslColor(0xffcf8f)};
  if (vKind > 3.5 && vKind < 4.5) {
    // hull: rust-red boot-top at the waterline
    alb = mix(${glslColor(0x8e3b2c)}, alb, smoothstep(0.7, 1.1, vLocal.y));
  } else if (vKind > 20.5 && vKind < 21.5) {
    // brass sheer line: the livery by day, a moonlit rim along the hull at night
    rim = 1.0;
  } else if (vKind > 19.5 && vKind < 20.5) {
    // wheelhouse: one continuous dark window band with thin mullions
    float rowY = fract(vLocal.y / 2.9);
    float band = step(0.36, rowY) * step(rowY, 0.8) * vertical;
    float mull = step(0.12, fract(dot(vLocal.xz, normalize(vec2(-n.z, n.x) + 1e-5)) / 1.5));
    float detail = 1.0 - smoothstep(0.6, 1.4, foot / 1.5);
    alb = mix(alb, ${glslColor(0x1a2631)}, band * mix(0.92, 0.92 * mull, detail));
    emit = warm * band * 0.35;
  } else if (vKind > 4.5 && vKind < 5.5) {
    // accommodation: a few rows of small windows, most decks plain; sparse lights at night
    float deck = floor(vLocal.y / 2.9);
    float rowOn = step(0.45, hash12(vec2(deck, floor(vLocal.x / 40.0) + 3.0)));
    float rowY = fract(vLocal.y / 2.9);
    float row = step(0.5, rowY) * step(rowY, 0.68) * rowOn;
    vec2 cell = vec2(dot(vLocal.xz, normalize(vec2(-n.z, n.x) + 1e-5)) / 3.4, deck);
    float colX = fract(cell.x);
    float win = row * step(0.34, colX) * step(colX, 0.62);
    float detail = 1.0 - smoothstep(0.7, 1.6, foot / 3.4);
    alb = mix(alb, ${glslColor(0x26323c)}, mix(0.08 * rowOn, win, detail) * vertical * 0.85);
    float lit = step(0.72, hash12(floor(cell) + 17.0));
    emit = warm * mix(0.05 * rowOn, win * lit, detail) * vertical * 2.2;
  } else if (vKind > 7.5 && vKind < 8.5) {
    // cargo deck: pools of floodlight under the lamp posts (every 40 m along the rack)
    float px = fract((vLocal.x + 20.0) / 40.0) - 0.5;
    float pool = exp(-px * px * 60.0) * exp(-vLocal.z * vLocal.z * 0.006) * step(-92.0, vLocal.x) * step(vLocal.x, 92.0);
    emit = ${glslColor(0xffc37a)} * pool * 0.9;
  } else {
    vec3 e2;
    alb = facade(alb, vKind, vLocal, n, foot, e2);
    emit = e2;
  }
  vec3 col = shadeSolid(alb, n, V, 0.55);
  // the sheer line catches the moon (and the low sun) along its whole length
  col += rim * (uMoonCol * 0.55 + uKeyCol * 0.2) * (0.4 + 0.6 * vertical);
  col += emit * uNight;
  float fog = fogAmount(dist, vPos.y);
  col = mix(col, hazeColor(-V), fog);
  gl_FragColor = vec4(col, 0.28);
}
`;

export interface ShipState {
  model: ShipModel;
  /** Journey progress range in which the ship exists. */
  show: readonly [number, number];
  /** Present in the current frame. */
  visible: boolean;
  x: number;
  z: number;
  heading: number;
  speed: number;
  scale: number;
  anchored: boolean;
  matrix: THREE.Matrix4;
}

interface Staging {
  kind: ShipKind;
  /** Keyframe the ship is staged for. */
  shot: number;
  /** Bearing from that camera, relative to its yaw (deg, + = right of centre). */
  bearing: number;
  dist: number;
  /** Heading relative to the camera yaw (deg): 90 = broadside bow-right, 110 = 3/4 bow-right. */
  heading: number;
  /** Visual speed through the water (m/s); 0 = at anchor. */
  speed: number;
  scale: number;
  /** Journey progress range in which the ship exists (it appears/leaves while off-screen). */
  show: readonly [number, number];
}

/**
 * Ships are staged per keyframe like actors: placed by bearing and distance
 * from the camera that frames them, and turned relative to it, so a reframed
 * shot keeps its 3/4 views.
 */
export const FLEET: readonly Staging[] = [
  // hero: a laden crude tanker leaving the strait, a ferry crossing behind it
  {
    kind: "tanker",
    shot: 0,
    bearing: 8,
    dist: 800,
    heading: -128,
    speed: 3.2,
    scale: 1,
    show: [0, 0.16],
  },
  {
    kind: "ferry",
    shot: 0,
    bearing: -4,
    dist: 1500,
    heading: 66,
    speed: 4,
    scale: 1,
    show: [0, 0.16],
  },
  // desks: tanker in 3/4 view bow-right, a pressurised gas carrier further off
  {
    kind: "tanker",
    shot: 1,
    bearing: 17,
    dist: 1250,
    heading: 112,
    speed: 4.5,
    scale: 1,
    show: [0.1, 0.42],
  },
  {
    kind: "gas",
    shot: 1,
    bearing: 6.8,
    dist: 1300,
    heading: -84,
    speed: 4,
    scale: 1.6,
    show: [0.1, 0.42],
  },
  // straits: a gas carrier coming down the strait under the bridge
  {
    kind: "gas",
    shot: 2,
    bearing: 15,
    dist: 1300,
    heading: -115,
    speed: 3,
    scale: 1.35,
    show: [0.4, 1],
  },
  // process: small ships at anchor off the old city, on the strip under the ink band
  {
    kind: "tanker",
    shot: 3,
    bearing: -24,
    dist: 2000,
    heading: 60,
    speed: 0,
    scale: 0.75,
    show: [0.62, 1],
  },
  {
    kind: "gas",
    shot: 3,
    bearing: -8,
    dist: 2300,
    heading: -70,
    speed: 0,
    scale: 1,
    show: [0.62, 1],
  },
  // contact: the night watch tanker at anchor, right of the tower (never under the copy);
  // it also closes the process strip on the right
  {
    kind: "tanker",
    shot: 4,
    bearing: 12,
    dist: 1000,
    heading: 70,
    speed: 0,
    scale: 0.85,
    show: [0.62, 1],
  },
];

/** World placement of a staged ship (x, z, heading in radians). */
export function stagedPose(s: Staging): { x: number; z: number; heading: number } {
  const shot = SHOTS[s.shot];
  const a = ((shot.yaw + s.bearing) * Math.PI) / 180;
  return {
    x: shot.pos[0] + Math.sin(a) * s.dist,
    z: shot.pos[2] - Math.cos(a) * s.dist,
    heading: ((shot.yaw + s.heading) * Math.PI) / 180,
  };
}

export interface Fleet {
  mesh: THREE.Mesh;
  ships: ShipState[];
  /** Per-ship model matrices, shared by reference with the lights. */
  matrices: THREE.Matrix4[];
  update(t: number, waveAmp: number, progress: number): void;
}

export function createFleet(shared: SharedUniforms, quality: number): Fleet {
  // hull stations: 40 on high/medium, 24 on phones
  const stations = quality > 0 ? 40 : 24;
  const b = new Builder();
  const ships: ShipState[] = FLEET.map((p, i) => {
    const pose = stagedPose(p);
    return {
      model: BUILD[p.kind](b, i, stations),
      x: pose.x,
      z: pose.z,
      heading: pose.heading,
      speed: p.speed,
      scale: p.scale,
      anchored: p.speed === 0,
      show: p.show,
      visible: true,
      matrix: new THREE.Matrix4(),
    };
  });
  const mats = Array.from({ length: MAX_SHIPS }, () => new THREE.Matrix4().makeScale(0, 0, 0));
  const material = new THREE.ShaderMaterial({
    name: "voyage-fleet",
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: { ...shared, uShipM: { value: mats } },
  });
  const mesh = new THREE.Mesh(b.build(true), material);
  mesh.frustumCulled = false;
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const pv = new THREE.Vector3();
  const sv = new THREE.Vector3();
  const update = (t: number, waveAmp: number, progress: number): void => {
    ships.forEach((s, i) => {
      s.visible = progress >= s.show[0] && progress <= s.show[1];
      if (!s.visible) {
        // a zero matrix collapses the hull and tells the lights to stay dark
        s.matrix.makeScale(0, 0, 0);
        mats[i].copy(s.matrix);
        return;
      }
      const L = s.model.L * s.scale;
      const B = s.model.B * s.scale;
      const fx = Math.sin(s.heading);
      const fz = -Math.cos(s.heading);
      const hb = sampleSwell(s.x + fx * L * 0.4, s.z + fz * L * 0.4, t, waveAmp);
      const hs = sampleSwell(s.x - fx * L * 0.4, s.z - fz * L * 0.4, t, waveAmp);
      const hp = sampleSwell(s.x + fz * B * 0.5, s.z - fx * B * 0.5, t, waveAmp);
      const hst = sampleSwell(s.x - fz * B * 0.5, s.z + fx * B * 0.5, t, waveAmp);
      const heave = (hb + hs + hp + hst) * 0.25 * 0.55;
      const pitch = Math.atan2(hb - hs, L * 0.8) * 0.6;
      const roll = Math.atan2(hp - hst, B) * 0.35;
      // a slow surge so moving ships feel under way without leaving their composition
      const surge = s.anchored ? 0 : Math.sin(t * 0.05 + i) * 3;
      e.set(roll, Math.PI / 2 - s.heading, pitch, "YZX");
      q.setFromEuler(e);
      pv.set(s.x + fx * surge, heave - 0.15, s.z + fz * surge);
      sv.setScalar(s.scale);
      s.matrix.compose(pv, q, sv);
      mats[i].copy(s.matrix);
    });
  };
  return { mesh, ships, matrices: mats, update };
}
