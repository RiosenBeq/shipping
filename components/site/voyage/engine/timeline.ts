import * as THREE from "three";
import { VOYAGE_SCENES as SCENES } from "../types";
import { BRAND, lin } from "./palette";
import { clamp, lerp, smoothstep, type V3 } from "./math";

/** Portrait (phone) framing of a keyframe. */
export interface PortraitShot {
  /** Horizontal FOV (deg) on a 390×844 phone. */
  hfov: number;
  /** Horizon position from the top (0..1). */
  hz: number;
  /** Yaw offset (deg) toward the subject. */
  yaw: number;
  /** Camera position offset (m): a phone can move toward the subject instead of only cropping. */
  dx: number;
  dy: number;
  dz: number;
}

/**
 * Camera keyframe. Yaw 0 looks north (−z, up the Bosphorus), +90 looks east (+x).
 * Yaws are unwrapped: the sign of the difference between two keyframes is the
 * direction the camera turns. The horizon is placed with a vertical lens shift
 * so verticals stay vertical (minarets, masts, bridge towers) - an illustrator's
 * camera rather than a tilted one.
 */
export interface Shot {
  pos: V3;
  yaw: number;
  pitch: number;
  /** Horizontal FOV (deg) on a 16:10 landscape screen. */
  hfov: number;
  /** Horizon position from the top (0..1), landscape. */
  hz: number;
  mob: PortraitShot;
  /** Cubic Bezier control points of the flight toward the NEXT keyframe (kept over water). */
  via?: readonly [V3, V3];
}

/*
 * Framing measured on the real homepage (FRAMING.md). Copy columns sit on the
 * left; every subject lives in the free zones: the right half and the horizon
 * strip (hero), the top-right above the cards (desks), the top-right above the
 * paper band (straits), the strip under the ink band (process) and the middle
 * column (contact). The journey turns left once (hero → desks, so the dawn sun
 * leaves to the right, away from the copy) and then drifts right.
 */
export const SHOTS: readonly Shot[] = [
  // hero — the Bosphorus at first light, low in the strait's mouth looking north.
  {
    pos: [-60, 9, 700],
    yaw: 4,
    pitch: 0,
    hfov: 56,
    hz: 0.6,
    mob: { hfov: 30, hz: 0.535, yaw: 5, dx: 80, dy: -3, dz: -180 },
    via: [
      [-120, 12, 1700],
      [-260, 12, 3000],
    ],
  },
  // desks — open water in the Marmara looking west, a tanker and a gas carrier on the right.
  {
    pos: [-420, 9, 4100],
    yaw: -88,
    pitch: 0,
    hfov: 48,
    hz: 0.35,
    mob: { hfov: 27, hz: 0.43, yaw: 13, dx: 0, dy: 0, dz: 0 },
    via: [
      [-300, 30, 1900],
      [-60, 40, -900],
    ],
  },
  // straits — golden hour, the European tower of the bridge and its cable top-right.
  {
    pos: [60, 14, -3150],
    yaw: -32,
    pitch: 0,
    hfov: 58,
    hz: 0.43,
    // the phone keeps calm golden sky over its heading, the sun in the free top strip
    mob: { hfov: 40, hz: 0.3, yaw: -12, dx: 0, dy: 0, dz: 0 },
    via: [
      [0, 30, -1200],
      [-250, 14, 1500],
    ],
  },
  // process — dusk on the Marmara, the old city's lit skyline on the horizon strip.
  {
    pos: [-600, 3, 3600],
    yaw: -10,
    pitch: 0,
    hfov: 58,
    hz: 0.81,
    mob: { hfov: 44, hz: 0.3, yaw: 4, dx: 0, dy: 0, dz: 0 },
    via: [
      [-480, 4, 3000],
      [-220, 6, 2200],
    ],
  },
  // contact — night watch: Maiden's Tower lit on the moon path, open water to the left.
  {
    pos: [-100, 7, 1900],
    yaw: 10,
    pitch: 0,
    hfov: 58,
    hz: 0.75,
    mob: { hfov: 40, hz: 0.685, yaw: 1, dx: 0, dy: 0, dz: 0 },
  },
];

