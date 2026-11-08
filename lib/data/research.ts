/**
 * Research notes: listing metadata. The bodies are in research-bodies.ts.
 * Both are edited in the admin (/keystatic → Research notes) and stored
 * together in content/research.json, one entry per note.
 */
import file from "@/content/research.json";
import type { ResearchFile } from "@/lib/content/schemas";
import { isoToReportDate } from "@/lib/content/format";
import { HORMUZ_NOTE_SLUG } from "@/lib/content/options";
import type { ResearchCategory } from "@/lib/schemas";

export type Report = {
  /** Stable URL slug — keep unchanged once published. */
  slug: string;
  desk: "tankers" | "lpg";
  cat: Exclude<ResearchCategory, "all">;
  catLabel: string;
  iss: string;
  /** Publication date, "28 APR 2026". */
  date: string;
  /** Last material revision, same format. Feeds dateModified and the sitemap. */
  updated?: string;
  /** Broker who wrote the note (name exactly as in the Brokers list). */
  author: string;
  read: number;
  /** Gated reports show the summary on the site; the full PDF is sent on request. */
  gated: boolean;
  title: string;
  /** Shorter <title> for search results when `title` runs past ~60 characters. */
  seoTitle?: string;
  desc: string;
  label: string;
};

export function reportSlug(r: Pick<Report, "slug">): string {
  return r.slug;
}

/** The Strait of Hormuz brief, linked from route tables that load in the Gulf. */
export const HORMUZ_NOTE_PATH = `/research/${HORMUZ_NOTE_SLUG}`;

/**
 * Notes for a class guide or desk page: those whose tags mention one of
 * `terms` (e.g. "VLGC"), newest first, topped up with the desk's latest notes.
 */
export function relatedReports(desk: Report["desk"], terms: string[], n = 3): Report[] {
  const byDate = [...REPORTS].sort((a, b) =>
    reportDateIso(b.date).localeCompare(reportDateIso(a.date))
  );
  const re = new RegExp(`\\b(${terms.map((t) => t.replace(/\W/g, "")).join("|")})\\b`, "i");
  const matched = terms.length ? byDate.filter((r) => re.test(`${r.label} ${r.title}`)) : [];
  const rest = byDate.filter((r) => r.desk === desk && !matched.includes(r));
  return [...matched, ...rest].slice(0, n);
}

export function getReportBySlug(slug: string): Report | undefined {
  return REPORTS.find((r) => reportSlug(r) === slug);
}

/** Parse "28 APR 2026" → ISO 8601 string */
export function reportDateIso(date: string): string {
  const [day, monStr, year] = date.split(" ");
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const m = months.indexOf(monStr.toUpperCase());
  if (m < 0) return new Date().toISOString();
  return new Date(Date.UTC(Number(year), m, Number(day))).toISOString();
}

export const REPORTS: Report[] = (file as ResearchFile).notes.map((n) => ({
  slug: n.slug,
  desk: n.desk,
  cat: n.cat,
  catLabel: n.catLabel,
  iss: n.iss,
  date: isoToReportDate(n.date),
  ...(n.updated ? { updated: isoToReportDate(n.updated) } : {}),
  author: n.author,
  read: n.read,
  gated: n.gated,
  title: n.title,
  ...(n.seoTitle ? { seoTitle: n.seoTitle } : {}),
  desc: n.desc,
  label: n.label,
}));
