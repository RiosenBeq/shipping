/**
 * Build-time checks for content/guides/*.mdoc (called from app/sitemap.ts and
 * the content tests): the frontmatter schema, the Markdoc body, the slug, the
 * author, the dates, translations, related guides and every internal link.
 * An admin edit that breaks a rule fails the build instead of reaching the
 * live site.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import brokers from "@/content/brokers.json";
import { PAGES } from "@/lib/pages";
import { SLUG_PATTERN } from "@/lib/content/options";
import { bodyImages, bodyLinks, validateBody } from "@/lib/blog/markdoc";
import { getAllPosts } from "@/lib/blog/posts";
import { BLOG_CATEGORIES } from "@/lib/blog/meta";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { LPG_CLASSES } from "@/lib/data/lpg-classes";
import { LOCALES } from "@/lib/i18n";
import { GUIDE_RESERVED_SLUGS, GUIDES_DIR, GUIDES_PATH } from "./meta";
import { guideFrontmatterSchema, type GuideFrontmatter } from "./schema";
import { parseGuideFile } from "./guides";

export function guideSources(): { file: string; slug: string; source: string }[] {
  const dir = path.join(process.cwd(), GUIDES_DIR);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => n.endsWith(".mdoc"))
    .sort()
    .map((n) => ({
      file: `${GUIDES_DIR}/${n}`,
      slug: n.slice(0, -".mdoc".length),
      source: readFileSync(path.join(dir, n), "utf8"),
    }));
}

/** Every public path an internal link may point at (anchors and queries stripped). */
function knownPaths(guideSlugs: string[]): Set<string> {
  return new Set([
    ...PAGES.map((p) => p.path),
    GUIDES_PATH,
    ...guideSlugs.map((s) => `${GUIDES_PATH}/${s}`),
    ...TANKER_CLASSES.map((t) => `/tankers/${t.slug}`),
    ...LPG_CLASSES.map((c) => `/lpg/${c.slug}`),
    ...getAllPosts().map((p) => p.href),
    ...BLOG_CATEGORIES.map((c) => `/blog/category/${c}`),
    ...LOCALES.map((l) => `/${l.code}`),
  ]);
}

export function validateGuides(): string[] {
  const issues: string[] = [];
  const authors = new Set(brokers.brokers.map((b) => b.name.slug));
  const sources = guideSources();
  const known = knownPaths(sources.map((s) => s.slug));
  const parsed = new Map<string, GuideFrontmatter>();
  const titles = new Map<string, string>();

  for (const { file, slug, source } of sources) {
    if (!SLUG_PATTERN.test(slug)) {
      issues.push(
        `${file}: the file name (the URL slug) must be lowercase letters, digits and hyphens`
      );
    }
    if ((GUIDE_RESERVED_SLUGS as readonly string[]).includes(slug)) {
      issues.push(`${file}: "${slug}" is reserved; choose another slug`);
    }
    let result: ReturnType<typeof parseGuideFile>;
    try {
      result = parseGuideFile(source);
    } catch (e) {
      issues.push(`${file}: unreadable frontmatter (${(e as Error).message.split("\n")[0]})`);
      continue;
    }
    const checked = guideFrontmatterSchema.safeParse(result.data);
    if (!checked.success) {
      for (const issue of checked.error.issues) {
        issues.push(`${file}: ${issue.path.join(".") || "(frontmatter)"}: ${issue.message}`);
      }
      continue;
    }
    const g = checked.data;
    parsed.set(slug, g);
    for (const e of validateBody(result.ast)) {
      issues.push(`${file}: line ${(e.lines[0] ?? 0) + 1}: ${e.error.message}`);
    }
    if (!authors.has(g.author))
      issues.push(`${file}: author "${g.author}" is not on the Brokers list`);
    if (g.updated < g.published) {
      issues.push(`${file}: "Last reviewed" (${g.updated}) is before the publication date`);
    }
    const seo = g.seoTitle ?? g.title;
    if (titles.has(seo)) issues.push(`${file}: same search title as ${titles.get(seo)}`);
    titles.set(seo, file);
    for (const href of bodyLinks(result.ast)) {
      if (!href.startsWith("/") || href.startsWith("//")) continue;
      const p = href.split(/[?#]/)[0].replace(/\/$/, "") || "/";
      if (!known.has(p)) issues.push(`${file}: link to ${href}: no such page on this site`);
    }
    for (const src of bodyImages(result.ast)) {
      if (src.startsWith("/") && !existsSync(path.join(process.cwd(), "public", src))) {
        issues.push(`${file}: image ${src} is missing from public/`);
      }
    }
  }

  for (const [slug, g] of parsed) {
    const file = `${GUIDES_DIR}/${slug}.mdoc`;
    // Client decision (Nov 2026): every detailed page is in English.
    if (g.lang !== "en") issues.push(`${file}: guides are published in English only (lang: en)`);
    if (g.translation) {
      const other = parsed.get(g.translation);
      if (!other) issues.push(`${file}: translation "${g.translation}" is not a guide`);
      else if (other.lang === g.lang) {
        issues.push(`${file}: translation "${g.translation}" is in the same language`);
      } else if (other.translation && other.translation !== slug) {
        issues.push(`${file}: "${g.translation}" names a different translation`);
      }
    }
    for (const r of g.related ?? []) {
      if (r === slug) issues.push(`${file}: a guide cannot be related to itself`);
      else if (!parsed.has(r)) issues.push(`${file}: related guide "${r}" does not exist`);
    }
  }
  return issues;
}

/** Throws one readable error listing every problem (used at build time). */
export function assertValidGuides(): void {
  const issues = validateGuides();
  if (issues.length) {
    throw new Error(
      `Invalid guides (edit them in /keystatic → Guides; see docs/CMS.md):\n- ${issues.join("\n- ")}`
    );
  }
}