/**
 * Copy-safe masks per keyframe, applied in the post pass by material class:
 * `lift` pulls the sky (and, less, haze-dissolved land) behind the heading
 * column toward paper so the 12 px brass eyebrow reaches 4.5:1; `pool` deepens
 * and calms the water (or the night sky) under light text. Rects are
 * [x0, y0, x1, y1] in viewport fractions from the top-left; `m` = portrait.
 */
interface CalmDef {
  lift: readonly [number, number, number, number];
  liftM: readonly [number, number, number, number];
  liftS: number;
  /** Feather (viewport heights) across and up/down. */
  liftF: readonly [number, number];
  pool: readonly [number, number, number, number];
  poolM: readonly [number, number, number, number];
  poolS: number;
  poolF: readonly [number, number];
  /** How much of the pool also applies to the sky and land (dark scenes: copy on the night sky). */
  poolSky: number;
}

export const CALM: readonly CalmDef[] = [
  {
    lift: [0.04, 0.14, 0.57, 0.47],
    liftM: [0, 0.11, 1, 0.42],
    liftS: 1,
    liftF: [0.42, 0.1],
    pool: [0.03, 0.66, 0.5, 1.02],
    poolM: [-0.02, 0.57, 1.02, 1.02],
    poolS: 1,
    poolF: [0.42, 0.08],
    poolSky: 0,
  },
  {
    lift: [0.04, 0.11, 0.5, 0.36],
    liftM: [0, 0.11, 1, 0.42],
    liftS: 1,
    liftF: [0.4, 0.09],
    pool: [0.03, 0.66, 0.5, 1.02],
    poolM: [-0.02, 0.57, 1.02, 1.02],
    poolS: 0,
    poolF: [0.42, 0.08],
    poolSky: 0,
  },
  {
    lift: [0.04, 0.22, 0.52, 0.42],
    liftM: [0, 0.13, 1, 0.3],
    liftS: 1,
    // a short vertical feather leaves the sun's disc above the heading untouched
    liftF: [0.4, 0.06],
    pool: [0.03, 0.25, 0.58, 0.45],
    poolM: [-0.02, 0.12, 1.02, 0.3],
    poolS: 0,
    poolF: [0.3, 0.1],
    poolSky: 0,
  },
  {
    lift: [0.04, 0.26, 0.58, 0.44],
    liftM: [0, 0.13, 1, 0.3],
    liftS: 0,
    liftF: [0.3, 0.1],
    pool: [0.03, 0.25, 0.58, 0.45],
    poolM: [-0.02, 0.12, 1.02, 0.3],
    poolS: 0.55,
    poolF: [0.3, 0.1],
    poolSky: 1,
  },
  {
    lift: [0.04, 0.26, 0.5, 0.68],
    liftM: [0, 0.08, 1, 0.64],
    liftS: 0,
    liftF: [0.3, 0.1],
    pool: [0.03, 0.27, 0.5, 0.66],
    poolM: [-0.02, 0.08, 1.02, 0.58],
    poolS: 0.55,
    poolF: [0.3, 0.08],
    poolSky: 1,
  },
];

