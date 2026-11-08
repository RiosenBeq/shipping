/**
 * Per-class deep-dive data for /tankers/[class]. Edited in the admin
 * (/keystatic → Tanker classes), stored in content/tanker-classes.json.
 */
import file from "@/content/tanker-classes.json";
import type { TankerClassesFile } from "@/lib/content/schemas";
import { toRoute } from "@/lib/content/format";

export type TankerClassData = {
  slug: string;
  name: string;
  shortName: string;
  /** Indefinite article for `shortName` ("an Aframax", "an MR", "a VLCC"). */
  article: "a" | "an";
  /** Plural of `shortName` ("Suezmaxes", "LR1s"). */
  plural: string;
  longName: string;
  family: "crude" | "clean";
  dwtRange: string;
  cargoCapacity: string;
  loa: string;
  beam: string;
  draft: string;
  speed: string;
  consumption: string;
  intro: string;
  /** `hormuz`: loads in the Middle East Gulf, so it depends on Strait of Hormuz transit. */
  routes: { code: string; lane: string; note: string; hormuz?: boolean }[];
  marketsServed: string[];
  keyTrends: { title: string; body: string }[];
  charterShape: string;
  desk: string;
};

export const TANKER_CLASSES: TankerClassData[] = (file as TankerClassesFile).classes.map((c) => ({
  ...c,
  routes: c.routes.map(toRoute),
}));

export function getTankerClassBySlug(slug: string): TankerClassData | undefined {
  return TANKER_CLASSES.find((t) => t.slug === slug);
}
