import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, Mail, Rss } from "lucide-react";
import { CtaBand } from "@/components/site/CtaBand";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
import { ReportCard } from "@/components/site/ReportCard";
import { Eyebrow, Section } from "@/components/site/Section";
import { REPORTS, reportDateIso, reportSlug, type Report } from "@/lib/data/research";
import { buildPageMetadata, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const TITLE = "Tanker & LPG Market Research";
const DESCRIPTION =
  "Free market notes from our tanker and LPG desks: VLGC and MGC routing, small LPG in the Black Sea and Med, Suezmax and Aframax outlooks, and charter party regulation.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/research",
  keywords: [
    "tanker market research",
    "LPG shipping market report",
    "VLGC market outlook",
    "VLGC Panama Canal routing",
    "MGC ammonia shipping",
    "small LPG carriers Black Sea",
    "Suezmax market outlook",
    "Aframax TD7",
    "Black Sea tanker market",
    "EU ETS charter party",
  ],
});

const SUBSCRIBE_MAILTO = `mailto:${siteConfig.desks.research.email}?subject=${encodeURIComponent(
  "Subscribe: LEVANTER weekly"
)}`;

const newestFirst = (a: Report, b: Report) =>
  reportDateIso(b.date).localeCompare(reportDateIso(a.date));

const SORTED = [...REPORTS].sort(newestFirst);

const DESKS = [
  {
    id: "lpg",
    eyebrow: "LPG & ammonia desk",
    title: "LPG & ammonia",
    intro:
      "VLGC routing, ammonia on midsize gas carriers, and small pressurised LPG ships in the Med and Black Sea.",
    href: "/lpg",
    linkLabel: "LPG & ammonia desk",
    reports: SORTED.filter((r) => r.desk === "lpg"),
  },
  {
    id: "tankers",
    eyebrow: "Tanker desk",
    title: "Tankers",
    intro:
      "Crude and product tanker outlooks, route guides for the main TD lanes, and the rules that shape charter parties.",
    href: "/tankers",
    linkLabel: "Tanker desk",
    reports: SORTED.filter((r) => r.desk === "tankers"),
  },
] as const;

const itemListLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "LEVANTER tanker and LPG research",
  numberOfItems: SORTED.length,
  itemListElement: SORTED.map((r, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: r.title,
    url: new URL(`/research/${reportSlug(r)}`, siteConfig.url).toString(),
  })),
};

export default function ResearchPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: TITLE,
            description: DESCRIPTION,
            path: "/research",
            type: "CollectionPage",
          }),
          itemListLd,
        ]}
      />

      <PageHeader
        eyebrow="Research"
        // non-breaking spaces: never break before the ampersand
        title={"Market notes from the tanker\u00a0&\u00a0LPG desks"}
        lead="Route guides, market outlooks and regulatory notes, written by the brokers who fix the cargoes. Free to read, with no login."
        crumbs={[{ name: "Research", path: "/research" }]}
      >
        <nav aria-label="Research desks">
          <ul className="flex flex-wrap gap-2">
            {DESKS.map((d) => (
              <li key={d.id}>
                <a href={`#${d.id}`} className="uv-chip">
                  {d.title}
                  <span className="font-mono text-[11px] text-slate">
                    {d.reports.length}
                    <span className="sr-only"> notes</span>
                  </span>
                  {/* in-page jump: the arrow says it's a link (static chips have no dot) */}
                  <ArrowDown className="h-3 w-3 text-brass-ink" aria-hidden="true" />
                </a>
              </li>
            ))}
            <li>
              <a href="/research/feed.xml" type="application/rss+xml" className="uv-chip">
                RSS feed
                <ArrowRight className="h-3 w-3 text-brass-ink rtl:rotate-180" aria-hidden="true" />
              </a>
            </li>
          </ul>
        </nav>
      </PageHeader>

      {DESKS.map((d, i) => (
        <Section
          key={d.id}
          id={d.id}
          eyebrow={d.eyebrow}
          title={d.title}
          intro={d.intro}
          className={i > 0 ? "border-t border-line" : undefined}
          action={
            <Link href={d.href} className="uv-btn-outline">
              {d.linkLabel}
              <ArrowRight aria-hidden="true" />
            </Link>
          }
        >
          {d.reports.length > 0 ? (
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {d.reports.map((r) => (
                <li key={r.slug}>
                  <ReportCard report={r} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed border-line bg-white/60 p-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-slate">New notes from this desk are on the way.</p>
              <a href={SUBSCRIBE_MAILTO} className="uv-link text-sm font-semibold text-navy">
                Get them by email
              </a>
            </div>
          )}
        </Section>
      ))}

      {/* Subscribe */}
      <section className="pb-16 md:pb-24" aria-labelledby="subscribe-title">
        <div className="container">
          <div className="relative flex flex-col gap-7 overflow-hidden rounded-lg border border-line bg-sand p-6 sm:p-8 md:flex-row md:items-center md:justify-between md:p-10">
            {/* brass hairline along the top edge, echoing the kit card's hover sweep */}
            <span
              className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brass to-brass-light"
              aria-hidden="true"
            />
            <div className="max-w-xl">
              <Eyebrow size="sm">Weekly · free · no login</Eyebrow>
              <h2
                id="subscribe-title"
                className="mt-3 font-display text-[26px] leading-tight tracking-tight text-navy md:text-[30px]"
              >
                Get the weekly note by email
              </h2>
              <p className="mt-3 leading-relaxed text-slate">
                Email the research desk and we will add you to the list. No account needed. Reply at
                any time to unsubscribe.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href={SUBSCRIBE_MAILTO} className="uv-btn">
                <Mail aria-hidden="true" />
                <span>Subscribe by email</span>
              </a>
              <a href="/research/feed.xml" type="application/rss+xml" className="uv-btn-outline">
                <Rss aria-hidden="true" />
                <span>RSS feed</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
