import type { Metadata } from "next";
import { ArrowDown, Mail } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
import { Section } from "@/components/site/Section";
import { BrokerCard } from "@/components/site/BrokerCard";
import { CtaBand } from "@/components/site/CtaBand";
import { BROKERS, TEAM_LABEL, TEAM_ORDER, brokersByTeam } from "@/lib/data/brokers";
import { buildPageMetadata, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

const TITLE = "Our Brokers — Tanker & LPG Chartering Team";
const DESCRIPTION =
  "Meet LEVANTER's tanker and LPG brokers in Istanbul, London and Singapore. Direct email and WhatsApp for crude, clean products, LPG and ammonia.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/brokers",
  keywords: ["LPG broker", "tanker broker", "shipbroker Istanbul", "VLGC broker", "Suezmax broker"],
});

const TEAM_INTRO: Record<(typeof TEAM_ORDER)[number], string> = {
  lpg: "VLGC to pressurised coasters, plus ammonia and petrochemical gases.",
  crude: "VLCC, Suezmax and Aframax — Black Sea, CPC, Med and the long-haul lanes.",
  clean: "LR2, LR1 and MR product tankers across the Med, Atlantic and East of Suez.",
};

export default function BrokersPage() {
  const peopleLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "LEVANTER brokers",
    itemListElement: BROKERS.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Person",
        name: b.name,
        jobTitle: b.title,
        worksFor: { "@id": `${siteConfig.url}#organization` },
        workLocation: { "@type": "Place", name: b.office },
        knowsLanguage: b.languages,
        knowsAbout: b.focus,
      },
    })),
  };

  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: TITLE,
            description: DESCRIPTION,
            path: "/brokers",
            type: "AboutPage",
          }),
          peopleLd,
        ]}
      />
      <PageHeader
        eyebrow="The team"
        title="Talk directly to the broker who works your trade."
        lead="No switchboard and no account managers. Each desk is small, senior and reachable by email or WhatsApp — and a broker replies within 60 minutes during business hours."
        crumbs={[{ name: "Team", path: "/brokers" }]}
      >
        <nav aria-label="Desks">
          <ul className="flex flex-wrap gap-2">
            {TEAM_ORDER.map((team) => (
              <li key={team}>
                <a href={`#${team}`} className="uv-chip">
                  {TEAM_LABEL[team]}
                  <span className="font-mono text-[11px] text-slate">
                    {brokersByTeam(team).length}
                    <span className="sr-only"> brokers</span>
                  </span>
                  {/* in-page jump: the arrow says it's a link (static chips have no dot) */}
                  <ArrowDown className="h-3 w-3 text-brass-ink" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>

      {TEAM_ORDER.map((team, i) => {
        const desk = team === "lpg" ? siteConfig.desks.lpg : siteConfig.desks.tankers;
        const people = brokersByTeam(team);
        return (
          <Section
            key={team}
            id={team}
            tone={i % 2 === 1 ? "sand" : "plain"}
            eyebrow={desk.label}
            title={TEAM_LABEL[team]}
            intro={TEAM_INTRO[team]}
            action={
              <a href={`mailto:${desk.email}`} className="uv-btn-outline">
                <Mail aria-hidden="true" />
                <span>
                  Email the desk<span className="sr-only"> ({desk.email})</span>
                </span>
              </a>
            }
          >
            {/* Columns by head count, so a short desk doesn't leave a hole in
                the row: 4 brokers go 4-up from xl (at lg the cards are too
                narrow for the name block and the two actions, as on the home
                and /lpg pages); smaller desks use the 3-up grid of /tankers. */}
            <ul
              className={cn(
                "grid gap-5 sm:grid-cols-2",
                people.length === 4 ? "xl:grid-cols-4" : "lg:grid-cols-3"
              )}
            >
              {people.map((b) => (
                <li key={b.name}>
                  <BrokerCard broker={b} />
                </li>
              ))}
            </ul>
          </Section>
        );
      })}

      <CtaBand />
    </>
  );
}
