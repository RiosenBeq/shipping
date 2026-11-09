/**
 * The derived geometry every view shares: stations, deck heights, the stern and stem contours
 * (as monotonic cubic chains, so any waterline can be cut against them), the accommodation,
 * funnel, propeller and rudder, the cargo block and the deck's half-breadth. All in metres:
 * x from the aft perpendicular (the rudder stock) forward, z above the keel, y to port.
 */
import { clamp, seg, solve, solveChain, type Cubic, type Pt } from "./pen";
import type { ShipParticulars } from "./particulars";

/** One accommodation deck, m. */
export const TIER = 2.8;
/** Bulwark and rail height, m. */
export const RAIL = 1.1;

export interface Hull {
  p: ShipParticulars;
  L: number;
  B: number;
  D: number;
  T: number;
  /** Stern extreme (top of the transom) and stem extreme (bulwark top), m from the AP. */
  xs: number;
  xb: number;
  /** Poop and forecastle deck heights, the forecastle bulwark top. */
  zPoop: number;
  zFcle: number;
  zBulw: number;
  /** Forward end of the poop deck, aft end of the forecastle (the breaks). */
  xPoop: number;
  xFcle: number;
  /** Main deck rise above D at x (sheer). */
  sheer: (x: number) => number;
  house: { xa: number; xf: number; len: number; w: number; zBridge: number; zRoof: number };
  funnel: { xa: number; xf: number; zb: number; zt: number; rake: number };
  prop: { x: number; z: number; d: number; boss: number };
  rudder: { xa: number; xf: number; zb: number; zta: number; ztf: number };
  /** Transom bottom. */
  transom: Pt;
  /** Stern contour, transom bottom → keel; stem contour, keel → bulwark top. */
  stern: Cubic[];
  bow: Cubic[];
  /** Flat keel, aft and forward ends. */
  keel: [number, number];
  /** Double bottom height, double side width, bilge radius, deck camber. */
  db: number;
  wing: number;
  bilge: number;
  camber: number;
  /** Cargo tank boundaries, aft → forward (tanks + 1 stations). */
  cargo: number[];
  xColl: number;
  xMan: number;
  /** Half-breadth of the deck at x (plan view). */
  deckHB: (x: number) => number;
  /** Plan-view deck edge, port side, stern → stem (cubic chain, ship x / y). */
  deck: Cubic[];
  /** The hull's aft and forward extent at height z (where a waterline meets the contours). */
  sternX: (z: number) => number;
  bowX: (z: number) => number;
  /** Vent mast height above the deck (gas: max(6 m, B/3) + 1.5). */
  vent: number;
  /** Gas and pressurised: lobe radius and centre height of the Type C / prismatic tanks. */
  tankR: number;
  tankZ: number;
  /** Cargo dome width and height above the deck. */
  dome: { w: number; h: number };
}

