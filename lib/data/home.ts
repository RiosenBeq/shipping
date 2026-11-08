/**
 * The homepage copy (DESIGN-V2 §7, §13): edited in the admin (/keystatic →
 * Pages → Homepage), stored in content/home.json, checked by homeFileSchema
 * (lib/content/home-schema.ts) in the content tests and at build time. The
 * localized homepages take their copy from lib/i18n.ts, and their section
 * order and visibility from here.
 *
 * The file holds the hero and a sortable list of section blocks
 * (`{ discriminant: "who", value: {…} }`): the list's order is the page's
 * order; a block switched off (`show: false`) or removed is not rendered.
 */
import file from "@/content/home.json";
import type { HomeBlock, HomeFile } from "@/lib/content/home-schema";
import { HOME_BLOCK_KINDS, type HomeBlockKind } from "@/lib/content/options";

export const HOME: HomeFile = file as HomeFile;

/** A block's content by kind. */
export type HomeBlockValue<K extends HomeBlockKind> = Extract<
  HomeBlock,
  { discriminant: K }
>["value"];

/**
 * The section blocks in the editor's order: unknown kinds and repeats are
 * dropped (the schema rejects both; this keeps a half-edited file renderable).
 */
export function homeBlocks(h: HomeFile = HOME): HomeBlock[] {
  const seen = new Set<string>();
  return (h.sections ?? []).filter((b) => {
    if (!(HOME_BLOCK_KINDS as readonly string[]).includes(b.discriminant)) return false;
    if (seen.has(b.discriminant)) return false;
    seen.add(b.discriminant);
    return true;
  });
}

/** One section's content, or undefined when the editor removed the block. */
export function homeBlock<K extends HomeBlockKind>(
  kind: K,
  h: HomeFile = HOME
): HomeBlockValue<K> | undefined {
  const b = homeBlocks(h).find((x) => x.discriminant === kind);
  return b ? (b.value as HomeBlockValue<K>) : undefined;
}

/** The sections the page shows after the hero, in order (switched-off blocks left out). */
export function homeOrder(h: HomeFile = HOME): HomeBlockKind[] {
  return homeBlocks(h)
    .filter((b) => b.value.show)
    .map((b) => b.discriminant);
}
