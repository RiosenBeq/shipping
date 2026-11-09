/**
 * Blog posts: content/blog/<slug>.mdoc, edited in the admin (/keystatic →
 * Blog posts). Each file is YAML frontmatter (the fields of the Keystatic
 * `posts` collection) and a Markdoc body; the file name is the slug.
 *
 * Server only: the files are read synchronously, once per build (for the
 * static pages, the sitemap, the feeds and llms.txt) and again on a dev
 * server when they change. Client components get posts as props, shaped by
 * toCard() (lib/blog/meta.ts has the types and URL helpers they can import).
 *
 * The frontmatter is checked against its zod schema by the content tests and
 * at build time (lib/content/validate.ts); this loader trusts its shape.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import type { Node } from "@markdoc/markdoc";
import { load } from "js-yaml";
import brokersFile from "@/content/brokers.json";
import type { PostFrontmatter } from "@/lib/content/schemas";
import { BROKERS } from "@/lib/data/brokers";
import { stills, type StillKey } from "@/lib/media";
import {
  CATEGORY_INFO,
  coverImagePath,
  formatPostDate,
  postPath,
  type AuthorData,
  type BlogCategory,
  type BlogDesk,
  type CoverData,
  type PostCardData,
} from "./meta";
import { assignHeadingIds, bodyText, parseMarkdoc, wordCount, type Heading } from "./markdoc";

export const POSTS_DIR = "content/blog";
// A literal path (not POSTS_DIR) so the server file tracer packs only this folder.
const ABS_DIR = path.join(process.cwd(), "content/blog");

export type Post = PostCardData & {
  seoTitle?: string;
  /** Meta description (≤ 160 characters). */
  description: string;
  issue?: string;
  summary?: string;
  keyTakeaways: string[];
  faq: { q: string; a: string }[];
  /** The repository path of the file, e.g. content/blog/td7.mdoc. */
  file: string;
  /** Parsed Markdoc body (headings carry their anchor ids). */
  ast: Node;
  headings: Heading[];
  /** Plain text of the summary and body (feeds, llms-full.txt, word counts). */
  text: string;
  words: number;
};

/* ---------- authors ---------- */

/** Brokers by short id (content/brokers.json lists them in the same order as BROKERS). */
const AUTHORS = new Map<string, AuthorData>(
  brokersFile.brokers.map((b, i) => {
    const broker = BROKERS[i];
    return [
      b.name.slug,
      {
        id: b.name.slug,
        name: broker.name,
        title: broker.title,
        initials: broker.initials,
        color: broker.color,
        ...(broker.photo ? { photo: broker.photo } : {}),
      },
    ];
  })
);

export const getAuthor = (id: string) => AUTHORS.get(id);

/* ---------- parsing ---------- */

/** A stable 1–9999 seed from a slug, for the contour pattern of a type cover. */
export function seedFromSlug(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) h = Math.imul(h ^ slug.charCodeAt(i), 16777619);
  return ((h >>> 0) % 9999) + 1;
}

function coverOf(slug: string, cover: PostFrontmatter["cover"]): CoverData {
  if (cover.discriminant === "type") {
    const seed = cover.value.seed ?? seedFromSlug(slug);
    return {
      kind: "type",
      code: cover.value.code,
      ...(cover.value.caption ? { caption: cover.value.caption } : {}),
      seed,
      src: coverImagePath(slug, seed),
    };
  }
  const { image, media, alt, caption } = cover.value;
  const still = media && media !== "none" ? stills[media as StillKey] : undefined;
  if (image || !still) {
    return { kind: "still", src: image ?? "", alt, ...(caption ? { caption } : {}) };
  }
  return {
    kind: "still",
    src: still.webp,
    avif: still.avif,
    alt,
    width: still.width,
    height: still.height,
    ...(caption ? { caption } : {}),
  };
}

/**
 * YAML reads Keystatic's plain dates (`date: 2026-10-16`) as Date objects;
 * the site works with the "YYYY-MM-DD" strings the admin shows.
 */
function datesToStrings(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (Array.isArray(value)) return value.map(datesToStrings);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, datesToStrings(v)]));
  }
  return value;
}

/** Split a post file into its frontmatter (as Keystatic stored it) and the parsed body. */
export function parsePostFile(source: string): { data: PostFrontmatter; ast: Node } {
  const ast = parseMarkdoc(source);
  const raw = typeof ast.attributes.frontmatter === "string" ? ast.attributes.frontmatter : "";
  return { data: datesToStrings(load(raw) ?? {}) as PostFrontmatter, ast };
}

