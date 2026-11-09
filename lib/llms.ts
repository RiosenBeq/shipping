import { siteConfig } from "@/lib/site";
import { PAGES } from "@/lib/pages";
import { BROKERS, TEAM_LABEL } from "@/lib/data/brokers";
import { getPosts, type Post } from "@/lib/blog/posts";
import { BLOG_FEED_PATH, CATEGORY_INFO, categoryPath, formatPostDate } from "@/lib/blog/meta";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { LPG_CARGO_DENSITY, LPG_CLASSES } from "@/lib/data/lpg-classes";
import { GLOSSARY_TERMS, GROUP_LABELS } from "@/lib/data/glossary";
import { ABOUT_FAQ, HOME_FAQ, LPG_FAQ, TANKERS_FAQ, type FaqEntry } from "@/lib/data/faqs";
import { STRAITS_FACTS, STRAITS_FAQ, STRAITS_SECTIONS } from "@/lib/data/turkish-straits";
import { COMPLIANCE_FAQ, COMPLIANCE_STEPS, SCREENING } from "@/lib/data/compliance";
import { LOCALES } from "@/lib/i18n";
import { freightCalculatorMd } from "@/lib/freight/llms";
import { companyFacts } from "@/lib/facts";
import { getGuides, type Guide } from "@/lib/guides/guides";
import { formatGuideDate, GUIDE_LANG_LABELS } from "@/lib/guides/meta";

/**
 * Generators for /llms.txt (https://llmstxt.org/) and /llms-full.txt. Both are
 * built from the same data modules as the pages, so they never drift from
 * what the site says.
 */

const url = (path: string) => new URL(path, siteConfig.url).toString();

/** Guides (chartering and route guides) vs briefs and notes (everything else). */
const isGuide = (p: Post) =>
  p.category.slug === "chartering-guides" || p.category.slug === "route-guides";

const page = (path: string) => PAGES.find((p) => p.path === path)!;
const link = (path: string) => `[${page(path).title}](${url(path)}): ${page(path).summary}`;

const formatDate = (iso: string) => formatPostDate(iso);

const faqMd = (items: FaqEntry[]) => items.map((f) => `**${f.q}**\n${f.a}`).join("\n\n");

/** The /about "at a glance" facts, word for word, then the site's caveat. */
const KEY_FACTS = () => [
  ...companyFacts().map((f) => `**${f.q}** ${f.a}`),
  `Research and reports: ${siteConfig.desks.research.email}. After hours, live fixtures: WhatsApp ${siteConfig.duty.display} (${siteConfig.duty.hours.toLowerCase().replace(/\.$/, "")}).`,
  "The site does not publish live freight rates, bunker prices or port tariffs; the freight calculator works from dated reference values, and current numbers come from the desks.",
];

/** A guide or desk page in a list: title, summary, language (Turkish pages say so). */
const guideLine = (g: Guide) =>
  `- [${g.title}](${url(g.href)}): ${g.description} (${g.kind === "landing" ? "Desk page" : "Guide"}${g.lang !== "en" ? `, in ${GUIDE_LANG_LABELS[g.lang]}` : ""}, reviewed ${formatGuideDate(g.updated)}${g.author ? `, by ${g.author.name}` : ""})`;

export function llmsTxt(): string {
  const posts = getPosts();
  const guidePages = getGuides();
  const guides = posts.filter(isGuide);
  const briefs = posts.filter((p) => !isGuide(p));
  const postLine = (p: Post) =>
    `- [${p.title}](${url(p.href)}): ${p.description} (${p.format}, ${p.dateLabel}${p.author ? `, by ${p.author.name}` : ""})`;

  return `# ${siteConfig.name}

> ${siteConfig.name} is an Istanbul-based tanker and LPG shipbroker with brokers in London and Singapore. It charters crude and product tankers and LPG, ammonia and petrochemical gas carriers on spot, time charter and COA terms, with direct broker access and a 60-minute first reply.

${KEY_FACTS()
  .map((f) => `- ${f}`)
  .join("\n")}

When citing, link the page the fact comes from. Blog posts carry their publication date; treat market commentary as of that date.

## Desks

- ${link("/tankers")}
- ${link("/lpg")}
- ${link("/contact")}

## Tools

- ${link("/freight-calculator")}

## Tanker classes

${TANKER_CLASSES.map((t) => `- [${t.shortName} chartering](${url(`/tankers/${t.slug}`)}): ${t.longName}, ${t.dwtRange}, ${t.cargoCapacity}. Routes ${t.routes.map((r) => r.code).join(", ")}.`).join("\n")}

## LPG & ammonia carrier classes

${LPG_CLASSES.map((c) => `- [${c.name} chartering](${url(`/lpg/${c.slug}`)}): ${c.longName}, ${c.capacity}. ${c.containment}.`).join("\n")}

## Guides

- ${link("/guides")}
${guidePages.map(guideLine).join("\n")}
- ${link("/turkish-straits")}
${guides.map(postLine).join("\n")}
- ${link("/glossary")}

## Market and regulatory briefs

${briefs.map(postLine).join("\n")}

## Company

- ${link("/about")}
- ${link("/brokers")}
- ${link("/compliance")}

## Blog

- ${link("/blog")}
${Object.values(CATEGORY_INFO)
  .map((c) => `- [${c.label}](${url(categoryPath(c.slug))}): ${c.description}`)
  .join("\n")}

## Other languages

${LOCALES.map((l) => `- [${l.label}](${url(`/${l.code}`)}): ${l.dict.metaTitle}`).join("\n")}

## Optional

- [Full site content in one file](${url("/llms-full.txt")}): every guide, blog post, FAQ and glossary term as plain text
- [Blog RSS feed](${url(BLOG_FEED_PATH)}): full text of every post
- [Sitemap](${url("/sitemap.xml")})
${PAGES.filter((p) => p.group === "legal")
  .map((p) => `- [${p.title}](${url(p.path)}): ${p.summary}`)
  .join("\n")}
`;
}

