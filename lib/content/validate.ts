/**
 * Checks every file in content/ against its zod schema, plus the rules that
 * span files (unique slugs, research authors that exist, the Hormuz brief that
 * route tables link to). Run by the content tests and, through
 * assertValidContent(), at build time from app/sitemap.ts — so an admin edit
 * that would break a page fails the Vercel build and the live site stays as it
 * was. Server and test code only: it pulls in zod.
 */
import type { ZodType } from "zod";
import site from "@/content/site.json";
import brokers from "@/content/brokers.json";
import research from "@/content/research.json";
import faqs from "@/content/faqs.json";
import glossary from "@/content/glossary.json";
import tankerClasses from "@/content/tanker-classes.json";
import lpgClasses from "@/content/lpg-classes.json";
import lpgCargoes from "@/content/lpg-cargoes.json";
import compliance from "@/content/compliance.json";
import turkishStraits from "@/content/turkish-straits.json";
import { HORMUZ_NOTE_SLUG } from "./options";
import {
  brokersFileSchema,
  complianceFileSchema,
  faqsFileSchema,
  glossaryFileSchema,
  lpgCargoesFileSchema,
  lpgClassesFileSchema,
  researchFileSchema,
  siteFileSchema,
  tankerClassesFileSchema,
  turkishStraitsFileSchema,
  type BrokersFile,
  type LpgCargoesFile,
  type LpgClassesFile,
  type ResearchFile,
  type TankerClassesFile,
  type TurkishStraitsFile,
} from "./schemas";

/** Every content file: its path in the repo, its data and its schema. */
export const CONTENT_FILES = [
  { name: "site", path: "content/site.json", data: site, schema: siteFileSchema },
  { name: "brokers", path: "content/brokers.json", data: brokers, schema: brokersFileSchema },
  { name: "research", path: "content/research.json", data: research, schema: researchFileSchema },
  { name: "faqs", path: "content/faqs.json", data: faqs, schema: faqsFileSchema },
  { name: "glossary", path: "content/glossary.json", data: glossary, schema: glossaryFileSchema },
  {
    name: "tankerClasses",
    path: "content/tanker-classes.json",
    data: tankerClasses,
    schema: tankerClassesFileSchema,
  },
  {
    name: "lpgClasses",
    path: "content/lpg-classes.json",
    data: lpgClasses,
    schema: lpgClassesFileSchema,
  },
  {
    name: "lpgCargoes",
    path: "content/lpg-cargoes.json",
    data: lpgCargoes,
    schema: lpgCargoesFileSchema,
  },
  {
    name: "compliance",
    path: "content/compliance.json",
    data: compliance,
    schema: complianceFileSchema,
  },
  {
    name: "turkishStraits",
    path: "content/turkish-straits.json",
    data: turkishStraits,
    schema: turkishStraitsFileSchema,
  },
] as const satisfies readonly { name: string; path: string; data: unknown; schema: ZodType }[];

function duplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const dups = new Set<string>();
  for (const v of values) (seen.has(v) ? dups : seen).add(v);
  return [...dups];
}

/** Every problem found, as "content/<file>: <path>: <message>" lines. Empty when valid. */
export function validateContent(): string[] {
  const issues: string[] = [];

  for (const f of CONTENT_FILES) {
    const result = f.schema.safeParse(f.data);
    if (!result.success) {
      for (const issue of result.error.issues) {
        issues.push(`${f.path}: ${issue.path.join(".") || "(root)"}: ${issue.message}`);
      }
    }
  }
  // Cross-file rules need well-formed files.
  if (issues.length) return issues;

  const b = brokers as BrokersFile;
  const r = research as ResearchFile;
  const unique = (path: string, what: string, values: string[]) => {
    for (const d of duplicates(values)) issues.push(`${path}: duplicate ${what} "${d}"`);
  };

  unique(
    "content/brokers.json",
    "broker name",
    b.brokers.map((x) => x.name.name)
  );
  unique(
    "content/brokers.json",
    "broker short id",
    b.brokers.map((x) => x.name.slug)
  );
  unique(
    "content/research.json",
    "note slug",
    r.notes.map((n) => n.slug)
  );
  unique(
    "content/tanker-classes.json",
    "class slug",
    (tankerClasses as TankerClassesFile).classes.map((c) => c.slug)
  );
  unique(
    "content/lpg-classes.json",
    "class slug",
    (lpgClasses as LpgClassesFile).classes.map((c) => c.slug)
  );
  unique(
    "content/lpg-cargoes.json",
    "cargo key",
    (lpgCargoes as LpgCargoesFile).cargoes.map((c) => c.key)
  );
  unique(
    "content/turkish-straits.json",
    "section id",
    (turkishStraits as TurkishStraitsFile).sections.map((s) => s.id)
  );

  const names = new Set(b.brokers.map((x) => x.name.name));
  for (const n of r.notes) {
    if (!names.has(n.author)) {
      issues.push(
        `content/research.json: note "${n.slug}": author "${n.author}" is not on the Brokers list`
      );
    }
    if (n.updated && n.updated < n.date) {
      issues.push(`content/research.json: note "${n.slug}": revised before it was published`);
    }
  }
  if (!r.notes.some((n) => n.slug === HORMUZ_NOTE_SLUG)) {
    issues.push(
      `content/research.json: the Strait of Hormuz note "${HORMUZ_NOTE_SLUG}" is linked from route tables and /compliance; restore it or update HORMUZ_NOTE_SLUG in lib/content/options.ts`
    );
  }

  return issues;
}

/** Throws one readable error listing every problem (used at build time). */
export function assertValidContent(): void {
  const issues = validateContent();
  if (issues.length) {
    throw new Error(
      `Invalid content (edit it in /keystatic or fix the JSON; see docs/CMS.md):\n- ${issues.join("\n- ")}`
    );
  }
}