export function hull(p: ShipParticulars): Hull {
  const L = p.lbp;
  const B = p.b;
  const D = p.d;
  const T = p.t;
  const over = p.loa - L;
  const xs = -0.45 * over;
  const xb = L + 0.55 * over;
  const big = Math.min(1, L / 316);

  // Sheer: parabolic rise forward (and 40% of it aft) from a low point at 0.4 L.
  const sheer = (x: number) => {
    const u = x / L;
    if (u >= 0.4) return p.sheer * ((u - 0.4) / 0.6) ** 2;
    return 0.4 * p.sheer * ((0.4 - u) / 0.4) ** 2;
  };
  const step = clamp(2.2 + 0.0019 * L, 2.2, 2.8);
  const zPoop = D + sheer(xs) + step;
  const zFcle = D + sheer(xb) + step;
  const zBulw = zFcle + RAIL;

  // Accommodation aft, over the engine room: relatively longer on small ships.
  const len = L * (0.065 + 0.04 * (1 - big));
  const xf = L * (0.13 + 0.06 * (1 - big));
  const xa = xf - len;
  const zBridge = zPoop + (p.tiers - 1) * TIER;
  const zRoof = zBridge + 3;
  const house = { xa, xf, len, w: B * (0.72 - 0.1 * big), zBridge, zRoof };
  const fzb = zBridge - TIER;
  const fzt = zRoof + 2.5 + 0.008 * L;
  const funnel = {
    xa: xa + 0.02 * len,
    xf: xa + 0.32 * len,
    zb: fzb,
    zt: fzt,
    rake: 0.14 * (fzt - fzb),
  };

  // Propeller, rudder and the stern contour.
  const pd = Math.min(0.66 * T, 0.03 * p.loa + 0.4);
  const zs = 0.58 * pd;
  const chord = 0.75 * pd;
  const px = 0.45 * chord + 0.3 * pd;
  const boss = 0.13 * pd;
  const ztb = T + 0.35 * (zPoop - T);
  const transom: Pt = [xs + 0.12 * (zPoop - ztb), ztb];
  const pc: Pt = [px + 0.2 * pd, zs + 0.62 * pd];
  // The counter drops steeply under the transom, then runs forward over the rudder and screw.
  const counter: Cubic = [
    transom,
    [transom[0] + 0.22 * (pc[0] - transom[0]), ztb - 0.42 * (ztb - pc[1])],
    [pc[0] - 0.5 * (pc[0] - transom[0]), pc[1] + 0.04 * pd],
    pc,
  ];
  const bt: Pt = [px + 0.17 * pd, zs + boss];
  const bb: Pt = [bt[0], zs - boss];
  const aperture: Cubic = [
    pc,
    [pc[0] + 0.04 * pd, pc[1] - 0.25 * pd],
    [bt[0], bt[1] + 0.15 * pd],
    bt,
  ];
  const bossC: Cubic = [bt, [bt[0] - (4 / 3) * boss, bt[1]], [bb[0] - (4 / 3) * boss, bb[1]], bb];
  const ka: Pt = [px + 1.35 * pd, 0];
  const skeg: Cubic = [
    bb,
    [bb[0] + 0.08 * pd, bb[1] - 0.45 * bb[1]],
    [ka[0] - 0.55 * (ka[0] - bb[0]), 0],
    ka,
  ];
  const stern = [counter, aperture, bossC, skeg];
  const counterZ = (x: number) => solve(counter, 0, x)?.[1] ?? pc[1];
  const rudder = {
    xa: -0.55 * chord,
    xf: 0.45 * chord,
    zb: zs - 0.52 * pd,
    zta: counterZ(-0.55 * chord) - 0.15,
    ztf: counterZ(0.45 * chord) - 0.15,
  };

  // Stem: bulb below the waterline, a raked stem above it; FP where the stem meets the DWL.
  const fwd = xb - L;
  const nose: Pt = [L + 0.95 * fwd, 0.4 * T];
  const neck: Pt = [L - 0.012 * L, 0.7 * T];
  const kf: Pt = [L - 0.03 * L, 0];
  const fpw: Pt = [L, T];
  const top: Pt = [xb, zBulw];
  const ru = Math.hypot(top[0] - fpw[0], top[1] - fpw[1]);
  const ux = (top[0] - fpw[0]) / ru;
  const uz = (top[1] - fpw[1]) / ru;
  const nk = 0.4 * (T - neck[1]);
  const bow: Cubic[] = [
    [kf, [kf[0] + 0.6 * (nose[0] - kf[0]), 0], [nose[0], 0.3 * nose[1]], nose],
    [
      nose,
      [nose[0], nose[1] + 0.55 * (neck[1] - nose[1])],
      [neck[0] + 0.55 * (nose[0] - neck[0]), neck[1]],
      neck,
    ],
    [neck, [neck[0] + 0.15 * nk, neck[1] + nk], [fpw[0] - ux * nk, fpw[1] - uz * nk], fpw],
    seg(fpw, top),
  ];

  // Plan: the deck edge (port), stern → stem, and its half-breadth.
  const xPa = L * (0.1 + 0.25 * (0.83 - p.cb));
  const xPf = L * (0.58 + (p.cb - 0.68) * 1.4);
  const hT = (p.transom * B) / 2;
  const tc: Pt = [xs + 0.005 * L + 0.4, hT];
  const k1 = 0.35 + 1.6 * (p.cb - 0.68);
  const k2 = 0.2 + 1.2 * (p.cb - 0.68);
  const deckAft: Cubic = [
    tc,
    [tc[0] + 0.12 * (xPa - tc[0]), hT + 0.55 * (B / 2 - hT)],
    [xPa - 0.55 * (xPa - tc[0]), B / 2],
    [xPa, B / 2],
  ];
  const deckFwd: Cubic = [
    [xPf, B / 2],
    [xPf + k1 * (xb - xPf), B / 2],
    [xb, k2 * (B / 2)],
    [xb, 0],
  ];
  const deck = [deckAft, seg([xPa, B / 2], [xPf, B / 2]), deckFwd];
  const deckHB = (x: number) => {
    if (x <= tc[0]) return hT;
    if (x >= xb) return 0;
    if (x < xPa) return solve(deckAft, 0, x)?.[1] ?? hT;
    if (x <= xPf) return B / 2;
    return solve(deckFwd, 0, x)?.[1] ?? 0;
  };

  const sternX = (z: number) => {
    if (z >= ztb) return transom[0] - (transom[0] - xs) * clamp((z - ztb) / (zPoop - ztb), 0, 1);
    return solveChain(stern, 1, z)?.[0] ?? ka[0];
  };
  const bowX = (z: number) =>
    z <= 0 ? kf[0] : (solveChain(bow, 1, Math.min(z, zBulw))?.[0] ?? xb);

  // Cargo block: pump room / slops forward of the house, collision bulkhead under the fo'c'sle.
  const xPoop = xf + 0.012 * L + 1;
  const xFcle = L - 0.085 * L;
  const xColl = L - 0.06 * L;
  const xAft = xf + 0.035 * L;
  const cargo = Array.from(
    { length: p.tanks + 1 },
    (_, i) => xAft + ((xColl - xAft) * i) / p.tanks
  );
  const xMan = p.kit === "pressurised" ? cargo[1] : 0.5 * L;

  const db = clamp(B / 15, 1, 3) * 0.95;
  const wing = clamp(0.056 * B, 2, 3.4);
  const bilge = clamp(0.095 * B, 1.5, 6);
  const camber = B / 60;
  const vent = Math.max(6, B / 3) + 1.5;

  // Cargo tanks: prismatic (gas) fill the hold; Type C lobes sized to the beam.
  const tankR = p.kit === "pressurised" ? 0.235 * B : p.kit === "semiref" ? (B - 2.4) / 3.6 : 0;
  const tankZ = p.kit === "pressurised" ? D - 0.1 * tankR : db + 0.6 + tankR;
  const dome = { w: (p.kit === "pressurised" ? 0.12 : 0.13) * B, h: 1.4 + 0.004 * L };

  return {
    p,
    L,
    B,
    D,
    T,
    xs,
    xb,
    zPoop,
    zFcle,
    zBulw,
    xPoop,
    xFcle,
    sheer,
    house,
    funnel,
    prop: { x: px, z: zs, d: pd, boss },
    rudder,
    transom,
    stern,
    bow,
    keel: [ka[0], kf[0]],
    db,
    wing,
    bilge,
    camber,
    cargo,
    xColl,
    xMan,
    deckHB,
    deck,
    sternX,
    bowX,
    vent,
    tankR,
    tankZ,
    dome,
  };
}
