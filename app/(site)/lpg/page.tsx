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
import { GasCarrierArt, PressurisedGasArt } from "@/components/site/VesselArt";
import { LPG_CLASSES } from "@/lib/data/lpg-classes";
import { brokersByTeam } from "@/lib/data/brokers";
import { REPORTS } from "@/lib/data/research";
import { buildPageMetadata, serviceLd, webPageLd } from "@/lib/seo";
import { inquiryHref } from "@/lib/inquiry";
import { siteConfig } from "@/lib/site";
import { LpgConverter } from "./LpgConverter";

const TITLE = "LPG Shipbroker — VLGC, MGC & Ammonia Chartering";
const DESCRIPTION =
  "LPG and ammonia chartering from Istanbul: VLGC, MGC, Handysize and pressurised gas carriers. Spot, time charter and COA for propane, butane, ammonia and petrochemical gases.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/lpg",
  keywords: [
    "LPG shipbroker",
    "LPG broker",
    "LPG carrier chartering",
    "VLGC chartering",
    "MGC charter",
    "ammonia carrier chartering",
    "semi-refrigerated LPG carrier",
    "pressurised LPG carrier",
    "LPG broker Istanbul",
    "Mediterranean LPG shipping",
  ],
});

const SERVICES = [
  {
    title: "Spot voyages",
    text: "Single cargoes and relets, priced in $/mt with the routing and port-time assumptions shown.",
  },
  {
    title: "Time charters",
    text: "Period business from 6 months to multi-year, for importers, traders and end-users.",
  },
  {
    title: "Contracts of affreightment",
    text: "Regular programmes — LPG distribution or ammonia supply — with a fleet that fits your terminals.",
  },
  {
    title: "Post-fixture",
    text: "Voyage follow-up, laytime and demurrage calculations, and claims through to settlement.",
  },
];

const CARGOES = ["Propane", "Butane", "Ammonia", "Propylene", "Butadiene", "VCM"];

const FOCUS = [
  {
    title: "Med, Black Sea & Türkiye",
    text: "Small pressurised and semi-refrigerated LPG into Turkish, East Med and Black Sea terminals — with Straits timing priced in.",
  },
  {
    title: "VLGC export lanes",
    text: "US Gulf and Middle East Gulf exports to Asia and Europe, benchmarked against BLPG1–3 and priced Panama vs. Cape.",
  },
  {
    title: "Ammonia & petchem gases",
    text: "MGC ammonia lanes and Handysize petrochemical parcels, including grade-switch planning.",
  },
];

const FAQ = [
  {
    q: "What size LPG carriers do you charter?",
    a: "The full range: VLGCs (70,000 cbm and above), MGCs (25,000–50,000 cbm), Handysize gas carriers (15,000–25,000 cbm) and small pressurised or semi-refrigerated ships below 15,000 cbm.",
  },
  {
    q: "How is LPG freight quoted?",
    a: "Spot voyages are usually quoted in US dollars per metric tonne ($/mt). Time charters are quoted per month or per day. We always show the equivalent time-charter earnings (TCE) so offers can be compared.",
  },
  {
    q: "Do you handle ammonia cargoes?",
    a: "Yes. Ammonia moves mainly on fully refrigerated MGCs and on suitable Handysize ships. We check ammonia certification, previous cargoes and terminal requirements before fixing.",
  },
  {
    q: "Can you help with LPG imports into Türkiye?",
    a: "Yes. Our Istanbul LPG desk works with importers and distributors on small and mid-size ships into Turkish terminals, including Bosphorus and Dardanelles transit planning.",
  },
];

const EYEBROW = "text-xs font-semibold uppercase tracking-[0.16em] text-brass-ink";

/** Silhouette width per class (VLGC → pressurised): a quiet visual size ladder. */
const ART_WIDTH = ["w-full", "w-[84%]", "w-[70%]", "w-[56%]"];

