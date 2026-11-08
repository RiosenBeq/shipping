import * as THREE from "three";
import { VOYAGE_SCENES as SCENES } from "../types";
import { BRAND, lin } from "./palette";
import { clamp, lerp, smoothstep, type V3 } from "./math";

/**
 * Camera keyframe. Yaw 0 looks north (−z, up the Bosphorus), +90 looks east (+x).
 * The horizon is placed with a vertical lens shift so verticals stay vertical
 * (minarets, masts, bridge towers) - an illustrator's camera rather than a tilted one.
 */
export interface Shot {
  pos: V3;
  yaw: number;
  pitch: number;
  /** Horizontal FOV (deg) on a 16:10 landscape screen. */
  hfov: number;
  /** Horizon position from the top (0..1), landscape. */
  hz: number;
  /** Portrait (phone) framing: horizontal FOV, horizon, yaw offset toward the subject. */
  pHfov: number;
  pHz: number;
  pYaw: number;
  /** Optional Bezier control point for the flight toward the NEXT keyframe (keeps it on water). */
  via?: V3;
}

export const SHOTS: readonly Shot[] = [
  // hero — the Bosphorus at first light, low over the strait looking north.
  // Horizon at 60 % (52 % on phones): the headline sits on the sky, the pitch and buttons on the water.
  {
    pos: [-60, 9, 700],
    yaw: 3,
    pitch: 0,
    hfov: 56,
    hz: 0.6,
    pHfov: 44,
    pHz: 0.52,
    pYaw: 9,
    via: [120, 24, 2300],
  },
  // desks — open water in the Marmara, a little higher, looking south.
  {
    pos: [300, 32, 3600],
    yaw: 180,
    pitch: -1.5,
    hfov: 56,
    hz: 0.41,
    pHfov: 46,
    pHz: 0.4,
    pYaw: 6,
    via: [-1100, 60, -600],
  },
  // straits — golden hour under the Bosphorus Bridge, looking up the strait.
  {
    pos: [-150, 14, -3800],
    yaw: 336,
    pitch: 1,
    hfov: 58,
    hz: 0.6,
    pHfov: 46,
    pHz: 0.64,
    pYaw: 2,
    via: [-80, 40, 900],
  },
  // process — dusk on the Marmara, the old city's skyline on the horizon.
  {
    pos: [-900, 14, 3000],
    yaw: 354,
    pitch: 0,
    hfov: 58,
    hz: 0.74,
    pHfov: 46,
    pHz: 0.8,
    pYaw: -2,
    via: [-150, 12, 1500],
  },
  // contact — night watch by Maiden's Tower.
  { pos: [130, 6, 120], yaw: 368, pitch: 1, hfov: 58, hz: 0.62, pHfov: 46, pHz: 0.66, pYaw: 12 },
];

