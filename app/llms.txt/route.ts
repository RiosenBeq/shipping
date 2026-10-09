import { siteConfig } from "@/lib/site";
import { PAGES } from "@/lib/pages";
import { REPORTS, reportSlug } from "@/lib/data/research";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { LPG_CLASSES } from "@/lib/data/lpg-classes";
import { LOCALES } from "@/lib/i18n";

export const dynamic = "force-static";

/**
 * /llms.txt (https://llmstxt.org/) — a markdown index that helps LLM crawlers
 * understand the site's structure without parsing every page.
 */
export function GET() {
  const url = (path: string) => new URL(path, siteConfig.url).toString();
  const list = (group: string) =>
    PAGES.filter((p) => p.group === group)
      .map((p) => `- [${p.title}](${url(p.path)}): ${p.summary}`)
      .join("\n");

  const body = `# ${siteConfig.name}

> ${siteConfig.tagline}. ${siteConfig.description}

${siteConfig.legalEntity} is a shipbroker headquartered in ${siteConfig.address.locality}, Türkiye, with brokers in ${siteConfig.offices
    .slice(1)
    .map((o) => o.city)
    .join(
      " and "
    )}. It has two desks: tankers (crude and clean products) and LPG & ammonia (VLGC to small pressurised gas carriers). Contact: ${siteConfig.email}.

## Pages
${list("primary")}

## LPG carrier classes
${LPG_CLASSES.map((c) => `- [${c.name}](${url(`/lpg/${c.slug}`)}): ${c.longName} · ${c.capacity}`).join("\n")}

## Tanker classes
${TANKER_CLASSES.map((t) => `- [${t.shortName}](${url(`/tankers/${t.slug}`)}): ${t.longName} · ${t.dwtRange}`).join("\n")}

## Research
${REPORTS.map((r) => `- [${r.title}](${url(`/research/${reportSlug(r)}`)}): ${r.desc}`).join("\n")}

## Other languages
${LOCALES.map((l) => `- [${l.label}](${url(`/${l.code}`)}): ${l.dict.metaTitle}`).join("\n")}

## Optional
${list("legal")}
- [Full content for LLMs](${url("/llms-full.txt")})
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
