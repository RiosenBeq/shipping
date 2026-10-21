import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { JsonLd } from "../components/JsonLd";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { ContactCta } from "../components/ContactCta";
import { Button } from "@/components/ui/button";
import { absoluteUrl, buildPageMetadata, breadcrumbsLd, webPageLd } from "@/lib/seo";
import { slugify } from "@/lib/slug";
import { GLOSSARY_TERMS, GROUP_LABELS, type GlossaryTerm } from "@/lib/data/glossary";

export const metadata: Metadata = buildPageMetadata({
  title: "Chartering Glossary — Shipping Terms Explained",
  description:
    "Plain-English chartering terms: Worldscale, TCE, COA, demurrage, laytime, vessel classes, EU ETS, the G7 price cap and Turkish Straits dues.",
  path: "/glossary",
  keywords: [
    "shipping glossary",
    "chartering glossary",
    "Worldscale definition",
    "TCE explained",
    "COA contract of affreightment",
    "Suezmax definition",
    "EU ETS shipping",
    "G7 price cap",
    "HKC Hong Kong Convention",
    "laytime",
    "demurrage",
  ],
});

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Glossary", path: "/glossary" },
];

const TERMSET_ID = `${absoluteUrl("/glossary")}#termset`;

const definedTermLd = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  "@id": TERMSET_ID,
  name: "LEVANTER chartering glossary",
  url: absoluteUrl("/glossary"),
  hasDefinedTerm: GLOSSARY_TERMS.map((t) => ({
    "@type": "DefinedTerm",
    name: t.term,
    description: t.def,
    url: absoluteUrl(`/glossary#${slugify(t.term)}`),
    inDefinedTermSet: { "@id": TERMSET_ID },
  })),
};

const groups = (Object.keys(GROUP_LABELS) as GlossaryTerm["group"][]).map((g) => ({
  group: g,
  label: GROUP_LABELS[g],
  terms: GLOSSARY_TERMS.filter((t) => t.group === g),
}));

export default function GlossaryPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: "Chartering Glossary — LEVANTER",
            description:
              "Plain-English definitions of the terms used by the LEVANTER chartering desk.",
            path: "/glossary",
          }),
          breadcrumbsLd(CRUMBS),
          definedTermLd,
        ]}
      />
      <Nav />
      <main id="main">
        <section className="ph">
          <div className="container">
            <Breadcrumbs crumbs={CRUMBS} />
            <span className="eyebrow">Reference</span>
            <h1 className="display h1">Chartering glossary: shipping terms explained.</h1>
            <p>
              Plain-English definitions of every term the desk uses on a fixture call. From
              Worldscale and TCE to EU ETS phase-in and the G7 price cap — short, current, and
              practical.
            </p>
          </div>
        </section>

        {/* Quick jump */}
        <section className="section" style={{ paddingTop: 32, paddingBottom: 0 }}>
          <div className="container">
            <nav
              aria-label="Glossary sections"
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                paddingBottom: 24,
                borderBottom: "1px solid var(--hairline)",
              }}
            >
              {groups.map((g) => (
                <a
                  key={g.group}
                  href={`#${g.group}`}
                  className="route-tag"
                  style={{ fontSize: 12, padding: "6px 12px" }}
                >
                  {g.label} ({g.terms.length})
                </a>
              ))}
            </nav>
          </div>
        </section>

        {/* Sections */}
        {groups.map((g) => (
          <section key={g.group} className="section" style={{ paddingTop: 56, paddingBottom: 0 }}>
            <div className="container">
              <h2
                id={g.group}
                className="display h2"
                style={{
                  scrollMarginTop: 80,
                  marginBottom: 24,
                  paddingBottom: 12,
                  borderBottom: "1px solid var(--hairline)",
                }}
              >
                {g.label}
              </h2>
              <div className="ref-grid">
                {g.terms.map((t) => (
                  <article
                    key={t.term}
                    id={slugify(t.term)}
                    className="ref-card"
                    style={{ scrollMarginTop: 96 }}
                  >
                    <h3 className="ref-term">{t.term}</h3>
                    <p className="ref-def">{t.def}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* Run the numbers — kept as a soft tool nudge before the desk CTA */}
        <section className="section" style={{ paddingTop: 80, paddingBottom: 0 }}>
          <div className="container" style={{ maxWidth: 720, textAlign: "center" }}>
            <span className="eyebrow">Run the numbers</span>
            <h2 className="display h2" style={{ margin: "12px 0 16px" }}>
              Now put a real lane through the calculator.
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 17, lineHeight: 1.6, margin: "0 0 24px" }}>
              The voyage estimator wires every term on this page into a working TCE / freight /
              P&amp;L model.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/voyage-estimator">
                  Open voyage estimator <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <ContactCta
          headline="Stuck on a term? Ask the desk."
          body="Glossary missing something you need? Or want a working example for your specific lane? The desk replies within 60 minutes during business hours."
          context="glossary follow-up"
        />
      </main>
      <Footer />
    </>
  );
}
