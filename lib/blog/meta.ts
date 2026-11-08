/**
 * Blog vocabulary shared by the server pages and client components: URL
 * builders, category metadata, date formatting and the serialisable card
 * shape. No file access and no Markdoc here, so client components (the
 * homepage strip) can import it. The posts themselves are loaded by
 * lib/blog/posts.ts (server only).
 */
import {
  BLOG_CATEGORIES,
  BLOG_CATEGORY_LABELS,
  BLOG_DESK_LABELS,
  type BlogCategory,
  type BlogDesk,
} from "@/lib/content/options";

export { BLOG_CATEGORIES, BLOG_CATEGORY_LABELS, BLOG_DESK_LABELS };
export type { BlogCategory, BlogDesk };

export const BLOG_PATH = "/blog";
export const BLOG_FEED_PATH = "/blog/feed.xml";
export const BLOG_TITLE = "Notes from the desk.";
export const BLOG_NAME = "LEVANTER Blog";
export const BLOG_DESCRIPTION =
  "Route guides, chartering how-tos and risk briefs, written by the brokers who fix the cargoes. No rate tables — the reasoning behind them.";

/** Posts in the grid of one listing page (the first page adds the featured post above it). */
export const POSTS_PER_PAGE = 12;

export const postPath = (slug: string) => `${BLOG_PATH}/${slug}`;
export const categoryPath = (category: BlogCategory) => `${BLOG_PATH}/category/${category}`;
/** Listing page n (1-based): /blog, /blog/page/2 … or the same under a category. */
export function listingPath(page: number, category?: BlogCategory): string {
  const base = category ? categoryPath(category) : BLOG_PATH;
  return page <= 1 ? base : `${base}/page/${page}`;
}
export const coverImagePath = (slug: string, seed: number) =>
  `${postPath(slug)}/cover.svg?s=${seed}`;
export const shareImagePath = (slug: string) => `${postPath(slug)}/og.png`;
export const BLOG_SHARE_IMAGE = `${BLOG_PATH}/og.png`;

type CategoryInfo = {
  slug: BlogCategory;
  label: string;
  /** Singular, for a post's format pill when it has no format of its own. */
  singular: string;
  /** One line under the h1 of the category page (and its meta description). */
  description: string;
  /** The research notes' old filter key, kept for lib/data/research.ts. */
  legacy: "guide" | "route" | "reg" | "weekly";
};

export const CATEGORY_INFO: Record<BlogCategory, CategoryInfo> = {
  "chartering-guides": {
    slug: "chartering-guides",
    label: BLOG_CATEGORY_LABELS["chartering-guides"],
    singular: "Chartering guide",
    description:
      "How tanker and LPG charters work in practice: freight quoting, laytime and demurrage, and choosing between spot, time charter and COA.",
    legacy: "guide",
  },
  "route-guides": {
    slug: "route-guides",
    label: BLOG_CATEGORY_LABELS["route-guides"],
    singular: "Route guide",
    description:
      "The lanes we fix, end to end: distances, port time, routing choices and what moves the round-trip result.",
    legacy: "route",
  },
  "risk-and-regulation": {
    slug: "risk-and-regulation",
    label: BLOG_CATEGORY_LABELS["risk-and-regulation"],
    singular: "Risk brief",
    description:
      "War risk, sanctions and the price cap, emissions rules: what each one changes in a fixture and the clauses to agree first.",
    legacy: "reg",
  },
  "market-notes": {
    slug: "market-notes",
    label: BLOG_CATEGORY_LABELS["market-notes"],
    singular: "Market note",
    description:
      "Dated notes on the tanker and gas markets from the desks — the drivers we watch, not a rate sheet.",
    legacy: "weekly",
  },
  news: {
    slug: "news",
    label: BLOG_CATEGORY_LABELS.news,
    singular: "News",
    description: "News from LEVANTER: people, offices and the desks.",
    legacy: "weekly",
  },
};

export function isBlogCategory(value: string): value is BlogCategory {
  return (BLOG_CATEGORIES as readonly string[]).includes(value);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "2026-10-16" → "16 Oct 2026" (no Date parsing, so no time-zone drift). */
export function formatPostDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
}

/** "2026-10-16" → "October 2026" (year group headings). */
export function formatMonth(iso: string): string {
  const [y, m] = iso.split("-");
  return `${MONTHS_LONG[Number(m) - 1]} ${y}`;
}

/** Page `page` (1-based) of `items`, `perPage` each, plus the page count (≥ 1). */
export function paginate<T>(items: T[], page: number, perPage = POSTS_PER_PAGE) {
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, Math.floor(page)), pages);
  return {
    items: items.slice((current - 1) * perPage, current * perPage),
    page: current,
    pages,
  };
}

/** "Risk brief · Crude · LPG" (set in capitals on covers): the format and the first two tags. */
export const coverLabel = (post: { format: string; tags: string[] }) =>
  [post.format, ...post.tags.slice(0, 2)].join(" · ");

/* ---------- the card a listing, strip or "related" row shows ---------- */

export type TypeCoverData = {
  kind: "type";
  /** Big text bottom-left: a route code, a class or coordinates. */
  code: string;
  caption?: string;
  /** Seeds the contour field; also busts the cover image cache. */
  seed: number;
  /** Contour-line image (an SVG generated per post). */
  src: string;
};

export type StillCoverData = {
  kind: "still";
  src: string;
  /** AVIF source when the still comes from the licensed media library. */
  avif?: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
};

export type CoverData = TypeCoverData | StillCoverData;

export type AuthorData = {
  /** The broker's short id (content/brokers.json), the anchor on /brokers. */
  id: string;
  name: string;
  title: string;
  initials: string;
  /** Brass for desk heads, navy for everyone else. */
  color: string;
  photo?: string;
};

/** Everything a post card needs, serialisable (safe to pass to client components). */
export type PostCardData = {
  slug: string;
  href: string;
  title: string;
  dek: string;
  category: { slug: BlogCategory; label: string; href: string };
  /** The format pill: "Risk brief", "Route guide"… */
  format: string;
  desk: BlogDesk;
  /** ISO dates, YYYY-MM-DD. */
  date: string;
  updated?: string;
  dateLabel: string;
  readingTime: number;
  gated: boolean;
  tags: string[];
  author?: AuthorData;
  cover: CoverData;
  draft: boolean;
};
