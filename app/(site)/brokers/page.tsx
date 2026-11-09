import type { Metadata } from "next";
import { ArrowDown, Mail } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
import { BrokerCard, initialsColor } from "@/components/site/BrokerCard";
import { CtaBand } from "@/components/site/CtaBand";
import { Glows, Sub } from "@/components/site/inner/ui";
import { Card } from "@/components/site/stage";
import { BROKERS, TEAM_LABEL, TEAM_ORDER, brokersByTeam } from "@/lib/data/brokers";
import { buildPageMetadata, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import brokersFile from "@/content/brokers.json";
import { ICON_STROKE } from "@/components/site/iconStroke";

/** name → slug (content/brokers.json): card anchors for the blog's /brokers#slug bylines. */
const SLUG = new Map(brokersFile.brokers.map((b) => [b.name.name, b.name.slug]));

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
        ...(b.photo ? { image: new URL(b.photo, siteConfig.url).toString() } : {}),
      },
    })),
  };

  return (
    <div className="ip-page ip-page--flat">
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
        long
        title="Talk directly to the broker who works your trade."
        lead="No switchboard and no account managers. Each desk is small, senior and reachable by email or WhatsApp — and a broker replies within 60 minutes during business hours."
        crumbs={[{ name: "Team", path: "/brokers" }]}
      >
        <nav aria-label="Desks">
          <ul className="ip-chips mb-8">
            {TEAM_ORDER.map((team) => (
              <li key={team}>
                <a href={`#${team}`} className="ip-chip">
                  {TEAM_LABEL[team]}
                  <b>
                    {brokersByTeam(team).length}
                    <span className="sr-only"> brokers</span>
                  </b>
                  {/* in-page jump: the arrow says it's a link */}
                  <ArrowDown
                    className="h-3 w-3 text-brass-light"
                    aria-hidden="true"
                    strokeWidth={ICON_STROKE.cta}
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {/* The team strip (GNB): every broker, a jump to their card below. */}
        <div className="ip-strip-wrap">
          <ul className="ip-strip" aria-label="The team">
            {TEAM_ORDER.flatMap((team) => brokersByTeam(team)).map((b) => (
              <li key={b.name}>
                <a href={`#${SLUG.get(b.name) ?? ""}`} className="ip-strip__item ip-glass">
                  <span
                    className="ip-strip__av"
                    aria-hidden="true"
                    style={{ background: b.color, color: initialsColor(b.color) }}
                  >
                    {b.initials}
                  </span>
                  <span className="min-w-0">
                    <b>{b.name}</b>
                    <small>{b.title}</small>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </PageHeader>

      {/* The desks on night glass (DESIGN-V2 §10: BrokerCard as glass portrait cards). */}
      <Card
        ground="night"
        aria-label="Brokers by desk"
        className="ip-card ip-card--night ip-card--over"
      >
        <Glows />
        <div className="ip-wrap">
          {TEAM_ORDER.map((team, i) => {
            const desk = team === "lpg" ? siteConfig.desks.lpg : siteConfig.desks.tankers;
            const people = brokersByTeam(team);
            return (
              <section
                key={team}
                id={team}
                aria-labelledby={`${team}-title`}
                className={
                  i > 0
                    ? "ip-block border-t border-[var(--hair)] pt-[clamp(56px,6vw,88px)]"
                    : undefined
                }
              >
                <div className="ip-head">
                  <div>
                    <Sub>{desk.label}</Sub>
                    <h2 id={`${team}-title`} className="ip-h2">
                      {TEAM_LABEL[team]}
                    </h2>
                  </div>
                  <div className="ip-head__side">
                    <p className="t-lead">{TEAM_INTRO[team]}</p>
                    <a
                      href={`mailto:${desk.email}`}
                      className="lv-btn lv-btn--ghost lv-btn--sm gap-2.5"
                    >
                      <Mail
                        aria-hidden="true"
                        className="h-4 w-4"
                        strokeWidth={ICON_STROKE.inline}
                      />
                      <span>
                        Email the desk<span className="sr-only"> ({desk.email})</span>
                      </span>
                    </a>
                  </div>
                </div>
                {/* Columns by head count, so a short desk doesn't leave a hole in the row. */}
                <ul className={cn("ip-team", people.length === 4 && "ip-team--4")}>
                  {people.map((b) => (
                    <li key={b.name}>
                      <BrokerCard broker={b} id={SLUG.get(b.name)} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </Card>

      <CtaBand />
    </div>
  );
}
