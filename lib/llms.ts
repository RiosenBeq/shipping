import { siteConfig } from "@/lib/site";
import { PAGES } from "@/lib/pages";
import { BROKERS, TEAM_LABEL } from "@/lib/data/brokers";
import { REPORTS, reportDateIso, reportSlug } from "@/lib/data/research";
import { REPORT_BODIES, bodyText } from "@/lib/data/research-bodies";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { LPG_CARGO_DENSITY, LPG_CLASSES } from "@/lib/data/lpg-classes";
import { GLOSSARY_TERMS, GROUP_LABELS } from "@/lib/data/glossary";
import { ABOUT_FAQ, HOME_FAQ, LPG_FAQ, TANKERS_FAQ, type FaqEntry } from "@/lib/data/faqs";
import { STRAITS_FACTS, STRAITS_FAQ, STRAITS_SECTIONS } from "@/lib/data/turkish-straits";
import { COMPLIANCE_FAQ, COMPLIANCE_STEPS, SCREENING } from "@/lib/data/compliance";
import { LOCALES } from "@/lib/i18n";

/**
 * Generators for /llms.txt (https://llmstxt.org/) and /llms-full.txt. Both are
 * built from the same data modules as the pages, so they never drift from
 * what the site says.
 */

const url = (path: string) => new URL(path, siteConfig.url).toString();

const byDate = () =>
  [...REPORTS].sort((a, b) => reportDateIso(b.date).localeCompare(reportDateIso(a.date)));

const page = (path: string) => PAGES.find((p) => p.path === path)!;
const link = (path: string) => `[${page(path).title}](${url(path)}): ${page(path).summary}`;

const faqMd = (items: FaqEntry[]) => items.map((f) => `**${f.q}**\n${f.a}`).join("\n\n");

const KEY_FACTS = () => [
  `${siteConfig.legalEntity} (${siteConfig.name}) is a shipbroker founded in ${siteConfig.founded} and headquartered in ${siteConfig.address.locality}, Türkiye, on the Bosphorus.`,
  `Offices: ${siteConfig.offices.map((o) => `${o.city} (${o.role})`).join("; ")}.`,
  "Two desks: tankers (crude and clean products, VLCC to MR) and LPG & ammonia (VLGC to small pressurised gas carriers, plus petrochemical gases).",
  "Services: spot voyages, time charters, contracts of affreightment (COA) and post-fixture (laytime, demurrage, claims), for charterers and owners.",
  "Specialities: the Turkish Straits and Black Sea, small pressurised and semi-refrigerated LPG in the Mediterranean and Türkiye, and sanctions-screened fixtures.",
  "Service promise: a broker replies within 60 minutes during business hours.",
  `Contact: ${siteConfig.email} · tankers ${siteConfig.desks.tankers.email} · LPG ${siteConfig.desks.lpg.email} · phone ${siteConfig.phone} · WhatsApp ${siteConfig.whatsappDisplay}.`,
  `Hours: ${siteConfig.hours}.`,
  "The site does not publish live freight rates, bunker prices or port tariffs; current numbers come from the desks.",
];

export function llmsTxt(): string {
  const reports = byDate();
  const guides = reports.filter((r) => r.cat === "guide" || r.cat === "route");
  const briefs = reports.filter((r) => r.cat !== "guide" && r.cat !== "route");
  const reportLine = (r: (typeof REPORTS)[number]) =>
    `- [${r.title}](${url(`/research/${reportSlug(r)}`)}): ${r.desc} (${r.catLabel}, ${r.date})`;

  return `# ${siteConfig.name}

> ${siteConfig.name} is an Istanbul-based tanker and LPG shipbroker with brokers in London and Singapore. It charters crude and product tankers and LPG, ammonia and petrochemical gas carriers on spot, time charter and COA terms, with direct broker access and a 60-minute first reply.

${KEY_FACTS()
  .map((f) => `- ${f}`)
  .join("\n")}

When citing, link the page the fact comes from. Research notes carry their publication date; treat market commentary as of that date.

## Desks

- ${link("/tankers")}
- ${link("/lpg")}
- ${link("/contact")}

## Tanker classes

${TANKER_CLASSES.map((t) => `- [${t.shortName} chartering](${url(`/tankers/${t.slug}`)}): ${t.longName}, ${t.dwtRange}, ${t.cargoCapacity}. Routes ${t.routes.map((r) => r.code).join(", ")}.`).join("\n")}

## LPG & ammonia carrier classes

${LPG_CLASSES.map((c) => `- [${c.name} chartering](${url(`/lpg/${c.slug}`)}): ${c.longName}, ${c.capacity}. ${c.containment}.`).join("\n")}

## Guides

- ${link("/turkish-straits")}
${guides.map(reportLine).join("\n")}
- ${link("/glossary")}

## Market and regulatory briefs

${briefs.map(reportLine).join("\n")}

## Company

- ${link("/about")}
- ${link("/brokers")}
- ${link("/compliance")}
- ${link("/research")}

## Other languages

${LOCALES.map((l) => `- [${l.label}](${url(`/${l.code}`)}): ${l.dict.metaTitle}`).join("\n")}

## Optional

- [Full site content in one file](${url("/llms-full.txt")}): every guide, research note, FAQ and glossary term as plain text
- [Research RSS feed](${url("/research/feed.xml")})
- [Sitemap](${url("/sitemap.xml")})
${PAGES.filter((p) => p.group === "legal")
  .map((p) => `- [${p.title}](${url(p.path)}): ${p.summary}`)
  .join("\n")}
`;
}