/** Every scalar of a look; colours are interpolated in linear light. */
const NUM_KEYS = [
  "sunAz",
  "sunEl",
  /** Sun elevation on a portrait screen (lifted into the phone's free strip on straits). */
  "sunElP",
  "sunI",
  "sunR",
  "moonAz",
  /** Moon azimuth on a portrait screen (kept clear of the phone's copy). */
  "moonAzP",
  "moonEl",
  /** Moon elevation on a portrait screen (a low moon fits the phone's free strip). */
  "moonElP",
  "moonI",
  "keyAz",
  "keyEl",
  "keyI",
  "night",
  "exposure",
  "glowW",
  "glowA",
  "antiA",
  "horSharp",
  "fogD",
  "fogH",
  "fogMax",
  "hazeEl",
  "cloudCov",
  "cloudSoft",
  "cloudAmt",
  "cloudScale",
  "waveAmp",
  "ripple",
  "glitter",
  "foam",
  "stars",
  "lights",
  "smear",
  "vignette",
] as const;
const COL_KEYS = [
  "zenith",
  "mid",
  "hor",
  "glow",
  "anti",
  "sunCol",
  "sunDisc",
  "moonCol",
  "cloudLit",
  "cloudShade",
  "seaDeep",
  "seaBody",
  "seaSSS",
  "foamCol",
  "keyCol",
  "ambTop",
  "ambLow",
  "hazeTint",
] as const;
export type LookNum = (typeof NUM_KEYS)[number];
export type LookCol = (typeof COL_KEYS)[number];
export type Look = Record<LookNum, number> & Record<LookCol, THREE.Color>;
type LookDef = Record<LookNum, number> & Record<LookCol, number>;

/*
 * Azimuths are unwrapped like the camera yaws, so each light swings the short
 * way: the dawn sun leaves the hero frame to the right, the golden-hour sun
 * enters the straits frame over the top-right and settles above the heading.
 */