export function buildPost(slug: string, source: string, file = `${POSTS_DIR}/${slug}.mdoc`): Post {
  const { data, ast } = parsePostFile(source);
  const headings = assignHeadingIds(ast);
  const category = CATEGORY_INFO[data.category] ?? CATEGORY_INFO["market-notes"];
  const text = [data.summary, bodyText(ast)].filter(Boolean).join("\n\n");
  const words = wordCount(text);
  const author = getAuthor(data.author);
  return {
    slug,
    href: postPath(slug),
    title: data.title,
    ...(data.seoTitle ? { seoTitle: data.seoTitle } : {}),
    description: data.description,
    dek: data.dek,
    category: {
      slug: category.slug,
      label: category.label,
      href: `/blog/category/${category.slug}`,
    },
    format: data.format || category.singular,
    desk: data.desk,
    date: data.date,
    ...(data.updated ? { updated: data.updated } : {}),
    dateLabel: formatPostDate(data.date),
    ...(data.issue ? { issue: data.issue } : {}),
    tags: data.tags ?? [],
    readingTime: data.readingTime ?? Math.max(1, Math.round(words / 220)),
    gated: Boolean(data.gated),
    ...(data.summary ? { summary: data.summary } : {}),
    keyTakeaways: data.keyTakeaways ?? [],
    cover: coverOf(slug, data.cover),
    faq: data.faq ?? [],
    ...(author ? { author } : {}),
    draft: Boolean(data.draft),
    file,
    ast,
    headings,
    text,
    words,
  };
}

/**
 * Every post file on disk, drafts included, newest first. A file that cannot
 * be read fails the build with its name; on a dev server it is skipped (and
 * logged) so one half-edited post does not take every page down.
 */
function readAll(names: string[]): Post[] {
  const posts: Post[] = [];
  for (const n of names) {
    try {
      posts.push(buildPost(n.slice(0, -5), readFileSync(path.join(ABS_DIR, n), "utf8")));
    } catch (e) {
      const message = `${POSTS_DIR}/${n}: ${(e as Error).message}`;
      if (process.env.NODE_ENV === "production") throw new Error(message);
      console.error(`[blog] skipped ${message}`);
    }
  }
  return posts.sort(newestFirst);
}

export const newestFirst = (a: Pick<Post, "date" | "slug">, b: Pick<Post, "date" | "slug">) =>
  b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug);

/** Drafts are listed on a development server only (preview while writing). */
export const SHOW_DRAFTS = process.env.NODE_ENV === "development";

let cache: { key: string; posts: Post[] } | undefined;

/**
 * All post files, drafts included (validation, tests). Read once in a build;
 * on a development server, again whenever a file is added, changed or
 * removed (the admin writes them while `next dev` runs).
 */
export function getAllPosts(): Post[] {
  if (cache && process.env.NODE_ENV === "production") return cache.posts;
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
  if (cache?.key !== key) cache = { key, posts: readAll(names) };
  return cache.posts;
}

/** Published posts, newest first. */
export function getPosts(): Post[] {
  return getAllPosts().filter((p) => SHOW_DRAFTS || !p.draft);
}

/* ---------- queries ---------- */

export function getPost(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug);
}

export function postsInCategory(category: BlogCategory): Post[] {
  return getPosts().filter((p) => p.category.slug === category);
}

/** Posts per category, for the chips (every category, zero included). */
export function categoryCounts(): Record<BlogCategory, number> {
  const counts = Object.fromEntries(Object.keys(CATEGORY_INFO).map((c) => [c, 0])) as Record<
    BlogCategory,
    number
  >;
  for (const p of getPosts()) counts[p.category.slug]++;
  return counts;
}

/** Posts for a desk ("both" posts count for either desk), newest first. */
export function postsForDesk(desk: Exclude<BlogDesk, "both">): Post[] {
  return getPosts().filter((p) => p.desk === desk || p.desk === "both");
}

/**
 * Related posts: same category first, then posts sharing a tag, then the
 * same desk, then the newest — never the post itself.
 */
export function relatedPosts(post: Post, n = 3): Post[] {
  const tags = new Set(post.tags.map((t) => t.toLowerCase()));
  const score = (p: Post) =>
    (p.category.slug === post.category.slug ? 4 : 0) +
    (p.tags.some((t) => tags.has(t.toLowerCase())) ? 2 : 0) +
    (p.desk === post.desk || p.desk === "both" || post.desk === "both" ? 1 : 0);
  return getPosts()
    .filter((p) => p.slug !== post.slug)
    .map((p, i) => ({ p, s: score(p), i }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, n)
    .map((x) => x.p);
}

/** The neighbours in date order: `newer` and `older` (undefined at the ends). */
export function adjacentPosts(post: Post): { newer?: Post; older?: Post } {
  const posts = getPosts();
  const i = posts.findIndex((p) => p.slug === post.slug);
  return { newer: i > 0 ? posts[i - 1] : undefined, older: posts[i + 1] };
}

/** The serialisable card for listings, strips and client components. */
export function toCard(p: Post): PostCardData {
  return {
    slug: p.slug,
    href: p.href,
    title: p.title,
    dek: p.dek,
    category: p.category,
    format: p.format,
    desk: p.desk,
    date: p.date,
    ...(p.updated ? { updated: p.updated } : {}),
    dateLabel: p.dateLabel,
    readingTime: p.readingTime,
    gated: p.gated,
    tags: p.tags,
    ...(p.author ? { author: p.author } : {}),
    cover: p.cover,
    draft: p.draft,
  };
}

/** The latest posts as cards: the homepage "Notes from the desk" strip. */
export function latestPostCards(n = 3, desk?: Exclude<BlogDesk, "both">): PostCardData[] {
  return (desk ? postsForDesk(desk) : getPosts()).slice(0, n).map(toCard);
}
