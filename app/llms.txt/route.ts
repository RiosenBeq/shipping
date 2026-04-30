import { siteConfig } from "@/lib/site";
import { PAGES } from "@/lib/pages";
import { BROKERS, brokerSlug } from "@/lib/data/brokers";
import { REPORTS, reportSlug } from "@/lib/data/research";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { OFFICES } from "@/lib/data/offices";

export const dynamic = "force-static";
export const revalidate = false;

const OFFICE_CITIES = ["ist", "lon", "sg", "hou"] as const;

/**
 * Serves /llms.txt per the convention at https://llmstxt.org/
 * — a markdown index that helps LLM crawlers discover the structure
 * and intent of the site without parsing every page.
 */
export function GET() {
  const url = (path: string) => new URL(path, siteConfig.url).toString();

  const primary = PAGES.filter((p) => p.group === "primary").map(
    (p) => `- [${p.title}](${url(p.path)}): ${p.summary}`
  );
  const tools = PAGES.filter((p) => p.group === "tools").map(
    (p) => `- [${p.title}](${url(p.path)}): ${p.summary}`
  );
  const legal = PAGES.filter((p) => p.group === "legal").map(
    (p) => `- [${p.title}](${url(p.path)}): ${p.summary}`
  );

  const body = `# ${siteConfig.name}

> ${siteConfig.tagline}. ${siteConfig.description}

${siteConfig.legalEntity} is a maritime brokerage headquartered in ${
    siteConfig.address.locality
  }, ${siteConfig.address.country}, with desks in ${siteConfig.offices
    .filter((o) => o.role !== "Headquarters")
    .map((o) => o.city)
    .join(", ")}. We charter tankers (crude, clean, chemicals) and dry bulk
carriers across the major global lanes, run an S&P advisory desk, and publish
desk-grade research. The site documents these services and provides a live
voyage estimator (TCE / freight / bunker / P&L modelling).

## Pages
${primary.join("\n")}

## Tools
${tools.join("\n")}

## Tanker classes
${TANKER_CLASSES.map(
  (t) =>
    `- [${t.shortName}](${url(`/tankers/${t.slug}`)}): ${t.longName} · ${t.dwtRange} · ${t.routes.map((r) => r.code).join(", ")}`
).join("\n")}

## Offices
${OFFICE_CITIES.map(
  (c) =>
    `- [${OFFICES[c].city}](${url(`/offices/${c}`)}): ${OFFICES[c].sectors} · ${OFFICES[c].hours}`
).join("\n")}

## Brokers
${BROKERS.map(
  (b) =>
    `- [${b.name}](${url(`/brokers/${brokerSlug(b)}`)}): ${b.title} · ${b.desk} · ${b.tags.join(", ")}`
).join("\n")}

## Research reports
${REPORTS.map(
  (r) =>
    `- [${r.title}](${url(`/research/${reportSlug(r)}`)}): ${r.catLabel}, ${r.date}, ${r.read} min${r.gated ? " (Pro)" : ""}`
).join("\n")}

## Optional
${legal.join("\n")}
- [Sitemap](${url("/sitemap.xml")}): Machine-readable list of every URL
- [RSS feed](${url("/research/feed.xml")}): Latest research, RSS 2.0
- [Brokers JSON-LD](${url("/brokers")}): \`ItemList\` of 14 brokers (Person schema)
- [Research JSON-LD](${url("/research")}): \`ItemList\` of ${REPORTS.length} reports (Article schema)
- [Voyage Estimator FAQ](${url("/voyage-estimator")}): \`FAQPage\` schema with the 4 most-asked questions
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
