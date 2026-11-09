import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/site/JsonLd";
import { StageHero } from "@/components/site/PageHeader";
import { CtaBand } from "@/components/site/CtaBand";
import { Faq } from "@/components/site/Faq";
import { FreightCalculator } from "@/components/site/freight/FreightCalculator";
import { BtnLabel, LinkArrow, SectionHead } from "@/components/site/inner/ui";
import { Card, StageProvider } from "@/components/site/stage";
import { FREIGHT_DATA, FREIGHT_SOURCES } from "@/lib/content/freight";
import {
  CO2_FACTOR,
  ETS_MIN_GT,
  FREIGHT_PATH,
  STRAITS_DAYLIGHT_LOA,
} from "@/lib/freight/constants";
import { fmtDate, fmtNum, fmtUsd } from "@/lib/freight/format";
import { decodeState } from "@/lib/freight/url";
import { buildPageMetadata, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { RelatedGuides } from "@/components/site/inner/RelatedGuides";

const TITLE = "Freight Calculator — Voyage Estimate, TCE & Breakeven";
const DESCRIPTION =
  "Tanker and LPG freight calculator: ballast and laden legs, Turkish Straits and canals, VLSFO and MGO, EU ETS and commissions — to TCE, breakeven and sensitivity.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: FREIGHT_PATH,
  keywords: [
    "freight calculator",
    "voyage calculator",
    "voyage estimate",
    "TCE calculator",
    "tanker freight calculator",
    "LPG freight calculator",
    "Worldscale to TCE",
    "EU ETS shipping calculator",
    "breakeven freight",
    "bunker cost calculator",
  ],
});

const FAQ = [
  {
    q: "What does the freight calculator work out?",
    a: "A voyage estimate the way a broker builds one: sea days for the ballast, laden and optional return legs at your speeds plus a weather margin; port, waiting and passage days; fuel per mode split between VLSFO and MGO; port costs, Straits and canal costs, EU ETS and commissions. It gives the voyage result, the time charter equivalent (TCE), the breakeven freight and a sensitivity grid — or, in reverse, the freight a target TCE needs.",
  },
  {
    q: "Can I use Worldscale?",
    a: "Yes: enter the Worldscale points and the flat rate for your route. Worldscale flat rates are published by the Worldscale Association under licence, so we do not include them; type the flat from your schedule and the calculator converts points to dollars per tonne, and gives the breakeven in WS points.",
  },
  {
    q: "How is the EU ETS cost worked out?",
    a: `CO₂ is the fuel burnt times its emission factor (VLSFO ${CO2_FACTOR.vlsfo}, MGO ${CO2_FACTOR.mgo}, HSFO ${CO2_FACTOR.hsfo} t CO₂ per tonne). Voyages into or out of the EU count 50%, voyages between EU ports and time at EU berths 100%; the phase-in is 100% for 2026 emissions; the result is priced at the EUA price converted to dollars. You can also set the share to 0, 50 or 100% for the whole voyage. The EU ETS covers ships of ${fmtNum(ETS_MIN_GT)} GT and above, so smaller ships (the pressurised class) open at 0%. The estimate prices CO₂ only: from 2026 methane and nitrous oxide count too, which adds roughly 1–2% for oil fuels.`,
  },
  {
    q: "Are the bunker and EUA prices live?",
    a: "No. They are reference values with the date they were last checked, shown next to each price, and they are marked when they get old. Type today's prices from your supplier for a live estimate; a link you copy keeps the prices you used.",
  },
  {
    q: "Is the result a freight offer?",
    a: "No. It is an indicative estimate from the figures on the page. For a firm estimate — current freight, bunkers, port costs and Straits timing — send the voyage to the desk with the button under the result; a broker replies within 60 minutes in business hours.",
  },
];

const METHOD = [
  {
    title: "Distances and time",
    text: `Sea days per leg are the distance ÷ (speed × 24) × (1 + weather margin). Port time is entered in days, or worked out as quantity ÷ cargo rate plus allowance hours. Waiting, passage delays and expected demurrage are idle days. In the Turkish Straits, ships of ${STRAITS_DAYLIGHT_LOA} m and over transit in daylight only, one way, and queue; smaller ships get the passage's small-ship waiting.`,
  },
  {
    title: "Fuel",
    text: "Each mode burns its own consumption: laden, ballast, working cargo, idle. Inside Emission Control Areas — the Mediterranean since May 2025, the North Sea and Channel, North America — and at berths that require 0.10% sulphur, the ship burns MGO; elsewhere its main fuel. A scrubber ship stays on HSFO.",
  },
  {
    title: "Money",
    text: "Gross freight ($/t, lump sum or Worldscale points × your flat rate) plus expected demurrage, less address commission and brokerage, less bunkers, port costs, Straits and canal costs, EU ETS and other costs, is the voyage result. Divided by the total days, it is the TCE.",
  },
  {
    title: "EU ETS",
    text: `CO₂ = fuel × emission factor, × the EU share (50% in or out of the EU, 100% between EU ports and at EU berths), × the phase-in, × the EUA price in dollars. Ships under ${fmtNum(ETS_MIN_GT)} GT are outside the scheme. CO₂ only: methane and nitrous oxide, in the scheme from 2026, would add roughly 1–2% for oil fuels.`,
  },
  {
    title: "Breakeven and sensitivity",
    text: "Breakeven is the freight at which the TCE is zero. The grid shows the TCE with freight and every bunker price 10% and 20% lower and higher.",
  },
  {
    title: "Indicative only",
    text: "Port costs and passage costs are examples for an Aframax-size ship scaled by class; reference prices carry their date. Check them, and use the distance in your charter party where there is one.",
  },
];

