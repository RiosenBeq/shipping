import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
import { Section } from "@/components/site/Section";
import { CoverageCard } from "@/components/site/CoverageCard";
import { BrokerCard } from "@/components/site/BrokerCard";
import { ReportCard } from "@/components/site/ReportCard";
import { Faq } from "@/components/site/Faq";
import { CtaBand } from "@/components/site/CtaBand";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { BROKERS } from "@/lib/data/brokers";
import { REPORTS } from "@/lib/data/research";
import { buildPageMetadata, serviceLd, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

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
    title: "Clean & products",
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

export default function TankersPage() {
  const team = BROKERS.filter((b) => b.team !== "lpg");
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
          <CoverageCard
            title="Tankers we fix"
            items={TANKER_CLASSES.map((t) => ({
              name: t.name,
              size: t.dwtRange,
              href: `/tankers/${t.slug}`,
            }))}
          />
        }
      >
        <Button asChild size="lg">
          <Link href="/contact?segment=crude">
            Send a tanker inquiry <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="light">
          <a href={`mailto:${siteConfig.desks.tankers.email}`}>
            <Mail className="h-4 w-4" /> {siteConfig.desks.tankers.email}
          </a>
        </Button>
      </PageHeader>

      <Section
        eyebrow="Fleet we cover"
        title="Five tanker sizes, two markets."
        intro="Pick a size for a quick guide to dimensions, key routes and how the business is fixed."
      >
        <div className="grid gap-10">
          {FAMILIES.map((f) => (
            <div key={f.key} className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <div>
                <h3 className="font-display text-2xl text-navy">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-slate">{f.text}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {TANKER_CLASSES.filter((t) => t.family === f.key).map((t) => (
                  <Link
                    key={t.slug}
                    href={`/tankers/${t.slug}`}
                    className="group flex flex-col rounded-lg border border-line bg-white p-5 transition-colors hover:border-navy/40"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-ink">
                      {t.longName}
                    </p>
                    <p className="mt-2 font-display text-2xl text-navy">{t.name}</p>
                    <p className="mt-2 text-sm text-slate">{t.dwtRange}</p>
                    <p className="mt-1 text-sm text-slate">
                      {t.routes.map((r) => r.code).join(" · ")}
                    </p>
                    <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-semibold text-navy group-hover:text-brass-ink">
                      {t.shortName} guide <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="sand" eyebrow="What we fix" title="Full-cycle tanker broking.">
        <dl className="grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <div key={s.title} className="border-t-2 border-brass pt-4">
              <dt className="font-semibold text-navy">{s.title}</dt>
              <dd className="mt-1.5 leading-relaxed text-slate">{s.text}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section
        eyebrow="The tanker desk"
        title="Brokers by market."
        action={
          <Button asChild variant="outline">
            <Link href="/brokers">
              Full team <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {team.map((b) => (
            <BrokerCard key={b.name} broker={b} />
          ))}
        </div>
      </Section>

      <Section tone="sand" eyebrow="Tanker research" title="Notes from the tanker desk.">
        <div className="grid gap-5 md:grid-cols-3">
          {reports.map((r) => (
            <ReportCard key={r.slug} report={r} />
          ))}
        </div>
      </Section>

      <Section eyebrow="FAQ" title="Tanker chartering questions">
        <Faq items={FAQ} />
      </Section>

      <CtaBand
        title="Have a tanker cargo or an open ship?"
        text="Send the cargo, ports and laycan — or your position. The tanker desk replies within 60 minutes during business hours."
        email={siteConfig.desks.tankers.email}
      />
    </>
  );
}
