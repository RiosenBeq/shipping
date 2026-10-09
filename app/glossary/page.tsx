import type { Metadata } from "next";
import { CtaBand } from "@/components/site/CtaBand";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
import { GLOSSARY_TERMS, GROUP_LABELS, type GlossaryTerm } from "@/lib/data/glossary";
import { buildPageMetadata, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { slugify } from "@/lib/slug";

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

      <nav aria-label="Glossary sections" className="border-b border-line bg-white">
        <ul className="container flex flex-wrap gap-2 py-5">
          {GROUPS.map((g) => (
            <li key={g.group}>
              <a
                href={`#${g.group}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm text-navy transition-colors hover:border-navy"
              >
                {g.label}
                <span className="text-xs text-slate">{g.terms.length}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container py-4 md:py-8">
        {GROUPS.map((g) => (
          <section
            key={g.group}
            id={g.group}
            aria-labelledby={`${g.group}-title`}
            className="scroll-mt-20 border-b border-line py-12 last:border-b-0 md:py-16"
          >
            <h2
              id={`${g.group}-title`}
              className="font-display text-3xl leading-tight tracking-tight text-navy md:text-[40px]"
            >
              {g.label}
            </h2>
            <dl className="mt-8 grid gap-x-12 gap-y-8 md:mt-10 md:grid-cols-2">
              {g.terms.map((t) => (
                <div
                  key={t.term}
                  id={termId(t.term)}
                  className="scroll-mt-20 border-t border-line pt-5"
                >
                  <dt className="text-lg font-semibold text-navy">{t.term}</dt>
                  <dd className="mt-2 leading-relaxed text-slate">{t.def}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <CtaBand
        title="Need a term explained on a live deal?"
        text="Send the cargo, ports and laycan, or just the question. A broker replies within 60 minutes during business hours."
      />
    </>
  );
}
