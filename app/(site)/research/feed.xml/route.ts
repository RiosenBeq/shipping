import { siteConfig } from "@/lib/site";
import { REPORTS, reportDateIso, reportSlug } from "@/lib/data/research";

export const dynamic = "force-static";
export const revalidate = false;

const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const abs = (path: string) => new URL(path, siteConfig.url).toString();

const DESK_LABELS = { lpg: "LPG & ammonia", tankers: "Tankers" } as const;

/**
 * RSS 2.0 feed of the research notes from the tanker and LPG desks, newest
 * first. Gated reports are listed with their summary and a note that the full
 * report is sent on request.
 */
export function GET() {
  const sorted = [...REPORTS].sort((a, b) =>
    reportDateIso(b.date).localeCompare(reportDateIso(a.date))
  );

  const items = sorted
    .map((r) => {
      const url = abs(`/research/${reportSlug(r)}`);
      const description = r.gated
        ? `${r.desc} Summary online; the full report is sent on request from ${siteConfig.desks.research.email}.`
        : r.desc;
      return `    <item>
      <title>${escape(r.title)}</title>
      <link>${escape(url)}</link>
      <guid isPermaLink="true">${escape(url)}</guid>
      <pubDate>${new Date(reportDateIso(r.date)).toUTCString()}</pubDate>
      <category>${escape(DESK_LABELS[r.desk])}</category>
      <category>${escape(r.catLabel)}</category>
      <description>${escape(description)}</description>
    </item>`;
    })
    .join("\n");

  // Use the newest report date so the static output only changes when content does.
  const lastBuild = sorted[0] ? new Date(reportDateIso(sorted[0].date)) : new Date();

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(`${siteConfig.name} — Tanker & LPG Research`)}</title>
    <link>${escape(abs("/research"))}</link>
    <description>${escape(
      "Market notes from the LEVANTER tanker and LPG desks: VLGC and MGC trades, small LPG in the Med and Black Sea, Suezmax and Aframax outlooks, and charter party regulation."
    )}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
    <atom:link href="${escape(abs("/research/feed.xml"))}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
