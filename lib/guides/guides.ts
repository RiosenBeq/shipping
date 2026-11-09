/**
 * Guides: content/guides/<slug>.mdoc, edited in the admin (/keystatic →
 * Guides). Each file is YAML frontmatter (lib/guides/schema.ts) and a Markdoc
 * body with the same components as blog posts (callout, table, figure, pull
 * quote). Server only: read once per build, again on a dev server when a file
 * changes. lib/guides/validate.ts checks the files at build time.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import type { Node } from "@markdoc/markdoc";
import { load } from "js-yaml";
import { getAuthor } from "@/lib/blog/posts";
import type { AuthorData } from "@/lib/blog/meta";
import {
  assignHeadingIds,
  bodyText,
  parseMarkdoc,
  wordCount,
  type Heading,
} from "@/lib/blog/markdoc";
import type { GuideFrontmatter } from "./schema";
import {
  GUIDES_DIR,
  guidePath,
  type GuideDesk,
  type GuideKind,
  type GuideLang,
  type GuideSegment,
} from "./meta";

const ABS_DIR = path.join(process.cwd(), GUIDES_DIR);

export type Guide = {
  slug: string;
  href: string;
  title: string;
  seoTitle?: string;
  description: string;
  dek: string;
  query: string;
  keywords: string[];
  kind: GuideKind;
  lang: GuideLang;
  /** Slug of the same page in the other language, when one exists (either file may name it). */
  translation?: string;
  desk: GuideDesk;
  segment: GuideSegment;
  author?: AuthorData;
  authorId: string;
  published: string;
  updated: string;
  linkFrom: string[];
  related: string[];
  faq: { q: string; a: string }[];
  ctaTitle?: string;
  ctaText?: string;
  draft: boolean;
  file: string;
  ast: Node;
  headings: Heading[];
  /** Plain text of the body (llms-full.txt, word counts, JSON-LD wordCount). */
  text: string;
  words: number;
  readingTime: number;
};

/** YAML reads plain dates as Date objects; the site works with "YYYY-MM-DD" strings. */
function datesToStrings(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (Array.isArray(value)) return value.map(datesToStrings);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, datesToStrings(v)]));
  }
  return value;
}

export function parseGuideFile(source: string): { data: GuideFrontmatter; ast: Node } {
  const ast = parseMarkdoc(source);
  const raw = typeof ast.attributes.frontmatter === "string" ? ast.attributes.frontmatter : "";
  return { data: datesToStrings(load(raw) ?? {}) as GuideFrontmatter, ast };
}

export function buildGuide(
  slug: string,
  source: string,
  file = `${GUIDES_DIR}/${slug}.mdoc`
): Guide {
  const { data, ast } = parseGuideFile(source);
  const headings = assignHeadingIds(ast);
  const text = bodyText(ast);
  const words = wordCount(text);
  const author = getAuthor(data.author);
  return {
    slug,
    href: guidePath(slug),
    title: data.title,
    ...(data.seoTitle ? { seoTitle: data.seoTitle } : {}),
    description: data.description,
    dek: data.dek,
    query: data.query,
    keywords: data.keywords ?? [],
    kind: data.kind,
    lang: data.lang,
    ...(data.translation ? { translation: data.translation } : {}),
    desk: data.desk,
    segment: data.segment ?? "any",
    ...(author ? { author } : {}),
    authorId: data.author,
    published: data.published,
    updated: data.updated,
    linkFrom: data.linkFrom ?? [],
    related: (data.related ?? []).filter(Boolean),
    faq: data.faq ?? [],
    ...(data.ctaTitle ? { ctaTitle: data.ctaTitle } : {}),
    ...(data.ctaText ? { ctaText: data.ctaText } : {}),
    draft: Boolean(data.draft),
    file,
    ast,
    headings,
    text,
    words,
    readingTime: Math.max(1, Math.round(words / 220)),
  };
}

const SHOW_DRAFTS = process.env.NODE_ENV === "development";
let cache: { key: string; guides: Guide[] } | undefined;

function readAll(names: string[]): Guide[] {
  const guides: Guide[] = [];
  for (const n of names) {
    try {
      guides.push(buildGuide(n.slice(0, -5), readFileSync(path.join(ABS_DIR, n), "utf8")));
    } catch (e) {
      const message = `${GUIDES_DIR}/${n}: ${(e as Error).message}`;
      if (process.env.NODE_ENV === "production") throw new Error(message);
      console.error(`[guides] skipped ${message}`);
    }
  }
  return guides;
}

/** Every guide file, drafts included (validation, tests); English first, then by title. */
export function getAllGuides(): Guide[] {
  if (cache && process.env.NODE_ENV === "production") return cache.guides;
  let names: string[];
  try {
    names = readdirSync(ABS_DIR)
      .filter((n) => n.endsWith(".mdoc"))
      .sort();
  } catch {
    return [];
  }
  const key = names
    .map((n) => {
      try {
        return `${n}:${statSync(path.join(ABS_DIR, n)).mtimeMs}`;
      } catch {
        return n;
      }
    })
    .join("|");
  if (cache?.key !== key) cache = { key, guides: readAll(names) };
  return cache.guides;
}

/** Published guides (drafts only on a development server). */
export function getGuides(): Guide[] {
  return getAllGuides().filter((g) => SHOW_DRAFTS || !g.draft);
}

export function getGuide(slug: string): Guide | undefined {
  return getGuides().find((g) => g.slug === slug);
}

/** Landing pages first, then guides; each group in file order. */
export function guidesIn(lang: GuideLang): Guide[] {
  const list = getGuides().filter((g) => g.lang === lang);
  return [...list.filter((g) => g.kind === "landing"), ...list.filter((g) => g.kind === "guide")];
}

/**
 * The same page in the other language: named by this file or by the other
 * one (a pair needs the link on one side only). Never a page in its own language.
 */
export function translationOf(guide: Guide): Guide | undefined {
  const all = getGuides();
  const named = guide.translation ? all.find((g) => g.slug === guide.translation) : undefined;
  const other = named ?? all.find((g) => g.translation === guide.slug);
  return other && other.lang !== guide.lang ? other : undefined;
}

/** hreflang alternates for a page with a translation (x-default is the English page). */
export function guideLanguages(guide: Guide): Record<string, string> | undefined {
  const other = translationOf(guide);
  if (!other) return undefined;
  return { [guide.lang]: guide.href, [other.lang]: other.href };
}

/** Related guides: the ones the file names, then same desk and language, never itself. */
export function relatedGuides(guide: Guide, n = 3): Guide[] {
  const all = getGuides().filter((g) => g.slug !== guide.slug);
  const named = guide.related
    .map((s) => all.find((g) => g.slug === s))
    .filter((g): g is Guide => Boolean(g));
  const rest = all
    .filter((g) => !named.includes(g))
    .sort(
      (a, b) =>
        Number(b.lang === guide.lang) - Number(a.lang === guide.lang) ||
        Number(b.desk === guide.desk) - Number(a.desk === guide.desk)
    );
  return [...named, ...rest].slice(0, n);
}

/** Contextual links to guides for an existing page (the guides whose linkFrom names it). */
export function guideLinksFor(
  pagePath: string
): { href: string; label: string; lang: GuideLang }[] {
  return getGuides()
    .filter((g) => g.linkFrom.includes(pagePath))
    .map((g) => ({ href: g.href, label: g.title, lang: g.lang }));
}

/** The newest "last reviewed" date across the guides (the hub's lastmod). */
export function guidesUpdated(): string {
  return getGuides().reduce((max, g) => (g.updated > max ? g.updated : max), "");
}