const DEFS: readonly LookDef[] = [
  // hero — dawn: pale sand-blue sky, brass haze over the Asian hills, a deep cool near sea.
  // On landscape screens the sun has just cleared the Asian ridge behind it (at 3.4° the
  // disc sat behind the hill while its glitter path still showed); phones keep it low.
  {
    sunAz: 27,
    sunEl: 7.8,
    sunElP: 3.4,
    sunI: 1.3,
    sunR: 0.85,
    moonAz: 200,
    moonAzP: 200,
    moonEl: -20,
    moonElP: -20,
    moonI: 0,
    keyAz: 75,
    keyEl: 18,
    keyI: 0.95,
    night: 0,
    exposure: 1.0,
    glowW: 6,
    glowA: 0.85,
    antiA: 0.35,
    horSharp: 9,
    fogD: 1 / 5200,
    fogH: 1 / 220,
    fogMax: 0.82,
    hazeEl: 0.03,
    cloudCov: 0.55,
    cloudSoft: 0.3,
    cloudAmt: 0.5,
    cloudScale: 0.45,
    waveAmp: 0.85,
    ripple: 0.34,
    glitter: 1.0,
    foam: 0.5,
    stars: 0,
    lights: 0.06,
    smear: 1,
    vignette: 0.22,
    zenith: 0x9db1be,
    mid: 0xc9d1d2,
    hor: 0xeee2c8,
    glow: 0xf2c27e,
    anti: 0xd3d0d2,
    sunCol: 0xffc98a,
    sunDisc: 0xf9dda6,
    moonCol: 0x000000,
    cloudLit: 0xfbe6c2,
    cloudShade: 0xb5bec3,
    seaDeep: 0x071f33,
    seaBody: 0x0f3b4c,
    seaSSS: 0x2f7672,
    foamCol: 0xe2dccb,
    keyCol: 0xffddb0,
    ambTop: 0xb0bfc9,
    ambLow: 0x345460,
    hazeTint: 0xe4e9ee,
  },
  // desks — clear morning in the Marmara: the sun behind the camera's left shoulder, crisp chop.
  {
    sunAz: 112,
    sunEl: 24,
    sunElP: 24,
    sunI: 1.15,
    sunR: 0.7,
    moonAz: 200,
    moonAzP: 200,
    moonEl: -20,
    moonElP: -20,
    moonI: 0,
    keyAz: 140,
    keyEl: 26,
    keyI: 1.05,
    night: 0,
    exposure: 1.0,
    glowW: 3,
    glowA: 0.35,
    antiA: 0.2,
    horSharp: 10,
    fogD: 1 / 9000,
    fogH: 1 / 300,
    fogMax: 0.8,
    hazeEl: 0.03,
    cloudCov: 0.52,
    cloudSoft: 0.3,
    cloudAmt: 0.5,
    cloudScale: 0.45,
    waveAmp: 1.15,
    ripple: 0.4,
    glitter: 0.9,
    foam: 0.85,
    stars: 0,
    lights: 0,
    smear: 1,
    vignette: 0.2,
    zenith: 0x92aabb,
    mid: 0xc1ced3,
    hor: 0xe6e6dc,
    glow: 0xede2c6,
    anti: 0xd8dddc,
    sunCol: 0xfff0d4,
    sunDisc: 0xfff6e2,
    moonCol: 0x000000,
    cloudLit: 0xf8f4ea,
    cloudShade: 0xb0bcc4,
    seaDeep: 0x082640,
    seaBody: 0x144a5c,
    seaSSS: 0x2e8a86,
    foamCol: 0xf2eee3,
    keyCol: 0xfff0d6,
    ambTop: 0xaebfca,
    ambLow: 0x2f4e5a,
    hazeTint: 0xeef1f2,
  },
  // straits — golden hour: low sun upper-left above the heading, backlit hazy European hills.
  {
    sunAz: -47,
    sunEl: 9.5,
    sunElP: 17,
    sunI: 1.5,
    sunR: 0.9,
    moonAz: 200,
    moonAzP: 200,
    moonEl: -20,
    moonElP: -20,
    moonI: 0,
    keyAz: -60,
    keyEl: 12,
    keyI: 1.0,
    night: 0,
    exposure: 1.0,
    glowW: 5,
    glowA: 0.92,
    antiA: 0.4,
    horSharp: 7,
    fogD: 1 / 4200,
    fogH: 1 / 240,
    fogMax: 0.86,
    hazeEl: 0.035,
    cloudCov: 0.52,
    cloudSoft: 0.3,
    cloudAmt: 0.5,
    cloudScale: 0.5,
    waveAmp: 0.9,
    ripple: 0.34,
    glitter: 1.25,
    foam: 0.6,
    stars: 0,
    lights: 0.12,
    smear: 1,
    vignette: 0.24,
    zenith: 0x8d9fac,
    mid: 0xcdbf9f,
    hor: 0xeec98e,
    glow: 0xf2a85a,
    anti: 0xb3b2b9,
    sunCol: 0xffb86e,
    sunDisc: 0xfbd9a0,
    moonCol: 0x000000,
    cloudLit: 0xf7d3a0,
    cloudShade: 0x9a9fa8,
    seaDeep: 0x0a2540,
    seaBody: 0x18404f,
    seaSSS: 0x6e7c5e,
    foamCol: 0xf2e0c2,
    keyCol: 0xffc985,
    ambTop: 0xa8adb0,
    ambLow: 0x3b4b52,
    hazeTint: 0xebe6e6,
  },
  // process — blue hour: navy sky, brass/rose afterglow low on the left, first stars.
  {
    sunAz: -73,
    sunEl: -4.5,
    sunElP: -4.5,
    sunI: 0.55,
    sunR: 0.9,
    moonAz: 50,
    moonAzP: 50,
    moonEl: 4,
    moonElP: 4,
    moonI: 0.1,
    keyAz: -75,
    keyEl: 8,
    keyI: 0.35,
    night: 0.75,
    exposure: 1.0,
    glowW: 3.5,
    glowA: 0.95,
    antiA: 0.3,
    horSharp: 6,
    fogD: 1 / 6000,
    fogH: 1 / 260,
    fogMax: 0.8,
    hazeEl: 0.04,
    cloudCov: 0.56,
    cloudSoft: 0.26,
    cloudAmt: 0.5,
    cloudScale: 0.5,
    waveAmp: 0.6,
    ripple: 0.28,
    glitter: 0.8,
    foam: 0.3,
    stars: 0.6,
    lights: 0.85,
    smear: 1,
    vignette: 0.3,
    zenith: 0x0a1f33,
    mid: 0x1c3752,
    hor: 0x7a6a6c,
    glow: 0xd49a68,
    anti: 0x2b3d52,
    sunCol: 0xe09068,
    sunDisc: 0x000000,
    moonCol: 0x9aa4ad,
    cloudLit: 0xb8827a,
    cloudShade: 0x18293c,
    seaDeep: 0x04121f,
    seaBody: 0x0b2236,
    seaSSS: 0x1a3440,
    foamCol: 0x7e96a2,
    keyCol: 0xc09078,
    ambTop: 0x2e4258,
    ambLow: 0x0d1b29,
    hazeTint: 0xffffff,
  },
  // contact — night watch: deep navy, the moon over Maiden's Tower, its path on the water.
  {
    sunAz: -80,
    sunEl: -24,
    sunElP: -24,
    sunI: 0,
    sunR: 0.9,
    moonAz: 11,
    moonAzP: 19,
    moonEl: 22,
    moonElP: 3.2,
    moonI: 1.0,
    keyAz: 10,
    keyEl: 20,
    keyI: 0.32,
    night: 1,
    exposure: 1.0,
    glowW: 3,
    glowA: 0.2,
    antiA: 0.1,
    horSharp: 7,
    fogD: 1 / 6000,
    fogH: 1 / 300,
    fogMax: 0.8,
    hazeEl: 0.03,
    cloudCov: 0.58,
    cloudSoft: 0.24,
    cloudAmt: 0.45,
    cloudScale: 0.5,
    waveAmp: 0.6,
    ripple: 0.3,
    glitter: 1.0,
    foam: 0.25,
    stars: 1,
    lights: 1,
    smear: 1,
    vignette: 0.32,
    zenith: 0x040f1b,
    mid: 0x0a1d31,
    hor: 0x1e3249,
    glow: 0x2c3b4d,
    anti: 0x12253a,
    sunCol: 0x000000,
    sunDisc: 0x000000,
    moonCol: 0xe6e1cf,
    cloudLit: 0x5d6e80,
    cloudShade: 0x0a1a2b,
    seaDeep: 0x020b14,
    seaBody: 0x06192b,
    seaSSS: 0x0b2232,
    foamCol: 0x6c8492,
    keyCol: 0x9aa9b8,
    ambTop: 0x1a2c42,
    ambLow: 0x07121e,
    hazeTint: 0xffffff,
  },
];

