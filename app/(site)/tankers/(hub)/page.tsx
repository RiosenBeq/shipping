import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
import { Section } from "@/components/site/Section";
import { CoverageCard } from "@/components/site/CoverageCard";
import { BrokerCard } from "@/components/site/BrokerCard";
import { ReportCard } from "@/components/site/ReportCard";
import { Faq } from "@/components/site/Faq";
import { CtaBand } from "@/components/site/CtaBand";
import { TankerArt } from "@/components/site/VesselArt";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { BROKERS, TEAM_LABEL } from "@/lib/data/brokers";
import { REPORTS } from "@/lib/data/research";
import { buildPageMetadata, serviceLd, webPageLd } from "@/lib/seo";
import { inquiryHref } from "@/lib/inquiry";
import { siteConfig } from "@/lib/site";
import { CHIP_STATIC, cn } from "@/lib/utils";

const TITLE = "Tanker Broker — Crude & Product Tanker Chartering";
const DESCRIPTION =
  "Crude and product tanker chartering from Istanbul: VLCC, Suezmax, Aframax/LR2, LR1 and MR. Black Sea, CPC, Mediterranean and long-haul lanes — spot, time charter and COA.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/tankers",
  keywords: [
    "tanker broker",
    "tanker chartering",
    "crude tanker chartering",
    "product tanker broker",
    "Suezmax broker",
    "Aframax chartering Mediterranean",
    "Black Sea tanker broker",
    "MR tanker charter",
    "tanker broker Istanbul",
  ],
});

const FAMILIES = [
  {
    key: "crude" as const,
    title: "Crude",
    text: "Dirty tankers for crude oil and fuel oil. Our core: Black Sea and CPC Suezmaxes, cross-Med Aframaxes and VLCCs on the long-haul lanes East.",
  },
  {
    key: "clean" as const,
    title: "Clean products",
    text: "Coated tankers for gasoil, jet, gasoline and naphtha. LR1 and MR across the Med, the Atlantic basin and East of Suez.",
  },
];

const SERVICES = [
  {
    title: "Spot voyages",
    text: "Worldscale or lump sum, with laytime, demurrage and routing assumptions spelled out.",
  },
  {
    title: "Time charters",
    text: "Short and long period business for oil majors, traders and refiners.",
  },
  {
    title: "COAs",
    text: "Programme cargoes — CPC, WAF or Med refinery supply — on a planned fleet.",
  },
  {
    title: "Post-fixture & compliance",
    text: "Laytime and demurrage, claims, and sanctions / price-cap documentation on every fixture.",
  },
];

const FAQ = [
  {
    q: "Which tanker sizes do you broker?",
    a: "Crude: VLCC (270,000–320,000 dwt), Suezmax (130,000–160,000 dwt) and Aframax/LR2 (80,000–115,000 dwt). Clean: LR1 (55,000–80,000 dwt) and MR (40,000–55,000 dwt).",
  },
  {
    q: "Why use an Istanbul-based tanker broker?",
    a: "Black Sea and CPC cargoes transit the Bosphorus and Dardanelles. Being on the Straits means we price transit timing and waiting realistically and follow the regional charterers and owners every day.",
  },
  {
    q: "How do you handle sanctions and the G7 price cap?",
    a: "Counterparty screening and price-cap attestation checks run before a freight idea goes back to the charterer. We do not work inquiries that fail compliance review.",
  },
  {
    q: "How are tanker freight rates quoted?",
    a: "Spot crude and product voyages are usually quoted in Worldscale points (WS) or as a lump sum. We always show the time-charter equivalent (TCE) so offers can be compared.",
  },
];

const EYEBROW = "text-xs font-semibold uppercase tracking-[0.16em] text-brass-ink";

/** Silhouette width per class (VLCC → MR): a quiet visual size ladder. */
const ART_WIDTH: Record<string, string> = {
  vlcc: "w-full",
  suezmax: "w-[88%]",
  aframax: "w-[78%]",
  lr1: "w-[70%]",
  mr: "w-[62%]",
};

const TEAMS = ["crude", "clean"] as const;

