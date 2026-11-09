/**
 * The research notes became the blog in November 2026 (lib/blog/posts.ts,
 * content/blog/*.mdoc). This module keeps the old `Report` shape for the
 * pages that still read notes through it (the class guides' related notes,
 * the Hormuz note link): every Report is a published blog post, and its link
 * is /blog/<slug> (/research/* answers with 308s).
 *
 * New code should use lib/blog/posts.ts (getPosts, relatedPosts, toCard) and
 * the blog components instead.
 */
import { HORMUZ_NOTE_SLUG } from "@/lib/content/options";
import { getPosts, type Post } from "@/lib/blog/posts";
import { CATEGORY_INFO, postPath } from "@/lib/blog/meta";
import { isoToReportDate } from "@/lib/content/format";
import type { ResearchCategory } from "@/lib/schemas";

export type Report = {
  /** Stable URL slug — keep unchanged once published. */
  slug: string;
  /** "both" for posts that concern both desks. */
  desk: "tankers" | "lpg" | "both";
  cat: Exclude<ResearchCategory, "all">;
  /** The format label, e.g. "Risk brief", "Route guide". */
  catLabel: string;
  iss: string;
  /** Publication date, "28 APR 2026". */
  date: string;
  /** Last material revision, same format. */
  updated?: string;
  /** Broker who wrote the note (name as in the Brokers list). */
  author: string;
  read: number;
  /** Gated reports show the summary on the site; the full report is sent on request. */
  gated: boolean;
  title: string;
  seoTitle?: string;
  desc: string;
  /** Tags joined with " · ", e.g. "Crude · LPG · War risk". */
  label: string;
  /** The post's URL, /blog/<slug>. */
  href: string;
};

export function reportSlug(r: Pick<Report, "slug">): string {
  return r.slug;
}

/** The post's URL: /blog/<slug>. */
export const reportPath = (r: Pick<Report, "slug">) => postPath(r.slug);

/** The Strait of Hormuz post, linked from route tables that load in the Gulf. */
export const HORMUZ_NOTE_PATH = postPath(HORMUZ_NOTE_SLUG);

const toReport = (p: Post): Report => ({
  slug: p.slug,
  desk: p.desk,
  cat: CATEGORY_INFO[p.category.slug].legacy,
  catLabel: p.format,
  iss: p.issue ?? "",
  date: isoToReportDate(p.date),
  ...(p.updated ? { updated: isoToReportDate(p.updated) } : {}),
  author: p.author?.name ?? "OBM Shipping",
  read: p.readingTime,
  gated: p.gated,
  title: p.title,
  ...(p.seoTitle ? { seoTitle: p.seoTitle } : {}),
  desc: p.description,
  label: p.tags.join(" · "),
  href: p.href,
});

/** Published posts as Reports, newest first. */
export const REPORTS: Report[] = getPosts().map(toReport);

/**
 * Notes for a class guide or desk page: those whose tags or title mention one
 * of `terms` (e.g. "VLGC"), newest first, topped up with the desk's latest.
 */
export function relatedReports(desk: "tankers" | "lpg", terms: string[], n = 3): Report[] {
  const re = new RegExp(`\\b(${terms.map((t) => t.replace(/\W/g, "")).join("|")})\\b`, "i");
  const matched = terms.length ? REPORTS.filter((r) => re.test(`${r.label} ${r.title}`)) : [];
  const rest = REPORTS.filter(
    (r) => (r.desk === desk || r.desk === "both") && !matched.includes(r)
  );
  return [...matched, ...rest].slice(0, n);
}

export function getReportBySlug(slug: string): Report | undefined {
  return REPORTS.find((r) => r.slug === slug);
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** Parse "28 APR 2026" → ISO 8601 string. */
export function reportDateIso(date: string): string {
  const [day, monStr, year] = date.split(" ");
  const m = MONTHS.indexOf((monStr ?? "").toUpperCase());
  if (m < 0) return new Date().toISOString();
  return new Date(Date.UTC(Number(year), m, Number(day))).toISOString();
}