const LOOKS: Look[] = DEFS.map((d) => {
  const out = {} as Look;
  for (const k of NUM_KEYS) out[k] = d[k];
  for (const k of COL_KEYS) out[k] = lin(d[k]);
  return out;
});

/** Evaluated camera for a frame. Angles in radians. */
export interface CameraState {
  pos: THREE.Vector3;
  yaw: number;
  pitch: number;
  vfov: number;
  /** Horizon position from the top, 0..1. */
  hz: number;
}

/** Evaluated copy-safe masks (see CALM): rects in viewport fractions, y from the top. */
export interface CalmState {
  lift: THREE.Vector4;
  pool: THREE.Vector4;
  /** x lift strength, y pool strength, z pool share on sky/land, w unused. */
  amount: THREE.Vector4;
  /** Feathers (viewport heights): x/y lift across/vertical, z/w pool. */
  feather: THREE.Vector4;
}

export interface FrameState {
  cam: CameraState;
  look: Look;
  calm: CalmState;
  /** Index of the keyframe segment and its local parameter. */
  seg: number;
  t: number;
}

/**
 * Progress arrives already eased: the page maps scroll to progress with a hold
 * at each keyframe and smootherstep between them (../progress.ts). Easing
 * again here would bunch the whole flight into the middle of each gap, so the
 * segment parameter stays linear.
 */
export function easeSegment(t: number): number {
  return clamp(t, 0, 1);
}

export function locate(p: number): { seg: number; t: number } {
  const q = clamp(p, 0, 1);
  for (let i = 0; i < SCENES.length - 1; i++) {
    const a = SCENES[i].at;
    const b = SCENES[i + 1].at;
    if (q <= b || i === SCENES.length - 2) return { seg: i, t: clamp((q - a) / (b - a), 0, 1) };
  }
  return { seg: 0, t: 0 };
}

