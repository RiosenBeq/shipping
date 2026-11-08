/**
 * Fixed vocabulary of the freight calculator (/freight-calculator): fuels and their
 * emission factors, ship classes, the voyage's legs and port calls. Everything a desk
 * may want to change (prices, ports, distances, passages, class presets) lives in
 * content/freight.json and is edited in /keystatic; these are physical or structural
 * constants. Client-safe (no zod, no fs).
 */

/** Where the calculator lives. */
export const FREIGHT_PATH = "/freight-calculator";

/** Bunker grades the calculator prices: VLSFO 0.50%, HSFO 3.5% (scrubber-fitted ships), MGO 0.10%. */
export const FUELS = ["vlsfo", "hsfo", "mgo"] as const;
export type Fuel = (typeof FUELS)[number];

export const FUEL_LABELS: Record<Fuel, string> = {
  vlsfo: "VLSFO",
  hsfo: "HSFO",
  mgo: "MGO",
};

export const FUEL_LONG_LABELS: Record<Fuel, string> = {
  vlsfo: "VLSFO 0.50% S",
  hsfo: "HSFO 3.5% S (scrubber)",
  mgo: "MGO 0.10% S",
};

/**
 * t CO₂ per t of fuel: the IMO carbon factors (MEPC.308(73)) that EU MRV and the EU ETS
 * use — VLSFO counts as light fuel oil, HSFO as heavy fuel oil, MGO as diesel/gas oil.
 */
export const CO2_FACTOR: Record<Fuel, number> = {
  vlsfo: 3.151,
  hsfo: 3.114,
  mgo: 3.206,
};

/** The nine ship classes the site covers, in the order of the desks (tankers, then gas). */
export const CLASS_SLUGS = [
  "vlcc",
  "suezmax",
  "aframax",
  "lr1",
  "mr",
  "vlgc",
  "mgc",
  "handysize",
  "pressurised",
] as const;
export type ClassSlug = (typeof CLASS_SLUGS)[number];

const GAS: ReadonlySet<string> = new Set(["vlgc", "mgc", "handysize", "pressurised"]);
/** Clean-product tankers (the rest of the tanker classes are crude). */
const CLEAN: ReadonlySet<string> = new Set(["lr1", "mr"]);

export type ShipKind = "tanker" | "gas";
export const kindOf = (slug: string): ShipKind => (GAS.has(slug) ? "gas" : "tanker");
export const isCleanTanker = (slug: string) => CLEAN.has(slug);
export const isClassSlug = (v: unknown): v is ClassSlug =>
  typeof v === "string" && (CLASS_SLUGS as readonly string[]).includes(v);

/** The three legs: ballast (open position → load port), laden, optional return ballast. */
export const LEGS = ["ballast", "laden", "ret"] as const;
export type LegKey = (typeof LEGS)[number];

/** The two port calls. */
export const CALLS = ["load", "discharge"] as const;
export type CallKey = (typeof CALLS)[number];

/** Ports a voyage names: where the ship opens, loads, discharges and (optionally) returns to. */
export const PORT_ROLES = ["open", "load", "discharge", "ret"] as const;
export type PortRole = (typeof PORT_ROLES)[number];

/** A port typed in by hand (not in the table): its distances are entered manually. */
export const OTHER_PORT = "x";

/** How freight is agreed — or, in reverse mode, the TCE the freight has to earn. */
export const FREIGHT_BASES = ["rate", "lump", "ws", "tce"] as const;
export type FreightBasis = (typeof FREIGHT_BASES)[number];

/** EU ETS scope: from the ports (Auto) or a fixed share of the voyage's emissions. */
export const ETS_SCOPES = ["auto", "0", "50", "100"] as const;
export type EtsScope = (typeof ETS_SCOPES)[number];

/** Port time: entered as days, or worked out from quantity ÷ rate + allowance hours. */
export const CALL_MODES = ["days", "rate"] as const;
export type CallMode = (typeof CALL_MODES)[number];

/** Regions that group the port pickers. */
export const PORT_REGIONS = [
  "black-sea",
  "east-med",
  "central-west-med",
  "nw-europe",
  "americas",
  "red-sea-gulf",
  "asia",
] as const;
export type PortRegion = (typeof PORT_REGIONS)[number];

export const PORT_REGION_LABELS: Record<PortRegion, string> = {
  "black-sea": "Black Sea",
  "east-med": "Türkiye & East Med",
  "central-west-med": "Central & West Med",
  "nw-europe": "NW Europe",
  americas: "Americas",
  "red-sea-gulf": "Red Sea & Gulf",
  asia: "Asia",
};

/**
 * Canals a class cannot use — dimensions, not markets: a laden VLCC is too deep for Suez
 * (it lightens through SUMED or sails round the Cape) and no VLCC fits the Neopanamax
 * locks; a laden Suezmax is too deep for Panama. The calculator's default route avoids
 * them and the route picker says why.
 */
export const CANAL_LIMITS: Partial<Record<ClassSlug, { laden: string[]; ballast: string[] }>> = {
  vlcc: { laden: ["suez", "panama"], ballast: ["panama"] },
  suezmax: { laden: ["panama"], ballast: [] },
};

/** Sensitivity steps (±10 / 20 %) for freight and bunker prices. */
export const SENSITIVITY_STEPS = [-0.2, -0.1, 0, 0.1, 0.2] as const;
