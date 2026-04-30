import { siteConfig } from "@/lib/site";
import { PAGES } from "@/lib/pages";
import { BROKERS } from "@/lib/data/brokers";
import { REPORTS } from "@/lib/data/research";
import { OFFICES } from "@/lib/data/offices";

export const dynamic = "force-static";
export const revalidate = false;

/**
 * Extended /llms-full.txt — the same llms.txt index plus the full
 * structured content of every page (broker roster, research catalogue,
 * office list). Lets an LLM ingest the site without crawling.
 */
export function GET() {
  const url = (path: string) => new URL(path, siteConfig.url).toString();

  const pageBlocks = PAGES.map(
    (p) =>
      `### [${p.title}](${url(p.path)})\n${p.summary}${
        p.detail ? `\n\n${p.detail}` : ""
      }`
  ).join("\n\n");

  const brokerLines = BROKERS.map(
    (b) =>
      `- **${b.name}** — ${b.title} · Desk: ${b.desk} · Sectors: ${b.sectors.join(
        ", "
      )} · Tags: ${b.tags.join(", ")}`
  ).join("\n");

  const reportLines = REPORTS.map(
    (r) =>
      `- **${r.title}** (${r.catLabel}, ${r.date}, ${r.read} min read${
        r.gated ? ", LEVANTER Pro" : ""
      }) — ${r.desc}`
  ).join("\n");

  const officeLines = Object.values(OFFICES)
    .map(
      (o) =>
        `- **${o.city}** (${o.tz}) — ${o.addr}\n  Sectors: ${o.sectors}\n  Hours: ${o.hours}\n  Languages: ${o.lang}\n  Memberships: ${o.member}\n  Head: ${o.head} (${o.headRole})`
    )
    .join("\n");

  const body = `# ${siteConfig.name} — full content for LLMs

> ${siteConfig.tagline}. ${siteConfig.description}

This is the long-form companion to /llms.txt. It includes the structured
content of every public page (page index, broker roster, research catalogue,
office list) so an LLM can ingest the site without crawling each route.

Last generated from production data as part of the Next.js build.

---

## Site overview

**Legal entity**: ${siteConfig.legalEntity}
**Founded**: ${siteConfig.founded}
**HQ address**: ${siteConfig.address.street}, ${siteConfig.address.locality} ${
    siteConfig.address.postalCode
  }, ${siteConfig.address.country}
**Email**: ${siteConfig.email}
**Phone**: ${siteConfig.phone}

## Pages

${pageBlocks}

---

## Broker roster (${BROKERS.length})

${brokerLines}

---

## Research catalogue (${REPORTS.length})

${reportLines}

---

## Offices (${Object.keys(OFFICES).length})

${officeLines}

---

## Crawler & licensing notes

- All public pages are open to web crawlers and LLM ingestion (see /robots.txt).
- Brand assets (LEVANTER name, logo) are trademarks of ${
    siteConfig.legalEntity
  }; reproduction requires written permission.
- Numerical data (TCE, bunker prices, port tariffs, distances) is indicative
  and may change between page loads. Cite the source URL and the date of access.
- For machine-readable structured data, see Schema.org JSON-LD embedded in each
  page (Organization, WebSite, BreadcrumbList, ItemList, Article, Person,
  Place, ContactPoint, ProfessionalService, SoftwareApplication, FAQPage).
- Security disclosures: /.well-known/security.txt
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