/** 0 → portrait phone framing, 1 → landscape desktop framing. */
export function landscapeWeight(aspect: number): number {
  return smoothstep(0.7, 1.35, aspect);
}

function vfovFor(hfovDeg: number, aspect: number): number {
  const h = (hfovDeg * Math.PI) / 180;
  const v = 2 * Math.atan(Math.tan(h / 2) / aspect);
  return Math.min(v, (82 * Math.PI) / 180);
}

const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const tmpC = new THREE.Vector3();
const tmpD = new THREE.Vector3();

/** Camera position on segment `seg` at local t for a landscape weight k (no ambient sway). */
export function flightPoint(seg: number, t: number, k: number, out: THREE.Vector3): THREE.Vector3 {
  const A = SHOTS[seg];
  const B = SHOTS[Math.min(seg + 1, SHOTS.length - 1)];
  const e = clamp(t, 0, 1);
  const u = 1 - e;
  tmpA.set(A.pos[0], A.pos[1], A.pos[2]);
  tmpB.set(B.pos[0], B.pos[1], B.pos[2]);
  if (A.via && B !== A) {
    tmpC.set(A.via[0][0], A.via[0][1], A.via[0][2]);
    tmpD.set(A.via[1][0], A.via[1][1], A.via[1][2]);
    out
      .set(0, 0, 0)
      .addScaledVector(tmpA, u * u * u)
      .addScaledVector(tmpC, 3 * u * u * e)
      .addScaledVector(tmpD, 3 * u * e * e)
      .addScaledVector(tmpB, e * e * e);
  } else {
    out.copy(tmpA).lerp(tmpB, e);
  }
  // the phone offsets ride on top of the flight, blended like every other parameter
  const p = 1 - k;
  out.x += p * lerp(A.mob.dx, B.mob.dx, e);
  out.y += p * lerp(A.mob.dy, B.mob.dy, e);
  out.z += p * lerp(A.mob.dz, B.mob.dz, e);
  return out;
}

const r4 = (r: readonly number[], m: readonly number[], k: number, out: THREE.Vector4) =>
  out.set(lerp(m[0], r[0], k), lerp(m[1], r[1], k), lerp(m[2], r[2], k), lerp(m[3], r[3], k));
const calmA = new THREE.Vector4();
const calmB = new THREE.Vector4();

export function evaluate(p: number, aspect: number, out: FrameState): FrameState {
  const { seg, t } = locate(p);
  const e = easeSegment(t);
  const A = SHOTS[seg];
  const B = SHOTS[seg + 1];
  const k = landscapeWeight(aspect);

  flightPoint(seg, e, k, out.cam.pos);
  const d2r = Math.PI / 180;
  const yawA = A.yaw + (1 - k) * A.mob.yaw;
  const yawB = B.yaw + (1 - k) * B.mob.yaw;
  out.cam.yaw = lerp(yawA, yawB, e) * d2r;
  out.cam.pitch = lerp(A.pitch, B.pitch, e) * d2r;
  out.cam.vfov = lerp(
    vfovFor(lerp(A.mob.hfov, A.hfov, k), aspect),
    vfovFor(lerp(B.mob.hfov, B.hfov, k), aspect),
    e
  );
  out.cam.hz = lerp(lerp(A.mob.hz, A.hz, k), lerp(B.mob.hz, B.hz, k), e);

  const la = LOOKS[seg];
  const lb = LOOKS[seg + 1];
  for (const key of NUM_KEYS) out.look[key] = lerp(la[key], lb[key], e);
  for (const key of COL_KEYS) out.look[key].copy(la[key]).lerp(lb[key], e);

  const ca = CALM[seg];
  const cb = CALM[seg + 1];
  out.calm.lift.copy(r4(ca.lift, ca.liftM, k, calmA)).lerp(r4(cb.lift, cb.liftM, k, calmB), e);
  out.calm.pool.copy(r4(ca.pool, ca.poolM, k, calmA)).lerp(r4(cb.pool, cb.poolM, k, calmB), e);
  // copy only sits still near a keyframe; mid-flight it scrolls past, so the masks
  // relax instead of hazing whatever land the camera passes. The page holds each
  // keyframe while its heading scrolls into place (progress.ts HOLD), so the masks of
  // the next scene come back only at the very end of the flight: earlier, they read as
  // a pale bar of fog in an empty sky
  const relax = 1 - 0.8 * smoothstep(0.12, 0.4, e) * (1 - smoothstep(0.78, 0.98, e));
  out.calm.amount.set(
    lerp(ca.liftS, cb.liftS, e) * relax,
    lerp(ca.poolS, cb.poolS, e) * relax,
    lerp(ca.poolSky, cb.poolSky, e),
    0
  );
  out.calm.feather.set(
    lerp(ca.liftF[0], cb.liftF[0], e),
    lerp(ca.liftF[1], cb.liftF[1], e),
    lerp(ca.poolF[0], cb.poolF[0], e),
    lerp(ca.poolF[1], cb.poolF[1], e)
  );
  out.seg = seg;
  out.t = e;
  return out;
}

