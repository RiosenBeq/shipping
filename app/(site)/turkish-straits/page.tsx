import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow, Section } from "@/components/site/Section";
import { ReportCard } from "@/components/site/ReportCard";
import { Faq } from "@/components/site/Faq";
import { CtaBand } from "@/components/site/CtaBand";
import { getBroker } from "@/lib/data/brokers";
import { getReportBySlug, type Report } from "@/lib/data/research";
import {
  STRAITS_FACTS,
  STRAITS_FAQ,
  STRAITS_SECTIONS,
  STRAITS_UPDATED,
} from "@/lib/data/turkish-straits";
import { articleLd, buildPageMetadata, webPageLd } from "@/lib/seo";
import { inquiryHref } from "@/lib/inquiry";
import { siteConfig } from "@/lib/site";

const PATH = "/turkish-straits";
const TITLE = "Turkish Straits Transit Guide for Tankers & LPG";
const DESCRIPTION =
  "Bosphorus and Dardanelles transits for tanker and LPG charterers: VTS rules, daylight transits, pilotage, waiting time, Montreux dues and charter clauses.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    "Turkish Straits",
    "Bosphorus transit",
    "Bosphorus tanker transit",
    "Dardanelles transit",
    "Turkish Straits waiting time",
    "Turkish Straits regulations",
    "Turkish Straits VTS",
    "Bosphorus pilotage",
    "Montreux Convention dues",
    "Turkish Straits clause",
    "Black Sea tanker",
    "TD6 Black Sea Med",
  ],
});

const RELATED = [
  "chartering-small-lpg-ships-in-the-med-and-black-sea",
  "suezmax-tightness-sustains-as-cpc-volumes-rebound",
  "laytime-and-demurrage-a-practical-guide-for-tanker-and-lpg-charters",
]
  .map(getReportBySlug)
  .filter((r): r is Report => Boolean(r));

const AUTHOR = getBroker("Mehmet Aydın");

const STRAITS_PLACES = [
  {
    "@type": "Place",
    name: "Bosphorus",
    alternateName: ["Istanbul Strait", "İstanbul Boğazı"],
    geo: { "@type": "GeoCoordinates", latitude: 41.12, longitude: 29.07 },
  },
  {
    "@type": "Place",
    name: "Dardanelles",
    alternateName: ["Çanakkale Strait", "Çanakkale Boğazı"],
    geo: { "@type": "GeoCoordinates", latitude: 40.2, longitude: 26.4 },
  },
];

export default function TurkishStraitsPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: TITLE,
            description: DESCRIPTION,
            path: PATH,
            dateModified: STRAITS_UPDATED,
            about: STRAITS_PLACES,
          }),
          articleLd({
            title: "Turkish Straits transit guide for tanker and LPG charterers",
            description: DESCRIPTION,
            path: PATH,
            datePublished: "2026-10-19",
            dateModified: STRAITS_UPDATED,
            section: "Guide",
            author: AUTHOR,
            keywords: ["Bosphorus", "Dardanelles", "Turkish Straits", "Black Sea", "tankers"],
            text: STRAITS_SECTIONS.flatMap((s) => [...s.body, ...(s.list ?? [])]).join(" "),
            type: "TechArticle",
          }),
        ]}
      />

      <PageHeader
        tone="dark"
        eyebrow="Guide · Bosphorus & Dardanelles"
        title="Turkish Straits transit guide for tanker and LPG charterers."
        lead="What the rules, the weather and the queue mean for a Black Sea fixture, and how to price the transit before you fix. Written by the brokers who work from the Bosphorus."
        crumbs={[{ name: "Turkish Straits guide", path: PATH }]}
        aside={
          <div className="uv-card uv-card--dark !gap-0 !p-6 md:!p-8">
            <Eyebrow dark size="sm">
              At a glance
            </Eyebrow>
            <dl className="mt-5 divide-y divide-white/10 border-y border-white/10">
              {STRAITS_FACTS.map((f) => (
                <div key={f.k} className="grid gap-1 py-3 text-sm sm:grid-cols-[8rem_1fr] sm:gap-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-fog">
                    {f.k}
                  </dt>
                  <dd className="leading-relaxed text-white">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        }
      >
        <Link
          href={inquiryHref({ segment: "crude" })}
          className="uv-btn uv-btn--lg w-full sm:w-auto"
        >
          Price a Black Sea voyage <ArrowRight aria-hidden="true" />
        </Link>
        <a
          href={`mailto:${siteConfig.desks.tankers.email}?subject=${encodeURIComponent("Turkish Straits question")}`}
          className="uv-btn-ghost-light uv-btn--lg w-full sm:w-auto"
        >
          <Mail aria-hidden="true" />
          <span>Ask the Istanbul desk</span>
        </a>
      </PageHeader>

      <section className="py-12 md:py-16">
        <div className="container grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16">
          <article className="lv-prose">
            {AUTHOR && (
              <p className="!mb-10 border-b border-line pb-6 text-sm text-slate">
                By <span className="font-semibold text-navy">{AUTHOR.name}</span>, {AUTHOR.title} ·{" "}
                {AUTHOR.office} · Updated{" "}
                <time dateTime={STRAITS_UPDATED} className="font-mono text-xs">
                  {new Date(STRAITS_UPDATED).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </time>
              </p>
            )}
            {STRAITS_SECTIONS.map((s) => (
              <div key={s.id}>
                <h2 id={s.id} className="scroll-mt-28">
                  {s.title}
                </h2>
                {s.body.map((p) => (
                  <p key={p.slice(0, 40)}>{p}</p>
                ))}
                {s.list && (
                  <ul>
                    {s.list.map((item) => (
                      <li key={item.slice(0, 40)}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            <p className="text-sm text-slate">
              This guide summarises how transits work in practice. It is not legal advice; the
              current regulations, VTS instructions and the ship&apos;s agent are the authority for
              any specific transit.
            </p>
          </article>

          {/* On-page contents: jump links for readers and search results. */}
          <nav aria-labelledby="toc-title" className="lg:sticky lg:top-24 lg:self-start">
            <div className="uv-card !gap-0 !p-6">
              <Eyebrow as="h2" size="sm" id="toc-title">
                On this page
              </Eyebrow>
              <ol className="mt-4 space-y-2.5 text-[15px]">
                {STRAITS_SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="uv-link text-navy">
                      {s.title}
                    </a>
                  </li>
                ))}
                <li>
                  <a href="#faq" className="uv-link text-navy">
                    Questions and answers
                  </a>
                </li>
              </ol>
            </div>
          </nav>
        </div>
      </section>

      <Section id="faq" tone="sand" eyebrow="FAQ" title="Turkish Straits questions.">
        <Faq items={STRAITS_FAQ} onSand />
      </Section>

      {RELATED.length > 0 && (
        <Section
          eyebrow="Research"
          title="Black Sea notes from the desks."
          action={
            <Link href="/research" className="uv-btn-outline">
              All research <ArrowRight aria-hidden="true" />
            </Link>
          }
        >
          <ul className="grid gap-5 md:grid-cols-3">
            {RELATED.map((r) => (
              <li key={r.slug}>
                <ReportCard report={r} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <CtaBand
        title="Fixing through the Straits?"
        text="Send the cargo, ports and laycan. A broker replies within 60 minutes during business hours, then comes back with ships, a freight idea and the transit time we have assumed."
        email={siteConfig.desks.tankers.email}
      />
    </>
  );
}
