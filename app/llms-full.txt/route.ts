import { siteConfig } from "@/lib/site";
import { PAGES } from "@/lib/pages";
import { BROKERS, TEAM_LABEL } from "@/lib/data/brokers";
import { REPORTS, reportSlug } from "@/lib/data/research";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { LPG_CLASSES } from "@/lib/data/lpg-classes";

export const dynamic = "force-static";

/** Long-form companion to /llms.txt with the structured content of the site. */
export function GET() {
  const url = (path: string) => new URL(path, siteConfig.url).toString();

  const body = `# ${siteConfig.name} — full content for LLMs

> ${siteConfig.tagline}. ${siteConfig.description}

## Company

- Legal entity: ${siteConfig.legalEntity} (founded ${siteConfig.founded})
- Headquarters: ${siteConfig.address.street}, ${siteConfig.address.postalCode} ${siteConfig.address.locality}, Türkiye
- Offices: ${siteConfig.offices.map((o) => `${o.city} (${o.role})`).join("; ")}
- Tanker desk: ${siteConfig.desks.tankers.email}
- LPG & ammonia desk: ${siteConfig.desks.lpg.email}
- Phone: ${siteConfig.phone} · WhatsApp: ${siteConfig.whatsappDisplay}
- Hours: ${siteConfig.hours}
- Service promise: a broker replies within 60 minutes during business hours.

## Pages

${PAGES.map((p) => `### ${p.title}\n${url(p.path)}\n${p.summary}`).join("\n\n")}

## LPG & ammonia carriers

${LPG_CLASSES.map(
  (c) =>
    `### ${c.name} — ${c.longName}\n${url(`/lpg/${c.slug}`)}\n- Capacity: ${c.capacity}\n- Containment: ${c.containment}\n- Typical cargo: ${c.typicalCargo}\n- Cargoes: ${c.cargoes.join(", ")}\n- Routes: ${c.routes.map((r) => `${r.code} ${r.lane}`).join("; ")}\n- Charter shape: ${c.charterShape}`
).join("\n\n")}

## Tankers

${TANKER_CLASSES.map(
  (t) =>
    `### ${t.shortName} — ${t.longName}\n${url(`/tankers/${t.slug}`)}\n- Size: ${t.dwtRange}, ${t.cargoCapacity}\n- Routes: ${t.routes.map((r) => `${r.code} ${r.lane}`).join("; ")}\n- Charter shape: ${t.charterShape}`
).join("\n\n")}

## Team (${BROKERS.length})

${BROKERS.map((b) => `- ${b.name} — ${b.title} (${TEAM_LABEL[b.team]}, ${b.office}). Focus: ${b.focus.join(", ")}.`).join("\n")}

## Research (${REPORTS.length})

${REPORTS.map((r) => `- ${r.title} (${r.catLabel}, ${r.date}) — ${url(`/research/${reportSlug(r)}`)}\n  ${r.desc}`).join("\n")}

## Notes

- The site does not publish live freight rates; ask the desks for current numbers.
- The LPG cbm ↔ tonnes converter is indicative only (standard densities).
- Structured data: Schema.org JSON-LD on every page (Organization, ProfessionalService, Service, WebPage, BreadcrumbList, FAQPage, Article, ItemList, DefinedTermSet).
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
