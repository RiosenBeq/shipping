/**
 * Typical particulars of the nine classes the desks fix, for the general-arrangement (GA)
 * drawings. Tanker LOA, beam and draught match content/tanker-classes.json (the figures the
 * class pages print); the rest are typical figures for a modern ship of each size band —
 * illustrative, never a specific vessel.
 */
import type { ShipClassSlug } from "@/components/site/stage/lines/classes";

export type { ShipClassSlug };

/**
 * What sits on deck and in the holds: crude/product tanker; fully refrigerated gas carrier
 * (prismatic tanks, domes, compressor house); semi-refrigerated (bilobe Type C tanks below
 * deck); fully pressurised (cylindrical Type C tanks standing proud of the deck).
 */
export type ShipKit = "tanker" | "gas" | "semiref" | "pressurised";

export interface ShipParticulars {
  slug: ShipClassSlug;
  label: string;
  /** Length overall, m. */
  loa: number;
  /** Length between perpendiculars (AP at the rudder stock, FP at the stem on the DWL), m. */
  lbp: number;
  /** Moulded beam, m. */
  b: number;
  /** Moulded depth to the main deck, m. */
  d: number;
  /** Design (summer) draught, m. */
  t: number;
  /** Block coefficient: fuller hulls carry their full beam further fore and aft. */
  cb: number;
  kit: ShipKit;
  /** Cargo tanks fore and aft. */
  tanks: number;
  /** Tankers: tanks across (2 = centreline bulkhead, 3 = two longitudinal bulkheads). */
  across: 2 | 3;
  /** Accommodation decks above the poop, the navigation bridge included. */
  tiers: number;
  /** Hose-handling cranes at the manifold. */
  cranes: 1 | 2;
  /** Main deck sheer at the bow, m (0: flush). */
  sheer: number;
  /** Transom width at the deck as a share of the beam. */
  transom: number;
  /** Size in the trade's own unit, for the title block. */
  size: string;
}

const P = (p: ShipParticulars) => p;

export const PARTICULARS: Record<ShipClassSlug, ShipParticulars> = {
  vlcc: P({
    slug: "vlcc",
    label: "VLCC",
    loa: 330,
    lbp: 316,
    b: 60,
    d: 30.5,
    t: 22.5,
    cb: 0.83,
    kit: "tanker",
    tanks: 5,
    across: 3,
    tiers: 7,
    cranes: 2,
    sheer: 0,
    transom: 0.78,
    size: "≈ 300,000 dwt",
  }),
  suezmax: P({
    slug: "suezmax",
    label: "Suezmax",
    loa: 275,
    lbp: 264,
    b: 48,
    d: 23.2,
    t: 17,
    cb: 0.82,
    kit: "tanker",
    tanks: 6,
    across: 2,
    tiers: 6,
    cranes: 2,
    sheer: 0,
    transom: 0.76,
    size: "≈ 158,000 dwt",
  }),
  aframax: P({
    slug: "aframax",
    label: "Aframax / LR2",
    loa: 250,
    lbp: 239,
    b: 44,
    d: 21.2,
    t: 14.5,
    cb: 0.81,
    kit: "tanker",
    tanks: 6,
    across: 2,
    tiers: 6,
    cranes: 2,
    sheer: 0,
    transom: 0.75,
    size: "≈ 115,000 dwt",
  }),
  lr1: P({
    slug: "lr1",
    label: "LR1",
    loa: 228,
    lbp: 219,
    b: 32,
    d: 20.6,
    t: 14,
    cb: 0.8,
    kit: "tanker",
    tanks: 6,
    across: 2,
    tiers: 5,
    cranes: 1,
    sheer: 0,
    transom: 0.74,
    size: "≈ 74,000 dwt",
  }),
  mr: P({
    slug: "mr",
    label: "MR",
    loa: 183,
    lbp: 174,
    b: 32,
    d: 18.5,
    t: 13,
    cb: 0.8,
    kit: "tanker",
    tanks: 6,
    across: 2,
    tiers: 5,
    cranes: 1,
    sheer: 0,
    transom: 0.74,
    size: "≈ 50,000 dwt",
  }),
  vlgc: P({
    slug: "vlgc",
    label: "VLGC",
    loa: 230,
    lbp: 219,
    b: 36.6,
    d: 22,
    t: 11.6,
    cb: 0.77,
    kit: "gas",
    tanks: 4,
    across: 2,
    tiers: 5,
    cranes: 2,
    sheer: 0,
    transom: 0.7,
    size: "≈ 84,000 m³",
  }),
  mgc: P({
    slug: "mgc",
    label: "MGC",
    loa: 180,
    lbp: 171,
    b: 30,
    d: 18.6,
    t: 10.5,
    cb: 0.75,
    kit: "gas",
    tanks: 3,
    across: 2,
    tiers: 5,
    cranes: 1,
    sheer: 0.3,
    transom: 0.68,
    size: "≈ 38,000 m³",
  }),
  handysize: P({
    slug: "handysize",
    label: "Handysize",
    loa: 160,
    lbp: 151,
    b: 26,
    d: 17,
    t: 9.5,
    cb: 0.73,
    kit: "semiref",
    tanks: 3,
    across: 2,
    tiers: 4,
    cranes: 1,
    sheer: 0.5,
    transom: 0.66,
    size: "≈ 22,000 m³",
  }),
  pressurised: P({
    slug: "pressurised",
    label: "Pressurised LPG",
    loa: 99,
    lbp: 93,
    b: 17,
    d: 8.5,
    t: 6.3,
    cb: 0.7,
    kit: "pressurised",
    tanks: 2,
    across: 2,
    tiers: 3,
    cranes: 1,
    sheer: 0.8,
    transom: 0.64,
    size: "≈ 5,000 m³",
  }),
};

export const DRAWING_SLUGS = Object.keys(PARTICULARS) as ShipClassSlug[];

export function particulars(slug: ShipClassSlug): ShipParticulars {
  return PARTICULARS[slug];
}

export function isDrawnClass(v: string): v is ShipClassSlug {
  return Object.prototype.hasOwnProperty.call(PARTICULARS, v);
}

/** "330.0 m" — one decimal, as a GA title block prints it. */
export const metres = (v: number) => `${v.toFixed(1)} m`;