export function llmsFullTxt(): string {
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

  const guidePages = getGuides()
    .map(
      (g) => `### ${g.title}

Source: ${url(g.href)}
${g.kind === "landing" ? "Desk page" : "Guide"} · ${GUIDE_LANG_LABELS[g.lang]} · ${g.desk === "lpg" ? "LPG & ammonia desk" : "Tanker desk"}${g.author ? ` · by ${g.author.name}, ${g.author.title}` : ""} · last reviewed ${formatGuideDate(g.updated)}

${g.dek}

${g.text}${g.faq.length ? `\n\n${faqMd(g.faq)}` : ""}`
    )
    .join("\n\n");

  const posts = getPosts();
  const blog = posts
    .map(
      (p) => `### ${p.title}

Source: ${url(p.href)}
${p.format} · ${CATEGORY_INFO[p.category.slug].label} · ${p.desk === "lpg" ? "LPG & ammonia desk" : p.desk === "both" ? "Tanker and LPG desks" : "Tanker desk"}${p.author ? ` · by ${p.author.name}, ${p.author.title}` : ""} · published ${p.dateLabel}${p.updated ? ` · updated ${formatDate(p.updated)}` : ""}${p.gated ? " · summary online, full report on request" : ""}

${p.dek}
${p.keyTakeaways.length ? `\nKey takeaways:\n${p.keyTakeaways.map((t) => `- ${t}`).join("\n")}\n` : ""}
${p.text}${p.faq.length ? `\n\n${faqMd(p.faq)}` : ""}`
    )
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

This file contains the text of ${siteConfig.url} for language models: company facts, both desks, every ship-class guide, the Turkish Straits guide, the chartering guides (English and Turkish), compliance screening, all blog posts, FAQs and the glossary. Each section names its source URL; please cite that URL.

## ${siteConfig.name} at a glance

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

${freightCalculatorMd(url)}

## Turkish Straits transit guide

Source: ${url("/turkish-straits")}

${STRAITS_FACTS.map((f) => `- ${f.k}: ${f.v}`).join("\n")}

${STRAITS_SECTIONS.map(
  (s) =>
    `### ${s.title}\n\n${s.body.join("\n\n")}${s.list ? `\n\n${s.list.map((i) => `- ${i}`).join("\n")}` : ""}`
).join("\n\n")}

${faqMd(STRAITS_FAQ)}

## Chartering guides and desk pages

Source: ${url("/guides")}

${guidePages}

## Sanctions and compliance screening

Source: ${url("/compliance")}

${SCREENING.map((s) => `### ${s.title}\n\n${s.intro}\n\n${s.checks.map((c) => `- ${c}`).join("\n")}`).join("\n\n")}

### How screening runs

${COMPLIANCE_STEPS.map((s, i) => `${i + 1}. ${s.title}: ${s.text}`).join("\n")}

${faqMd(COMPLIANCE_FAQ)}

## Blog posts (${posts.length}, newest first)

Source: ${url("/blog")}

${blog}

## Glossary (${GLOSSARY_TERMS.length} terms)

Source: ${url("/glossary")}

${glossary}

## Notes

- The site does not publish live freight rates, bunker prices or port tariffs; the freight calculator's reference prices carry their date. Ask the desks for current numbers.
- Blog posts are dated; market commentary reflects conditions at publication.
- Overview pages exist in ${LOCALES.length} languages (${LOCALES.map((l) => l.code).join(", ")}); detailed pages, guides (${url("/guides")}) and the inquiry form are in English.
`;
}
