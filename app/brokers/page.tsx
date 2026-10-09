import type { Metadata } from "next";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
import { Section } from "@/components/site/Section";
import { BrokerCard } from "@/components/site/BrokerCard";
import { CtaBand } from "@/components/site/CtaBand";
import { BROKERS, TEAM_LABEL, TEAM_ORDER, brokersByTeam } from "@/lib/data/brokers";
import { buildPageMetadata, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

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
      />

      {TEAM_ORDER.map((team, i) => (
        <Section
          key={team}
          id={team}
          tone={i % 2 === 1 ? "sand" : "plain"}
          eyebrow={team === "lpg" ? "LPG & ammonia desk" : "Tanker desk"}
          title={TEAM_LABEL[team]}
          intro={TEAM_INTRO[team]}
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {brokersByTeam(team).map((b) => (
              <BrokerCard key={b.name} broker={b} />
            ))}
          </div>
        </Section>
      ))}

      <CtaBand />
    </>
  );
}
