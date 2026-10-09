import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaBand } from "@/components/site/CtaBand";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
import { ReportCard } from "@/components/site/ReportCard";
import { Section } from "@/components/site/Section";
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
        title="Market notes from the tanker & LPG desks"
        lead="Route guides, market outlooks and regulatory notes, written by the brokers who fix the cargoes. Free to read, with no login."
        crumbs={[{ name: "Research", path: "/research" }]}
      >
        {DESKS.map((d) => (
          <Button key={d.id} asChild variant="outline" size="sm">
            <a href={`#${d.id}`}>{d.title}</a>
          </Button>
        ))}
      </PageHeader>

      {DESKS.map((d, i) => (
        <Section
          key={d.id}
          id={d.id}
          eyebrow={d.eyebrow}
          title={d.title}
          intro={d.intro}
          className={i > 0 ? "scroll-mt-16 border-t border-line" : "scroll-mt-16"}
          action={
            <Link
              href={d.href}
              className="inline-flex items-center gap-2 font-semibold text-navy hover:text-brass-ink"
            >
              {d.linkLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        >
          {d.reports.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {d.reports.map((r) => (
                <ReportCard key={r.slug} report={r} />
              ))}
            </div>
          ) : (
            <p className="text-slate">New notes from this desk are on the way.</p>
          )}
        </Section>
      ))}

      {/* Subscribe */}
      <section className="pb-16 md:pb-24">
        <div className="container">
          <div className="flex flex-col gap-6 rounded-lg border border-line bg-sand/60 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl leading-tight text-navy md:text-[28px]">
                Get the weekly note by email
              </h2>
              <p className="mt-2 leading-relaxed text-slate">
                Email the research desk and we will add you to the list. No account needed. Reply at
                any time to unsubscribe.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="dark">
                <a href={SUBSCRIBE_MAILTO}>
                  <Mail className="h-4 w-4" aria-hidden="true" /> Subscribe by email
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/research/feed.xml" type="application/rss+xml">
                  <Rss className="h-4 w-4" aria-hidden="true" /> RSS feed
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
