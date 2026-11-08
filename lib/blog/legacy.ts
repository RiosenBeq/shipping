/**
 * The research notes as they were stored before the blog (the `research`
 * singleton, content/research.json, removed in November 2026), and the
 * one-off conversion of a note into a blog post file (content/blog/<slug>.mdoc).
 *
 * Kept for the migration script (scripts/migrate-research-to-blog.ts) and for
 * the test that proves every post says exactly what its note said
 * (lib/blog/blog.test.ts, against lib/blog/__fixtures__/research-legacy.json).
 */
import Markdoc from "@markdoc/markdoc";
import { dump } from "js-yaml";
import type { BlogCategory } from "@/lib/content/options";

export type LegacyBlock =
  | { discriminant: "p" | "h2"; value: string }
  | { discriminant: "ul" | "ol"; value: string[] }
  | {
      discriminant: "callout";
      value: { label: string; text: string; linkHref?: string; linkLabel?: string };
    }
  | {
      discriminant: "table";
      value: {
        caption: string;
        head: (string | null)[];
        rows: { cells: (string | null)[] }[];
      };
    };

export type LegacyNote = {
  slug: string;
  title: string;
  seoTitle?: string;
  desc: string;
  desk: "tankers" | "lpg";
  cat: "weekly" | "route" | "reg" | "guide";
  catLabel: string;
  iss: string;
  date: string;
  updated?: string;
  author: string;
  read: number;
  gated: boolean;
  label: string;
  dek: string;
  summary?: string;
  blocks: LegacyBlock[];
};

export type LegacyFile = { notes: LegacyNote[] };

/**
 * A note's body as plain text, exactly as the research pages produced it
 * (lib/data/research-bodies.ts → bodyText) for llms-full.txt and RSS.
 */
export function legacyBodyText(note: LegacyNote): string {
  const parts: string[] = [];
  if (note.summary) parts.push(note.summary);
  for (const b of note.blocks) {
    switch (b.discriminant) {
      case "p":
        parts.push(b.value);
        break;
      case "h2":
        parts.push(`## ${b.value}`);
        break;
      case "ul":
        parts.push(b.value.map((i) => `- ${i}`).join("\n"));
        break;
      case "ol":
        parts.push(b.value.map((item, i) => `${i + 1}. ${item}`).join("\n"));
        break;
      case "callout":
        parts.push(`${b.value.label}: ${b.value.text}`);
        break;
      case "table": {
        const head = b.value.head.map((c) => c ?? "");
        const rows = b.value.rows.map((r) => r.cells.map((c) => c ?? ""));
        parts.push(
          [
            b.value.caption,
            `| ${head.join(" | ")} |`,
            `| ${head.map(() => "---").join(" | ")} |`,
            ...rows.map((r) => `| ${r.join(" | ")} |`),
          ].join("\n")
        );
        break;
      }
    }
  }
  return parts.join("\n\n");
}

/** The old filter keys → blog categories (docs/DESIGN-V2 §11). */
export const LEGACY_CATEGORY: Record<LegacyNote["cat"], BlogCategory> = {
  guide: "chartering-guides",
  route: "route-guides",
  reg: "risk-and-regulation",
  weekly: "market-notes",
};

/** Internal links move with the notes: /research/<slug> → /blog/<slug>. */
export const migrateHref = (href: string) => href.replace(/^\/research(?=\/|$)/, "/blog");

/** Codes that keep their capitals when a card tag is sentence-cased. */
const CODES = new Set(["LPG", "VLGC", "MGC", "VLCC", "COA", "TCE", "EU", "ETS", "CPC", "G7"]);

/** "WAR RISK" → "War risk", "LPG" → "LPG", "TD20 / TD6" → "TD20 / TD6". */
export function tagCase(tag: string): string {
  const words = tag
    .trim()
    .split(/\s+/)
    .map((w) => (CODES.has(w) || /\d/.test(w) || !/[A-Z]/.test(w) ? w : w.toLowerCase()));
  const out = words.join(" ");
  return out.charAt(0).toUpperCase() + out.slice(1);
}