/** Every scalar of a look; colours are interpolated in linear light. */
const NUM_KEYS = [
  "sunAz",
  "sunEl",
  "sunI",
  "sunR",
  "moonAz",
  "moonEl",
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

const DEFS: readonly LookDef[] = [
  // hero — dawn: pale sand-blue sky, brass haze over the Asian hills.
  {
    sunAz: 25,
    sunEl: 3.4,
    sunI: 1.3,
    sunR: 0.85,
    moonAz: 200,
    moonEl: -20,
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
    foam: 0.55,
    stars: 0,
    lights: 0.06,
    smear: 1,
    vignette: 0.22,
    zenith: 0x8fa6b6,
    mid: 0xc3cdd0,
    hor: 0xeee2c8,
    glow: 0xf2c27e,
    anti: 0xd3d0d2,
    sunCol: 0xffc98a,
    sunDisc: 0xf9dda6,
    moonCol: 0x000000,
    cloudLit: 0xfbe6c2,
    cloudShade: 0xaeb8be,
    seaDeep: 0x0a2840,
    seaBody: 0x165061,
    seaSSS: 0x3d8e8a,
    foamCol: 0xede6d4,
    keyCol: 0xffddb0,
    ambTop: 0xb0bfc9,
    ambLow: 0x345460,
    hazeTint: 0xe4e9ee,
  },
  // desks — clear morning in the Marmara: cooler, crisper, more chop.
  {
    sunAz: 135,
    sunEl: 22,
    sunI: 1.15,
    sunR: 0.7,
    moonAz: 200,
    moonEl: -20,
    moonI: 0,
    keyAz: 125,
    keyEl: 28,
    keyI: 1.0,
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
    cloudCov: 0.5,
    cloudSoft: 0.3,
    cloudAmt: 0.55,
    cloudScale: 0.45,
    waveAmp: 1.2,
    ripple: 0.4,
    glitter: 0.9,
    foam: 0.9,
    stars: 0,
    lights: 0,
    smear: 1,
    vignette: 0.2,
    zenith: 0x7a95aa,
    mid: 0xb6c5cc,
    hor: 0xe2e3da,
    glow: 0xede2c6,
    anti: 0xd2d8d8,
    sunCol: 0xfff0d4,
    sunDisc: 0xfff6e2,
    moonCol: 0x000000,
    cloudLit: 0xf6f1e6,
    cloudShade: 0xa4b2bc,
    seaDeep: 0x082640,
    seaBody: 0x144a5c,
    seaSSS: 0x2e8a86,
    foamCol: 0xf2eee3,
    keyCol: 0xfff0d6,
    ambTop: 0xaebfca,
    ambLow: 0x2f4e5a,
    hazeTint: 0xeef1f2,
  },
  // straits — golden hour: warm low sun on the left, long glitter path.
  {
    sunAz: 314,
    sunEl: 5.5,
    sunI: 1.5,
    sunR: 0.9,
    moonAz: 200,
    moonEl: -20,
    moonI: 0,
    keyAz: 300,
    keyEl: 12,
    keyI: 1.0,
    night: 0,
    exposure: 1.0,
    glowW: 5,
    glowA: 0.92,
    antiA: 0.4,
    horSharp: 7,
    fogD: 1 / 4800,
    fogH: 1 / 240,
    fogMax: 0.85,
    hazeEl: 0.035,
    cloudCov: 0.5,
    cloudSoft: 0.3,
    cloudAmt: 0.55,
    cloudScale: 0.5,
    waveAmp: 0.9,
    ripple: 0.34,
    glitter: 1.25,
    foam: 0.6,
    stars: 0,
    lights: 0.12,
    smear: 1,
    vignette: 0.24,
    zenith: 0x7f93a3,
    mid: 0xc7ba9e,
    hor: 0xeec98e,
    glow: 0xf2a85a,
    anti: 0xb3b2b9,
    sunCol: 0xffb86e,
    sunDisc: 0xfbd9a0,
    moonCol: 0x000000,
    cloudLit: 0xf7d3a0,
    cloudShade: 0x8f95a0,
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
    sunAz: 288,
    sunEl: -4.5,
    sunI: 0.55,
    sunR: 0.9,
    moonAz: 60,
    moonEl: 4,
    moonI: 0.1,
    keyAz: 285,
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
    hor: 0x6a6574,
    glow: 0xd0906a,
    anti: 0x2b3d52,
    sunCol: 0xe09068,
    sunDisc: 0x000000,
    moonCol: 0x9aa4ad,
    cloudLit: 0xb07a78,
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
  // contact — night watch: deep navy, moon glitter, Maiden's Tower lit.
  {
    sunAz: 280,
    sunEl: -24,
    sunI: 0,
    sunR: 0.9,
    moonAz: 18,
    moonEl: 15,
    moonI: 1.0,
    keyAz: 25,
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

export interface FrameState {
  cam: CameraState;
  look: Look;
  /** Index of the keyframe segment and its eased local parameter. */
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

function shotParams(s: Shot, aspect: number): { hfov: number; hz: number; yawOff: number } {
  // 0 → portrait phone framing, 1 → landscape desktop framing.
  const k = smoothstep(0.7, 1.35, aspect);
  return { hfov: lerp(s.pHfov, s.hfov, k), hz: lerp(s.pHz, s.hz, k), yawOff: lerp(s.pYaw, 0, k) };
}

function vfovFor(hfovDeg: number, aspect: number): number {
  const h = (hfovDeg * Math.PI) / 180;
  const v = 2 * Math.atan(Math.tan(h / 2) / aspect);
  return Math.min(v, (82 * Math.PI) / 180);
}

const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const tmpC = new THREE.Vector3();

export function evaluate(p: number, aspect: number, out: FrameState): FrameState {
  const { seg, t } = locate(p);
  const e = easeSegment(t);
  const A = SHOTS[seg];
  const B = SHOTS[seg + 1];
  const pa = shotParams(A, aspect);
  const pb = shotParams(B, aspect);

  // Position: quadratic Bezier through the segment's "via" control point.
  tmpA.set(A.pos[0], A.pos[1], A.pos[2]);
  tmpB.set(B.pos[0], B.pos[1], B.pos[2]);
  if (A.via) {
    tmpC.set(A.via[0], A.via[1], A.via[2]);
    const u = 1 - e;
    out.cam.pos
      .set(0, 0, 0)
      .addScaledVector(tmpA, u * u)
      .addScaledVector(tmpC, 2 * u * e)
      .addScaledVector(tmpB, e * e);
  } else {
    out.cam.pos.copy(tmpA).lerp(tmpB, e);
  }
  const d2r = Math.PI / 180;
  out.cam.yaw = lerp(A.yaw + pa.yawOff, B.yaw + pb.yawOff, e) * d2r;
  out.cam.pitch = lerp(A.pitch, B.pitch, e) * d2r;
  out.cam.vfov = lerp(vfovFor(pa.hfov, aspect), vfovFor(pb.hfov, aspect), e);
  out.cam.hz = lerp(pa.hz, pb.hz, e);

  const la = LOOKS[seg];
  const lb = LOOKS[seg + 1];
  for (const k of NUM_KEYS) out.look[k] = lerp(la[k], lb[k], e);
  for (const k of COL_KEYS) out.look[k].copy(la[k]).lerp(lb[k], e);
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
    seg: 0,
    t: 0,
  };
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