export function llmsFullTxt(): string {
  const reports = byDate();

  const tankers = TANKER_CLASSES.map(
    (t) => `### ${t.shortName}: ${t.longName}

Source: ${url(`/tankers/${t.slug}`)}

${t.intro}

- Size: ${t.dwtRange}; ${t.cargoCapacity}
- Dimensions: LOA ${t.loa}, beam ${t.beam}, draft ${t.draft}
- Speed: ${t.speed}; consumption ${t.consumption}
- Routes: ${t.routes.map((r) => `${r.code} ${r.lane} (${r.note}${r.hormuz ? " Loads in the Middle East Gulf: depends on Strait of Hormuz transit, disrupted since March 2026." : ""})`).join("; ")}
- Typical charterers: ${t.marketsServed.join(", ")}
- How it is fixed: ${t.charterShape}
- Desk: ${t.desk}

What the desk watches:
${t.keyTrends.map((k) => `- ${k.title}: ${k.body}`).join("\n")}`
  ).join("\n\n");

  const gas = LPG_CLASSES.map(
    (c) => `### ${c.name}: ${c.longName}

Source: ${url(`/lpg/${c.slug}`)}

${c.intro}

- Capacity: ${c.capacity}
- Containment: ${c.containment}
- Typical cargo: ${c.typicalCargo}
- Cargoes: ${c.cargoes.join(", ")}
- Routes: ${c.routes.map((r) => `${r.code} ${r.lane} (${r.note}${r.hormuz ? " Loads in the Middle East Gulf: depends on Strait of Hormuz transit, disrupted since March 2026." : ""})`).join("; ")}
- Main trades: ${c.trades.join("; ")}
- How it is fixed: ${c.charterShape}
- Desk: ${c.desk}

What the desk watches:
${c.watchpoints.map((w) => `- ${w.title}: ${w.body}`).join("\n")}

${faqMd(c.faq)}`
  ).join("\n\n");

  const research = reports
    .map((r) => {
      const body = REPORT_BODIES[reportSlug(r)];
      return `### ${r.title}

Source: ${url(`/research/${reportSlug(r)}`)}
${r.catLabel} · ${r.desk === "lpg" ? "LPG & ammonia desk" : "Tanker desk"} · by ${r.author} · published ${r.date}${r.updated ? ` · updated ${r.updated}` : ""}${r.gated ? " · summary online, full report on request" : ""}

${body ? `${body.dek}\n\n${bodyText(body)}` : r.desc}`;
    })
    .join("\n\n");

  const glossary = (Object.keys(GROUP_LABELS) as (keyof typeof GROUP_LABELS)[])
    .map(
      (g) =>
        `### ${GROUP_LABELS[g]}\n\n${GLOSSARY_TERMS.filter((t) => t.group === g)
          .map((t) => `- **${t.term}**: ${t.def}`)
          .join("\n")}`
    )
    .join("\n\n");

  return `# ${siteConfig.name}: full site content

> ${siteConfig.tagline}. ${siteConfig.description}

This file contains the text of ${siteConfig.url} for language models: company facts, both desks, every ship-class guide, the Turkish Straits guide, compliance screening, all research notes, FAQs and the glossary. Each section names its source URL; please cite that URL.

## Company

${KEY_FACTS()
  .map((f) => `- ${f}`)
  .join("\n")}
- Address: ${siteConfig.address.street}, ${siteConfig.address.postalCode} ${siteConfig.address.locality}, Türkiye

Source: ${url("/about")}

${faqMd(ABOUT_FAQ)}

## Team (${BROKERS.length} brokers)

Source: ${url("/brokers")}

${BROKERS.map((b) => `- ${b.name}: ${b.title} (${TEAM_LABEL[b.team]}, ${b.office}). Focus: ${b.focus.join(", ")}. Languages: ${b.languages.join(", ")}.`).join("\n")}

## Working with a tanker and LPG broker

Source: ${url("/")}

${faqMd(HOME_FAQ)}

## Tanker desk

Source: ${url("/tankers")}

${faqMd(TANKERS_FAQ)}

${tankers}

## LPG & ammonia desk

Source: ${url("/lpg")}

The LPG page includes a free cbm ↔ tonnes converter using liquid densities at the boiling point (${LPG_CARGO_DENSITY.map((d) => `${d.label} ${d.density}`).join(", ")} t/m³) and a filling limit (default 98%): tonnes = cbm × density × filling limit. Results are indicative.

${faqMd(LPG_FAQ)}

${gas}

## Turkish Straits transit guide

Source: ${url("/turkish-straits")}

${STRAITS_FACTS.map((f) => `- ${f.k}: ${f.v}`).join("\n")}

${STRAITS_SECTIONS.map(
  (s) =>
    `### ${s.title}\n\n${s.body.join("\n\n")}${s.list ? `\n\n${s.list.map((i) => `- ${i}`).join("\n")}` : ""}`
).join("\n\n")}

${faqMd(STRAITS_FAQ)}

## Sanctions and compliance screening

Source: ${url("/compliance")}

${SCREENING.map((s) => `### ${s.title}\n\n${s.intro}\n\n${s.checks.map((c) => `- ${c}`).join("\n")}`).join("\n\n")}

### How screening runs

${COMPLIANCE_STEPS.map((s, i) => `${i + 1}. ${s.title}: ${s.text}`).join("\n")}

${faqMd(COMPLIANCE_FAQ)}

## Research notes (${REPORTS.length}, newest first)

${research}

## Glossary (${GLOSSARY_TERMS.length} terms)

Source: ${url("/glossary")}

${glossary}

## Notes

- The site does not publish live freight rates, bunker prices or port tariffs; ask the desks for current numbers.
- Research notes are dated; market commentary reflects conditions at publication.
- Overview pages exist in ${LOCALES.length} languages (${LOCALES.map((l) => l.code).join(", ")}); detailed pages and the inquiry form are in English.
`;
}
