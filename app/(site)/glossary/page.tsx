import type { Metadata } from "next";
import { CtaBand } from "@/components/site/CtaBand";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
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
    <>
      <JsonLd
        data={[
          webPageLd({ title: TITLE, description: DESCRIPTION, path: "/glossary" }),
          definedTermSetLd,
        ]}
      />

      <PageHeader
        eyebrow="Reference"
        title="Tanker & LPG chartering glossary"
        lead="Short, plain-English definitions of the terms used on a fixture call. From VLGCs and semi-refrigerated ships to Worldscale, TCE and demurrage."
        crumbs={[{ name: "Glossary", path: "/glossary" }]}
      />

      {/* Wrapper bounds the sticky section nav to the glossary itself (it
          unsticks before the CTA band). */}
      <div>
        {/* Sticky under the 64px header so the sections stay one tap away on a
          long page. Always one row (swipeable where it doesn't fit) so its
          height — and the scroll-mt-14 offsets below — stay fixed. */}
        <GlossaryNav
          items={GROUPS.map((g) => ({ id: g.group, label: g.label, count: g.terms.length }))}
        />

        <div className="container py-4 md:py-8">
          {GROUPS.map((g) => (
            <section
              key={g.group}
              id={g.group}
              aria-labelledby={`${g.group}-title`}
              // html scroll-padding clears the header; this clears the sticky section nav.
              className="scroll-mt-14 border-b border-line py-12 last:border-b-0 md:py-16"
            >
              {/* count under the title on phones, to its right from sm — never
                  one or the other depending on the title's length */}
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <h2
                  id={`${g.group}-title`}
                  className="font-display text-[32px] leading-[1.12] tracking-tight text-navy md:text-[40px]"
                >
                  {g.label}
                </h2>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-slate">
                  {g.terms.length} terms
                </p>
              </div>
              <dl className="mt-8 grid gap-x-12 gap-y-2 md:mt-10 md:grid-cols-2">
                {g.terms.map((t) => (
                  <div
                    key={t.term}
                    id={termId(t.term)}
                    // `target:` — a term opened from a link (e.g. /glossary#term-vlgc) is highlighted.
                    // Straight hairline at rest; rounded only when highlighted as a link target.
                    className="scroll-mt-14 border-t border-line pb-6 pt-5 target:rounded-md target:border-transparent target:bg-sand target:px-4 target:ring-1 target:ring-brass/50 motion-safe:transition-colors"
                  >
                    <dt className="text-lg font-semibold leading-snug text-navy">{t.term}</dt>
                    <dd className="mt-2 leading-relaxed text-slate">{t.def}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>

      <CtaBand
        title="Need a term explained on a live deal?"
        text="Send the cargo, ports and laycan, or just the question. A broker replies within 60 minutes during business hours."
      />
    </>
  );
}
