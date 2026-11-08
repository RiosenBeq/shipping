/**
 * LPG & ammonia carrier classes for /lpg and /lpg/[class].
 *
 * Size bands follow common industry segmentation (Clarksons-style):
 * VLGC 70k+ cbm, LGC 50–70k, MGC 25–50k, Handy 15–25k, small/coaster < 15k.
 * Figures are typical ranges for orientation, not vessel-specific specs.
 *
 * Edited in the admin (/keystatic → LPG classes, LPG converter cargoes),
 * stored in content/lpg-classes.json and content/lpg-cargoes.json. The
 * converter cargoes are a separate file so the client-side converter does not
 * bundle the class texts.
 */
import classesFile from "@/content/lpg-classes.json";
import cargoesFile from "@/content/lpg-cargoes.json";
import type { LpgCargoesFile, LpgClassesFile } from "@/lib/content/schemas";
import { toRoute } from "@/lib/content/format";

export type LpgClassData = {
  slug: string;
  name: string;
  longName: string;
  /** Noun phrase with its article for running copy: "Looking for an MGC?". */
  ctaNoun: string;
  capacity: string;
  containment: string;
  typicalCargo: string;
  cargoes: string[];
  intro: string;
  /** `hormuz`: loads in the Middle East Gulf, so it depends on Strait of Hormuz transit. */
  routes: { code: string; lane: string; note: string; hormuz?: boolean }[];
  trades: string[];
  watchpoints: { title: string; body: string }[];
  charterShape: string;
  /** Who on the LPG desk covers this size (shown next to charterShape). */
  desk: string;
  faq: { q: string; a: string }[];
};

const classes = (classesFile as LpgClassesFile).classes;

// Pure, so a bundle that only needs LPG_CARGO_DENSITY (the client-side
// converter) can drop the class texts.
export const LPG_CLASSES: LpgClassData[] = /* @__PURE__ */ classes.map((c) => ({
  ...c,
  routes: c.routes.map(toRoute),
}));

export function getLpgClassBySlug(slug: string): LpgClassData | undefined {
  return LPG_CLASSES.find((c) => c.slug === slug);
}

/**
 * Liquid density at atmospheric boiling point (t/m³). Used by the cbm ↔ mt
 * converter on /lpg. Indicative — always use the terminal's figures.
 */
export const LPG_CARGO_DENSITY: readonly {
  readonly key: string;
  readonly label: string;
  readonly density: number;
}[] = (cargoesFile as LpgCargoesFile).cargoes;

/** A converter cargo id ("propane", "ammonia", …); the list is editable. */
export type LpgCargoKey = (typeof LPG_CARGO_DENSITY)[number]["key"];