export function createFrameState(): FrameState {
  const look = {} as Look;
  for (const k of NUM_KEYS) look[k] = 0;
  for (const k of COL_KEYS) look[k] = new THREE.Color();
  return {
    cam: { pos: new THREE.Vector3(), yaw: 0, pitch: 0, vfov: 0.6, hz: 0.6 },
    look,
    calm: {
      lift: new THREE.Vector4(),
      pool: new THREE.Vector4(),
      amount: new THREE.Vector4(),
      feather: new THREE.Vector4(),
    },
    seg: 0,
    t: 0,
  };
}

/**
 * Off-axis perspective: the horizon lands at `hz` from the top while the view
 * stays level, so verticals stay vertical. Shared by the engine and the tools
 * that check compositions.
 */
export function setLens(
  camera: THREE.PerspectiveCamera,
  c: CameraState,
  aspect: number,
  near: number,
  far: number
): void {
  const tv = Math.tan(c.vfov / 2);
  const p12 = -(1 - 2 * c.hz) - Math.tan(c.pitch) / tv;
  const top = near * tv * (1 + p12);
  const bottom = -near * tv * (1 - p12);
  const right = near * tv * aspect;
  camera.projectionMatrix.makePerspective(-right, right, top, bottom, near, far);
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  camera.fov = (c.vfov * 180) / Math.PI;
  camera.aspect = aspect;
}

/** Unit direction for an azimuth (deg, 0 = north = −z, 90 = east) and an elevation (deg). */
export function dirFromAzEl(az: number, el: number, out: THREE.Vector3): THREE.Vector3 {
  const a = (az * Math.PI) / 180;
  const e = (el * Math.PI) / 180;
  return out.set(Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e));
}

/**
 * Sun and moon directions of a look on a screen of this aspect: the portrait
 * overrides (sunElP, moonAzP, moonElP) blend exactly like the portrait camera
 * they were set for. Shared by the engine and the framing tests.
 */
export function lightDirections(
  L: Look,
  aspect: number,
  sun: THREE.Vector3,
  moon: THREE.Vector3
): void {
  const k = landscapeWeight(aspect);
  dirFromAzEl(L.sunAz, lerp(L.sunElP, L.sunEl, k), sun);
  dirFromAzEl(lerp(L.moonAzP, L.moonAz, k), lerp(L.moonElP, L.moonEl, k), moon);
}

/** Brand colours the post pass compresses toward (kept here so the grade lives with the timeline). */
export const GRADE = {
  ink: BRAND.navyDeep,
  paper: BRAND.paper,
  ramp: [
    BRAND.navyDeep,
    BRAND.navy,
    BRAND.teal,
    BRAND.slate,
    BRAND.fog,
    BRAND.line,
    BRAND.sand,
  ] as const,
};
