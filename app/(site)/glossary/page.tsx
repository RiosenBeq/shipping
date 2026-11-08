import type { Metadata } from "next";
import { CtaBand } from "@/components/site/CtaBand";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
import { Card } from "@/components/site/stage";
import { GLOSSARY_TERMS, GROUP_LABELS, type GlossaryTerm } from "@/lib/data/glossary";
import { buildPageMetadata, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { slugify } from "@/lib/slug";
import { GlossaryNav } from "./GlossaryNav";

const TITLE = "Tanker & LPG Chartering Glossary";
const DESCRIPTION =
  "Plain-English definitions of tanker and LPG chartering terms: VLGC, MGC, semi-refrigerated ships, cbm, Worldscale, TCE, demurrage, laytime, EU ETS and more.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/glossary",
  keywords: [
    "tanker chartering glossary",
    "LPG shipping glossary",
    "VLGC meaning",
    "MGC midsize gas carrier",
    "semi-refrigerated LPG carrier",
    "fully pressurised gas carrier",
    "cbm gas carrier capacity",
    "Worldscale explained",
    "TCE time charter equivalent",
    "demurrage definition",
    "laytime and laycan",
    "COA contract of affreightment",
  ],
});

type Group = GlossaryTerm["group"];

/** GROUP_LABELS order, with LPG & gas first — it is a core desk. */
const GROUP_ORDER: Group[] = [
  "gas",
  ...(Object.keys(GROUP_LABELS) as Group[]).filter((g) => g !== "gas"),
];

const GROUPS = GROUP_ORDER.map((group) => ({
  group,
  label: GROUP_LABELS[group],
  terms: GLOSSARY_TERMS.filter((t) => t.group === group),
})).filter((g) => g.terms.length > 0);

const PAGE_URL = new URL("/glossary", siteConfig.url).toString();
const TERMSET_ID = `${PAGE_URL}#termset`;
const termId = (term: string) => `term-${slugify(term)}`;

const definedTermSetLd = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  "@id": TERMSET_ID,
  name: "LEVANTER tanker & LPG chartering glossary",
  url: PAGE_URL,
  hasDefinedTerm: GLOSSARY_TERMS.map((t) => ({
    "@type": "DefinedTerm",
    "@id": `${PAGE_URL}#${termId(t.term)}`,
    name: t.term,
    description: t.def,
    inDefinedTermSet: { "@id": TERMSET_ID },
  })),
};

export default function GlossaryPage() {
  return (
    <div className="ip-page ip-page--flat">
      <JsonLd
        data={[
          webPageLd({ title: TITLE, description: DESCRIPTION, path: "/glossary" }),
          definedTermSetLd,
        ]}
      />

      <PageHeader
        eyebrow="Reference"
        long
        title="Tanker & LPG chartering glossary"
        lead="Short, plain-English definitions of the terms used on a fixture call. From VLGCs and semi-refrigerated ships to Worldscale, TCE and demurrage."
        crumbs={[{ name: "Glossary", path: "/glossary" }]}
      />

      {/* The card bounds the sticky section nav to the glossary itself. */}
      <Card ground="paper" aria-label="Glossary" className="ip-card ip-card--over">
        <div className="ip-wrap">
          {/* Sticky under the header so the sections stay one tap away on a long page. */}
          <GlossaryNav
            items={GROUPS.map((g) => ({ id: g.group, label: g.label, count: g.terms.length }))}
          />

          {GROUPS.map((g) => (
            <section
              key={g.group}
              id={g.group}
              aria-labelledby={`${g.group}-title`}
              // html scroll-padding clears the header; this clears the sticky section nav.
              className="ip-gsection"
            >
              <div className="ip-gsection__head">
                <h2 id={`${g.group}-title`} className="ip-h2">
                  {g.label}
                </h2>
                <p className="t-data">{g.terms.length} terms</p>
              </div>
              <dl className="ip-terms">
                {g.terms.map((t) => (
                  // `:target` — a term opened from a link (e.g. /glossary#term-vlgc) is highlighted.
                  <div key={t.term} id={termId(t.term)}>
                    <dt>{t.term}</dt>
                    <dd>{t.def}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </Card>

      <CtaBand
        title="Need a term explained on a live deal?"
        text="Send the cargo, ports and laycan, or just the question. A broker replies within 60 minutes during business hours."
      />
    </div>
  );
}
