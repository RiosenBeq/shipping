/**
 * Chartering glossary — extended version of the Reference tab list,
 * grouped by topic for the dedicated /glossary page. Edited in the admin
 * (/keystatic → Glossary), stored in content/glossary.json.
 */
import file from "@/content/glossary.json";
import type { GlossaryFile } from "@/lib/content/schemas";
import type { GLOSSARY_GROUP_KEYS } from "@/lib/content/options";

export type GlossaryTerm = {
  term: string;
  def: string;
  group: (typeof GLOSSARY_GROUP_KEYS)[number];
};

const data = file as GlossaryFile;

export const GLOSSARY_TERMS: GlossaryTerm[] = data.terms;

export const GROUP_LABELS: Record<GlossaryTerm["group"], string> = data.groups;