export default function LpgPage() {
  const team = brokersByTeam("lpg");
  const reports = REPORTS.filter((r) => r.desk === "lpg").slice(0, 3);

  return (
    <>
      <JsonLd
        data={[
          webPageLd({ title: TITLE, description: DESCRIPTION, path: "/lpg" }),
          serviceLd({
            name: "LPG and ammonia chartering",
            description: DESCRIPTION,
            serviceType: "LPG shipbroking",
            path: "/lpg",
            offers: LPG_CLASSES.map((c) => ({
              name: `${c.name} chartering`,
              path: `/lpg/${c.slug}`,
            })),
          }),
        ]}
      />

      <PageHeader
        tone="dark"
        eyebrow="LPG & ammonia desk"
        title="LPG and ammonia chartering, from VLGCs to pressurised coasters."
        lead="Propane, butane, ammonia and petrochemical gases — spot, period and COA. One desk that follows every size of gas carrier, run from Istanbul with brokers in London and Singapore."
        crumbs={[{ name: "LPG & Ammonia", path: "/lpg" }]}
        aside={
          <CoverageCard
            title="Gas carriers we fix"
            items={LPG_CLASSES.map((c) => ({
              name: c.name,
              size: c.capacity.split(" — ")[0],
              href: `/lpg/${c.slug}`,
            }))}
          />
        }
      >
        <Link href={inquiryHref({ segment: "lpg" })} className="uv-btn uv-btn--lg w-full sm:w-auto">
          Send an LPG inquiry <ArrowRight aria-hidden="true" />
        </Link>
        <a
          href={`mailto:${siteConfig.desks.lpg.email}`}
          className="uv-btn-ghost-light uv-btn--lg w-full sm:w-auto"
        >
          <Mail aria-hidden="true" />
          <span>{siteConfig.desks.lpg.email}</span>
        </a>
      </PageHeader>

      {/* Fleet */}
      <Section
        eyebrow="Fleet we cover"
        title="Every size of gas carrier."
        intro="Each segment trades differently. Pick the ship size for a quick guide to capacities, cargoes and routes — or just send us the cargo and we will advise."
      >
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {LPG_CLASSES.map((c, i) => {
            // Pressurised coasters carry cylindrical deck tanks, not a refrigerated trunk deck.
            const Art = c.slug === "pressurised" ? PressurisedGasArt : GasCarrierArt;
            return (
              <li key={c.slug} className="flex">
                <Link href={`/lpg/${c.slug}`} className="uv-card w-full !gap-0 !p-0 !pb-14">
                  <div
                    aria-hidden="true"
                    className="flex h-28 items-end justify-center border-b border-line bg-sand/60 px-6 text-navy/75"
                  >
                    <Art className={`${ART_WIDTH[i] ?? "w-1/2"} max-w-[260px]`} />
                  </div>
                  <div className="flex flex-1 flex-col px-6 pt-6">
                    {/* two-line minimum in the 4-up row, so a wrapped eyebrow
                      ("Pressurised & semi-ref coasters") doesn't push its card's
                      title below the others */}
                    <p className={`${EYEBROW} xl:min-h-[2lh]`}>{c.longName}</p>
                    <h3 className="uv-card__title !mt-2 font-display !text-[26px] !font-normal !leading-tight">
                      {c.name}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed">{c.capacity}</p>
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {c.cargoes.slice(0, 3).map((g) => (
                        <li key={g} className="uv-chip !min-h-[28px] !text-xs">
                          {g}
                        </li>
                      ))}
                    </ul>
                    <span className="uv-card__meta pt-6 font-semibold !text-navy">
                      {c.name} guide
                    </span>
                  </div>
                  <span className="uv-card__arrow" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* Services */}
      <Section tone="sand" eyebrow="What we fix" title="From first idea to final demurrage.">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-8">
          <dl className="grid gap-px overflow-hidden rounded-[10px] border border-line bg-line sm:grid-cols-2">
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
          <div className="uv-card !gap-0 !p-6 sm:!p-7">
            <h3 className={EYEBROW}>Cargoes</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {CARGOES.map((c) => (
                <li key={c} className="uv-chip">
                  {c}
                </li>
              ))}
            </ul>
            <h3 className={`mt-8 ${EYEBROW}`}>Where we focus</h3>
            <ul className="mt-2 divide-y divide-line">
              {FOCUS.map((f) => (
                <li key={f.title} className="py-4 last:pb-0">
                  <p className="font-semibold text-navy">{f.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate">{f.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Converter (physical densities only — no market data) */}
      <Section
        id="converter"
        eyebrow="Free tool"
        title="LPG cargo converter: cbm ↔ tonnes."
        intro="Quickly check how many tonnes fit in a ship's tanks — or how much capacity a parcel needs — for propane, butane, ammonia and petrochemical gases."
      >
        <LpgConverter />
      </Section>

      {/* Team */}
      <Section
        tone="sand"
        eyebrow="The LPG desk"
        title="Gas brokers by segment."
        action={
          <Link href="/brokers" className="uv-btn-outline">
            Full team <ArrowRight aria-hidden="true" />
          </Link>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {team.map((b) => (
            <BrokerCard key={b.name} broker={b} />
          ))}
        </div>
      </Section>

      {reports.length > 0 && (
        <Section
          eyebrow="LPG research"
          title="Notes from the gas desk."
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

      <Section tone="sand" eyebrow="FAQ" title="LPG chartering questions.">
        <Faq items={FAQ} onSand />
      </Section>

      <CtaBand
        title="Have an LPG or ammonia cargo?"
        text="Send the grade, quantity, ports and laycan. The LPG desk replies within 60 minutes during business hours."
        email={siteConfig.desks.lpg.email}
        inquiryHref={inquiryHref({ segment: "lpg" })}
      />
    </>
  );
}