/** "Risk Brief" → "Risk brief". */
const sentenceCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

/** "OCTOBER 2026" → "October 2026"; "BRIEF" → "Brief"; "18 / 2026" stays. */
const titleCase = (s: string) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());

/** Markdoc attribute value (double-quoted string). */
const attr = (s: string) => JSON.stringify(s);

function blockSource(b: LegacyBlock): string {
  switch (b.discriminant) {
    case "p":
      return b.value;
    case "h2":
      return `## ${b.value}`;
    case "ul":
      return b.value.map((i) => `- ${i}`).join("\n");
    case "ol":
      return b.value.map((item, i) => `${i + 1}. ${item}`).join("\n");
    case "callout": {
      const { label, text, linkHref, linkLabel } = b.value;
      const link =
        linkHref && linkLabel
          ? ` linkHref=${attr(migrateHref(linkHref))} linkLabel=${attr(linkLabel)}`
          : "";
      return `{% callout label=${attr(label)}${link} %}\n${text}\n{% /callout %}`;
    }
    case "table": {
      const row = (cells: (string | null)[]) => cells.map((c) => `* ${c ?? ""}`).join("\n");
      return [
        `{% routeTable caption=${attr(b.value.caption)} %}`,
        "{% table %}",
        row(b.value.head),
        ...b.value.rows.flatMap((r) => ["---", row(r.cells)]),
        "{% /table %}",
        "{% /routeTable %}",
      ].join("\n");
    }
  }
}

/** A note's body as a Markdoc document, in the canonical form Keystatic writes. */
export function legacyBodySource(note: LegacyNote): string {
  return Markdoc.format(Markdoc.parse(note.blocks.map(blockSource).join("\n\n")));
}

/** Editorial fields the notes never had: the type-set cover and the takeaways box. */
export type Editorial = {
  cover: { code: string; caption?: string };
  keyTakeaways: string[];
};

/**
 * One note as a post file: YAML frontmatter in the field order of the
 * Keystatic `posts` schema (empty optional text left out, as Keystatic does),
 * then the Markdoc body. `authorId` is the broker's short id.
 */
export function legacyNoteToPostFile(
  note: LegacyNote,
  authorId: string,
  editorial: Editorial
): string {
  const frontmatter: Record<string, unknown> = {
    title: note.title,
    draft: false,
    ...(note.seoTitle ? { seoTitle: note.seoTitle } : {}),
    description: note.desc,
    dek: note.dek,
    category: LEGACY_CATEGORY[note.cat],
    format: sentenceCase(note.catLabel),
    desk: note.desk,
    author: authorId,
    date: note.date,
    ...(note.updated ? { updated: note.updated } : {}),
    issue: titleCase(note.iss),
    tags: note.label
      .split("·")
      .map((t) => t.trim())
      .filter(Boolean)
      .map(tagCase),
    readingTime: note.read,
    gated: note.gated,
    ...(note.summary ? { summary: note.summary } : {}),
    keyTakeaways: editorial.keyTakeaways,
    cover: {
      discriminant: "type",
      value: {
        code: editorial.cover.code,
        ...(editorial.cover.caption ? { caption: editorial.cover.caption } : {}),
      },
    },
    faq: [],
  };
  return `---\n${dumpFrontmatter(frontmatter)}---\n${legacyBodySource(note)}`;
}

/**
 * YAML frontmatter exactly as Keystatic writes it: js-yaml's dump, except
 * that date fields are plain (`date: 2026-10-16`, not quoted), which is how
 * the admin saves them.
 */
export function dumpFrontmatter(data: Record<string, unknown>): string {
  return dump(data).replace(/^(\s*\w+): '(\d{4}-\d{2}-\d{2})'$/gm, "$1: $2");
}
