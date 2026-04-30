import { siteConfig } from "@/lib/site";
import { REPORTS, reportSlug, reportDateIso } from "@/lib/data/research";

export const dynamic = "force-static";
export const revalidate = false;

const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/**
 * RSS 2.0 feed of the research catalogue. Sorted newest first, gated reports
 * included with a [PRO] prefix on the title and the gating noted in the body.
 */
export function GET() {
  const items = [...REPORTS]
    .sort(
      (a, b) =>
        new Date(reportDateIso(b.date)).getTime() - new Date(reportDateIso(a.date)).getTime()
    )
    .map((r) => {
      const slug = reportSlug(r);
      const url = `${siteConfig.url}/research/${slug}`;
      const title = r.gated ? `[PRO] ${r.title}` : r.title;
      const description = `${r.desc}${r.gated ? " (LEVANTER Pro report — request access via /contact)" : ""}`;
      return `    <item>
      <title>${escape(title)}</title>
      <link>${escape(url)}</link>
      <guid isPermaLink="true">${escape(url)}</guid>
      <pubDate>${new Date(reportDateIso(r.date)).toUTCString()}</pubDate>
      <category>${escape(r.catLabel)}</category>
      <description>${escape(description)}</description>
    </item>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(siteConfig.name)} — Research</title>
    <link>${escape(siteConfig.url)}/research</link>
    <description>${escape(
      "Weekly outlooks, route guides, regulatory deep-dives from the LEVANTER desk."
    )}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escape(siteConfig.url)}/research/feed.xml" rel="self" type="application/rss+xml"/>
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