export default function TankersPage() {
  const reports = REPORTS.filter((r) => r.desk === "tankers").slice(0, 3);

  return (
    <>
      <JsonLd
        data={[
          webPageLd({ title: TITLE, description: DESCRIPTION, path: "/tankers" }),
          serviceLd({
            name: "Tanker chartering",
            description: DESCRIPTION,
            serviceType: "Tanker shipbroking",
            path: "/tankers",
            offers: TANKER_CLASSES.map((t) => ({
              name: `${t.name} chartering`,
              path: `/tankers/${t.slug}`,
            })),
          }),
        ]}
      />

      <PageHeader
        tone="dark"
        eyebrow="Tanker desk"
        title="Crude and product tanker chartering, with the Straits on our doorstep."
        lead="VLCC to MR — spot, period and COA. Black Sea, CPC and Mediterranean business run from Istanbul, with London and Singapore covering the Atlantic and East of Suez."
        crumbs={[{ name: "Tankers", path: "/tankers" }]}
        aside={
          // Desktop only: on phones it would stack under the CTAs and repeat the
          // fleet cards that follow straight after.
          <div className="max-lg:hidden">
            <CoverageCard
              title="Tankers we fix"
              items={TANKER_CLASSES.map((t) => ({
                name: t.name,
                size: t.dwtRange,
                href: `/tankers/${t.slug}`,
              }))}
            />
          </div>
        }
      >
        <Link href={inquiryHref()} className="uv-btn uv-btn--lg w-full sm:w-auto">
          Send a tanker inquiry <ArrowRight aria-hidden="true" />
        </Link>
        {/* labelled like the class pages; the address is printed in the CTA band and footer */}
        <a
          href={`mailto:${siteConfig.desks.tankers.email}`}
          className="uv-btn-ghost-light uv-btn--lg w-full sm:w-auto"
        >
          <Mail aria-hidden="true" />
          <span>
            Email the tanker desk
            <span className="sr-only"> ({siteConfig.desks.tankers.email})</span>
          </span>
        </a>
      </PageHeader>

      {/* Fleet, grouped by market */}
      <Section
        eyebrow="Fleet we cover"
        title="Five tanker sizes, two markets."
        intro="Pick a size for a quick guide to dimensions, key routes and how the business is fixed."
      >
        <div className="grid gap-14 lg:gap-16">
          {FAMILIES.map((f) => {
            const classes = TANKER_CLASSES.filter((t) => t.family === f.key);
            return (
              <div key={f.key} className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)] xl:gap-10">
                <div className="max-w-2xl border-t border-line pt-5 xl:border-t-0 xl:pt-1">
                  <p className={EYEBROW}>
                    {classes.length} {classes.length === 1 ? "size" : "sizes"}
                  </p>
                  <h3 className="mt-2 font-display text-[28px] leading-tight text-navy">
                    {f.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-slate">{f.text}</p>
                </div>
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {classes.map((t) => (
                    <li key={t.slug} className="flex">
                      <Link
                        href={`/tankers/${t.slug}`}
                        className="uv-card w-full !gap-0 !p-0 !pb-14"
                      >
                        <div
                          aria-hidden="true"
                          // same art-panel height as the /lpg fleet cards
                          className="flex h-28 items-end justify-center border-b border-line bg-sand/60 px-6 text-navy/75"
                        >
                          <TankerArt className={`${ART_WIDTH[t.slug] ?? "w-3/4"} max-w-[260px]`} />
                        </div>
                        <div className="flex flex-1 flex-col px-6 pt-6">
                          <p className={EYEBROW}>{t.longName}</p>
                          <h4 className="uv-card__title !mt-2 font-display !text-[26px] !font-normal !leading-tight">
                            {t.name}
                          </h4>
                          <p className="tnum mt-2 text-sm">{t.dwtRange}</p>
                          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Key routes">
                            {t.routes.map((r) => (
                              <li
                                key={r.code}
                                className={cn(CHIP_STATIC, "!min-h-[28px] font-mono !text-xs")}
                              >
                                {r.code}
                              </li>
                            ))}
                          </ul>
                          <span className="uv-card__meta pt-6 font-semibold !text-navy">
                            {t.shortName} guide
                          </span>
                        </div>
                        <span className="uv-card__arrow" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Services */}
      <Section tone="sand" eyebrow="What we fix" title="Full-cycle tanker broking.">
        <dl className="grid gap-px overflow-hidden rounded-[10px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s, i) => (
            <div key={s.title} className="bg-white p-6 sm:p-7">
              <dt className="font-semibold text-navy">
                <span
                  aria-hidden="true"
                  className="mb-4 block font-mono text-xs font-medium text-brass-ink"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.title}
              </dt>
              <dd className="mt-2 leading-relaxed text-slate">{s.text}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* Team, grouped by market */}
      <Section
        eyebrow="The tanker desk"
        title="Brokers by market."
        action={
          <Link href="/brokers" className="uv-btn-outline">
            Full team <ArrowRight aria-hidden="true" />
          </Link>
        }
      >
        <div className="grid gap-12">
          {TEAMS.map((team) => (
            // Group label is not a heading: BrokerCard names are already h3 under this h2.
            <div key={team} role="group" aria-labelledby={`team-${team}`}>
              <p id={`team-${team}`} className={`${EYEBROW} flex items-center gap-3`}>
                {TEAM_LABEL[team]}
                <span aria-hidden="true" className="h-px flex-1 bg-line" />
              </p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {BROKERS.filter((b) => b.team === team).map((b) => (
                  <BrokerCard key={b.name} broker={b} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {reports.length > 0 && (
        <Section
          tone="sand"
          eyebrow="Tanker research"
          title="Notes from the tanker desk."
          action={
            <Link href="/research" className="uv-btn-outline">
              All research <ArrowRight aria-hidden="true" />
            </Link>
          }
        >
          <div className="grid gap-5 md:grid-cols-3">
            {reports.map((r) => (
              <ReportCard key={r.slug} report={r} />
            ))}
          </div>
        </Section>
      )}

      <Section eyebrow="FAQ" title="Tanker chartering questions.">
        <Faq items={FAQ} />
      </Section>

      <CtaBand
        title="Have a tanker cargo or an open ship?"
        text="Send the cargo, ports and laycan — or your position. The tanker desk replies within 60 minutes during business hours."
        email={siteConfig.desks.tankers.email}
        inquiryHref={inquiryHref()}
      />
    </>
  );
}
