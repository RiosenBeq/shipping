/**
 * Ship classes as lines-plan parameters (DESIGN-V2 §6.3 `P-lines`): principal particulars
 * (physical ranges only, no rates), hull form coefficients and the deck kit. The lines plan
 * morphs between two classes by interpolating these numbers over 700 ms (ease-swell).
 *
 * L/B/T come from content/tanker-classes.json where it lists them; the gas carriers and the
 * remaining figures are typical particulars of each size band.
 */
import { easeSwell, DURATION } from "../motion";

export type DeckKit = "tanker" | "gas" | "pressurised";

export type ShipClassSlug =
  | "vlcc"
  | "suezmax"
  | "aframax"
  | "lr1"
  | "mr"
  | "vlgc"
  | "mgc"
  | "handysize"
  | "pressurised";

export interface HullParams {
  /** Length between perpendiculars, m. */
  L: number;
  /** Beam, m. */
  B: number;
  /** Design draught, m. */
  T: number;
  /** Depth to the main deck, m. */
  D: number;
  /** Block coefficient: fuller hulls have a longer parallel midbody and blunter ends. */
  Cb: number;
  /** Stem rake above the waterline, as a share of the freeboard. */
  bowRake: number;
  /** Transom width at the deck, as a share of the beam. */
  stern: number;
}

export interface ShipClassLines {
  slug: ShipClassSlug;
  label: string;
  /** Spoken in the Ships caption ("VLGC — very large gas carrier"). */
  longName: string;
  family: "tanker" | "gas";
  deckKit: DeckKit;
  /** Domes (gas) or bullet tanks (pressurised). */
  kitCount: number;
  params: HullParams;
}

export const SHIP_CLASSES: Record<ShipClassSlug, ShipClassLines> = {
  vlcc: {
    slug: "vlcc",
    label: "VLCC",
    longName: "Very large crude carrier",
    family: "tanker",
    deckKit: "tanker",
    kitCount: 0,
    params: { L: 330, B: 60, T: 22.5, D: 31, Cb: 0.83, bowRake: 0.18, stern: 0.78 },
  },
  suezmax: {
    slug: "suezmax",
    label: "Suezmax",
    longName: "Suezmax tanker",
    family: "tanker",
    deckKit: "tanker",
    kitCount: 0,
    params: { L: 275, B: 48, T: 17, D: 23.7, Cb: 0.82, bowRake: 0.2, stern: 0.76 },
  },
  aframax: {
    slug: "aframax",
    label: "Aframax / LR2",
    longName: "Aframax or LR2 tanker",
    family: "tanker",
    deckKit: "tanker",
    kitCount: 0,
    params: { L: 250, B: 44, T: 14.5, D: 21, Cb: 0.81, bowRake: 0.2, stern: 0.75 },
  },
  lr1: {
    slug: "lr1",
    label: "LR1",
    longName: "Long range 1 product tanker",
    family: "tanker",
    deckKit: "tanker",
    kitCount: 0,
    params: { L: 228, B: 32.2, T: 14, D: 20, Cb: 0.8, bowRake: 0.22, stern: 0.72 },
  },
  mr: {
    slug: "mr",
    label: "MR",
    longName: "Medium range product tanker",
    family: "tanker",
    deckKit: "tanker",
    kitCount: 0,
    params: { L: 183, B: 32.2, T: 13, D: 18.5, Cb: 0.79, bowRake: 0.22, stern: 0.72 },
  },
  vlgc: {
    slug: "vlgc",
    label: "VLGC",
    longName: "Very large gas carrier",
    family: "gas",
    deckKit: "gas",
    kitCount: 4,
    params: { L: 230, B: 36.6, T: 11.6, D: 22, Cb: 0.77, bowRake: 0.25, stern: 0.7 },
  },
  mgc: {
    slug: "mgc",
    label: "MGC",
    longName: "Medium gas carrier",
    family: "gas",
    deckKit: "gas",
    kitCount: 3,
    params: { L: 180, B: 30, T: 10.5, D: 18.5, Cb: 0.75, bowRake: 0.25, stern: 0.68 },
  },
  handysize: {
    slug: "handysize",
    label: "Handysize",
    longName: "Handysize gas carrier",
    family: "gas",
    deckKit: "gas",
    kitCount: 3,
    params: { L: 160, B: 26, T: 9.5, D: 16, Cb: 0.73, bowRake: 0.25, stern: 0.66 },
  },
  pressurised: {
    slug: "pressurised",
    label: "Pressurised LPG",
    longName: "Fully pressurised LPG carrier",
    family: "gas",
    deckKit: "pressurised",
    kitCount: 3,
    params: { L: 99, B: 17, T: 6.3, D: 8.5, Cb: 0.7, bowRake: 0.28, stern: 0.64 },
  },
};

export const SHIP_CLASS_SLUGS = Object.keys(SHIP_CLASSES) as ShipClassSlug[];

export function isShipClass(v: string | null | undefined): v is ShipClassSlug {
  return v != null && Object.prototype.hasOwnProperty.call(SHIP_CLASSES, v);
}

const PARAM_KEYS = ["L", "B", "T", "D", "Cb", "bowRake", "stern"] as const;

export function lerpParams(a: HullParams, b: HullParams, t: number): HullParams {
  const out = { ...a };
  for (const k of PARAM_KEYS) out[k] = a[k] + (b[k] - a[k]) * t;
  return out;
}

/** What the lines plan draws at one moment of a morph. */
export interface MorphFrame {
  params: HullParams;
  /** The kit fading out and the one fading in (the same kit when both classes share it). */
  kitFrom: { kit: DeckKit; count: number };
  kitTo: { kit: DeckKit; count: number };
  /** 0 → 1: weight of `kitTo` (eased). */
  kitMix: number;
  done: boolean;
}

/**
 * The morph from one class to another after `elapsedMs` (700 ms, ease-swell). Reduced motion
 * or a zero duration jumps straight to the target.
 */
export function morphAt(
  from: ShipClassSlug,
  to: ShipClassSlug,
  elapsedMs: number,
  duration: number = DURATION.morph
): MorphFrame {
  const a = SHIP_CLASSES[from];
  const b = SHIP_CLASSES[to];
  const u = duration <= 0 ? 1 : Math.min(1, Math.max(0, elapsedMs / duration));
  const t = easeSwell(u);
  const sameKit = a.deckKit === b.deckKit && a.kitCount === b.kitCount;
  return {
    params: lerpParams(a.params, b.params, t),
    kitFrom: { kit: a.deckKit, count: a.kitCount },
    kitTo: { kit: b.deckKit, count: b.kitCount },
    kitMix: sameKit ? 1 : t,
    done: u >= 1,
  };
}

/** World units per metre: every hull fits the frame, a smaller class still reads smaller. */
export function displayScale(L: number, refLength = 10, refL = 330): number {
  return (refLength * Math.pow(L / refL, 0.35)) / L;
}
