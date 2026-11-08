/**
 * Checks every file in content/ against its zod schema — the JSON singletons
 * and the blog posts (content/blog/*.mdoc: frontmatter and Markdoc body) —
 * plus the rules that span files (unique slugs, post authors that exist, the
 * Hormuz post that route tables link to, uploaded images that exist). Run by
 * the content tests and, through
 * assertValidContent(), at build time from app/sitemap.ts — so an admin edit
 * that would break a page fails the Vercel build and the live site stays as it
 * was. Server and test code only: it pulls in zod.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { ZodType } from "zod";
import site from "@/content/site.json";
import home from "@/content/home.json";
import brokers from "@/content/brokers.json";
import faqs from "@/content/faqs.json";
import glossary from "@/content/glossary.json";
import tankerClasses from "@/content/tanker-classes.json";
import lpgClasses from "@/content/lpg-classes.json";
import lpgCargoes from "@/content/lpg-cargoes.json";
import compliance from "@/content/compliance.json";
import turkishStraits from "@/content/turkish-straits.json";
import { parsePostFile, POSTS_DIR } from "@/lib/blog/posts";
import { bodyImages, validateBody } from "@/lib/blog/markdoc";
import { BLOG_CATEGORIES, BLOG_RESERVED_SLUGS, HORMUZ_NOTE_SLUG, SLUG_PATTERN } from "./options";
import {
  brokersFileSchema,
  complianceFileSchema,
  faqsFileSchema,
  glossaryFileSchema,
  homeFileSchema,
  lpgCargoesFileSchema,
  lpgClassesFileSchema,
  postFrontmatterSchema,
  siteFileSchema,
  tankerClassesFileSchema,
  turkishStraitsFileSchema,
  type BrokersFile,
  type HomeFile,
  type LpgCargoesFile,
  type LpgClassesFile,
  type TankerClassesFile,
  type TurkishStraitsFile,
} from "./schemas";

/** Every content file: its path in the repo, its data and its schema. */
export const CONTENT_FILES = [
  { name: "site", path: "content/site.json", data: site, schema: siteFileSchema },
  { name: "home", path: "content/home.json", data: home, schema: homeFileSchema },
  { name: "brokers", path: "content/brokers.json", data: brokers, schema: brokersFileSchema },
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

  issues.push(...validatePosts(b));
  issues.push(...validateHomeLinks(home as HomeFile));

  return issues;
}

/** Pages that exist outside the blog and the class guides (the homepage may link to them). */
const STATIC_ROUTES = new Set([
  "/",
  "/tankers",
  "/lpg",
  "/turkish-straits",
  "/brokers",
  "/blog",
  "/about",
  "/contact",
  "/compliance",
  "/glossary",
  "/privacy",
  "/terms",
]);

/** Every link on the homepage goes to a page that exists: a route, a class guide or a post. */
export function validateHomeLinks(h: HomeFile): string[] {
  const posts = new Set(postSources().map((p) => p.slug));
  const tankers = new Set((tankerClasses as TankerClassesFile).classes.map((c) => c.slug));
  const gas = new Set((lpgClasses as LpgClassesFile).classes.map((c) => c.slug));
  const exists = (href: string) => {
    const p = href.split("#")[0].replace(/\/$/, "") || "/";
    if (STATIC_ROUTES.has(p)) return true;
    const [, a, b, c] = p.split("/");
    if (a === "blog" && b === "category") return (BLOG_CATEGORIES as readonly string[]).includes(c);
    if (a === "blog") return Boolean(b) && !c && posts.has(b);
    if (a === "tankers") return !c && tankers.has(b);
    if (a === "lpg") return !c && gas.has(b);
    return false;
  };
  const links: [string, string][] = [
    ...h.who.facts.map((f, i) => [`who.facts.${i}.href`, f.href] as [string, string]),
    ...h.desks.rows.map((r, i) => [`desks.rows.${i}.href`, r.href] as [string, string]),
    ...h.reach.lanes.map((l, i) => [`reach.lanes.${i}.href`, l.href] as [string, string]),
  ];
  return links
    .filter(([, href]) => !exists(href))
    .map(([where, href]) => `content/home.json: ${where}: no page at ${href}`);
}

/** The post files in content/blog/, as [repository path, slug, source] (sorted). */
export function postSources(): { file: string; slug: string; source: string }[] {
  const dir = path.join(process.cwd(), POSTS_DIR);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => n.endsWith(".mdoc"))
    .sort()
    .map((n) => ({
      file: `${POSTS_DIR}/${n}`,
      slug: n.slice(0, -".mdoc".length),
      source: readFileSync(path.join(dir, n), "utf8"),
    }));
}

/** Blog post checks: frontmatter schema, Markdoc body, slug, author, dates, images. */
export function validatePosts(b: BrokersFile = brokers as BrokersFile): string[] {
  const issues: string[] = [];
  const authors = new Set(b.brokers.map((x) => x.name.slug));
  const publicFile = (src: string) => existsSync(path.join(process.cwd(), "public", src));
  const sources = postSources();

  for (const { file, slug, source } of sources) {
    if (!SLUG_PATTERN.test(slug)) {
      issues.push(`${file}: the file name (the URL slug) must be lowercase letters, digits and hyphens`);
    }
    if ((BLOG_RESERVED_SLUGS as readonly string[]).includes(slug)) {
      issues.push(`${file}: "${slug}" is a /blog route of its own; choose another slug`);
    }
    let parsed: ReturnType<typeof parsePostFile>;
    try {
      parsed = parsePostFile(source);
    } catch (e) {
      issues.push(`${file}: unreadable frontmatter (${(e as Error).message.split("\n")[0]})`);
      continue;
    }
    const result = postFrontmatterSchema.safeParse(parsed.data);
    if (!result.success) {
      for (const issue of result.error.issues) {
        issues.push(`${file}: ${issue.path.join(".") || "(frontmatter)"}: ${issue.message}`);
      }
      continue;
    }
    const post = result.data;
    for (const e of validateBody(parsed.ast)) {
      issues.push(`${file}: line ${(e.lines[0] ?? 0) + 1}: ${e.error.message}`);
    }
    if (!authors.has(post.author)) {
      issues.push(`${file}: author "${post.author}" is not on the Brokers list`);
    }
    if (post.updated && post.updated < post.date) {
      issues.push(`${file}: "updated" (${post.updated}) is before the publication date`);
    }
    const images = [
      ...bodyImages(parsed.ast),
      ...(post.cover.discriminant === "still" && post.cover.value.image ? [post.cover.value.image] : []),
    ];
    for (const src of images) {
      if (src.startsWith("/") && !publicFile(src)) {
        issues.push(`${file}: image ${src} is missing from public/`);
      }
    }
  }

  if (!sources.some((s) => s.slug === HORMUZ_NOTE_SLUG)) {
    issues.push(
      `content/blog: the Strait of Hormuz post "${HORMUZ_NOTE_SLUG}" is linked from route tables and /compliance; restore it or update HORMUZ_NOTE_SLUG in lib/content/options.ts`
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