type Props = { searchParams: Record<string, string | string[] | undefined> };

/** The query string as the browser sent it (first value of each key). */
function queryOf(sp: Props["searchParams"]): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const first = Array.isArray(v) ? v[0] : v;
    if (first !== undefined) q.set(k, first);
  }
  return q.toString();
}

export default function FreightCalculatorPage({ searchParams }: Props) {
  // A shared link renders as it was sent, before any JavaScript runs.
  const decoded = decodeState(queryOf(searchParams), FREIGHT_DATA);
  const notice = decoded.versionMismatch
    ? "This link was made with another version of the calculator; inputs it could not read are back at their defaults."
    : decoded.ignored.length > 0
      ? "Some values in this link could not be read and are back at their defaults."
      : undefined;
  const d = FREIGHT_DATA;

  return (
    <div className="ip-page">
      <JsonLd
        data={[
          webPageLd({ title: TITLE, description: DESCRIPTION, path: FREIGHT_PATH }),
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: `${siteConfig.name} freight calculator`,
            url: `${siteConfig.url}${FREIGHT_PATH}`,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Any (web browser)",
            browserRequirements: "Requires JavaScript to change inputs",
            isAccessibleForFree: true,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            description: DESCRIPTION,
            provider: { "@id": `${siteConfig.url}#organization` },
          },
        ]}
      />
      <StageProvider plates={["V-hero", "V-ocean"]} />

      <StageHero
        plate="V-hero"
        crumbs={[{ name: "Freight calculator", path: FREIGHT_PATH }]}
        sub="Voyage estimate · TCE · breakeven"
        title="Freight calculator"
        lead="Ballast and laden legs, Straits and canal passages, VLSFO and MGO, EU ETS and commissions — worked through to the TCE, the breakeven freight and a sensitivity grid, for every tanker and gas carrier size the desks fix."
        actions={
          <>
            <a href="#calculator" className="lv-btn lv-btn--cta">
              <BtnLabel>Start the estimate</BtnLabel>
            </a>
            <a href="#method" className="lv-btn lv-btn--ghost">
              <span>How it is worked out</span>
            </a>
          </>
        }
        meta={{ label: "Reference prices", coords: `as of ${fmtDate(d.fuels.vlsfo.asOf)}` }}
        className="fc-hero"
      />

      <Card ground="paper" id="calculator" aria-labelledby="calc-title" className="ip-card fc-card">
        <div className="ip-wrap">
          <FreightCalculator
            data={d}
            initial={decoded.state}
            notice={notice}
            today={new Date().toISOString().slice(0, 10)}
          />
        </div>
      </Card>

      <Card
        ground="paper"
        id="method"
        aria-labelledby="method-title"
        className="ip-card print:hidden"
      >
        <div className="ip-wrap">
          <SectionHead
            sub="Method"
            id="method-title"
            size="sm"
            title="How the estimate is built."
            lead={`Reference values in use: VLSFO ${fmtUsd(d.fuels.vlsfo.value)}, MGO ${fmtUsd(d.fuels.mgo.value)} and HSFO ${fmtUsd(d.fuels.hsfo.value)} a tonne, EUA €${fmtNum(d.eua.value, 2)} — as of ${fmtDate(d.fuels.vlsfo.asOf)}. ${d.notice}`}
          />
          <ol className="fc-method">
            {METHOD.map((m, i) => (
              <li key={m.title}>
                <span className="t-data" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </li>
            ))}
          </ol>
          <p className="fc-sources">
            <b>Sources.</b> {FREIGHT_SOURCES}
          </p>

          <section id="faq" aria-labelledby="faq-title" className="ip-block">
            <div className="ip-faq-block">
              <div className="ip-faq-block__head">
                <div>
                  <p className="t-sub ip-sub">FAQ</p>
                  <h2 id="faq-title" className="ip-h2">
                    Calculator questions.
                  </h2>
                </div>
                <Link
                  href="/blog/worldscale-and-tce-explained-how-tanker-freight-is-quoted"
                  className="lv-link"
                >
                  <span>Worldscale and TCE explained</span>
                  <LinkArrow />
                </Link>
              </div>
              <Faq items={FAQ} />
            </div>
          </section>
          <RelatedGuides current={FREIGHT_PATH} />
        </div>
      </Card>

      <CtaBand
        title="Want a firm estimate?"
        text="Send the voyage. A broker checks current freight, bunkers, port costs and Straits timing, and replies within 60 minutes during business hours."
        email={siteConfig.email}
        inquiryHref="/contact"
      />
    </div>
  );
}
