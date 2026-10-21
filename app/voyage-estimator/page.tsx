import type { Metadata } from "next";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { JsonLd } from "../components/JsonLd";
import { VoyageEstimator } from "./VoyageEstimator";
import { absoluteUrl, buildPageMetadata, breadcrumbsLd, faqLd, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Voyage Estimator & TCE Calculator for Tankers",
  description:
    "Free tanker voyage estimator: indicative TCE, freight, bunker cost, P&L and CO₂ for major lanes, with EU ETS, canal dues and a WS × bunker sensitivity grid.",
  path: "/voyage-estimator",
  keywords: [
    "voyage estimator",
    "TCE calculator",
    "Worldscale to TCE",
    "tanker freight calculator",
    "bunker burn calculator",
    "EU ETS allowance calculator",
    "port disbursement",
    "canal dues",
    "Suez canal toll",
    "Turkish Straits dues",
  ],
});

const faq = [
  {
    q: "What inputs does the LEVANTER voyage estimator take?",
    a: "Vessel class, speed and consumption, lane / distance, port days, cargo and Worldscale freight, demurrage, HSFO and VLSFO bunker prices, port costs, canal or strait dues, EU ETS allowance cost, and charter type.",
  },
  {
    q: "How is TCE calculated?",
    a: "TCE per day = (revenue − total voyage costs) / total voyage days. Revenue = WS/100 × flat rate × cargo + expected demurrage. Costs include laden bunker, port bunker, port costs, canal fees, EU ETS, and brokerage.",
  },
  {
    q: "Does the estimator include EU ETS?",
    a: "Yes — the EU ETS allowance cost field maps to the cost stack and recomputes TCE/day live. The 5×5 sensitivity grid keeps EU ETS fixed while sweeping WS × bunker delta.",
  },
  {
    q: "Are the bunker prices on this page live?",
    a: "No. Bunker prices, Worldscale and port costs are your own inputs, and the default values are illustrative. Type in current numbers from your bunker supplier and agent and the model recomputes in place.",
  },
  {
    q: "Can I share or save a scenario?",
    a: "Yes. The Share button copies a URL that encodes every input; the same state also persists to localStorage on this device. Reset clears both.",
  },
];

export default function VoyageEstimatorPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: "LEVANTER Voyage Estimator",
            description:
              "Indicative TCE, freight, bunker burn, P&L, and CO₂ modelling across all major tanker lanes.",
            path: "/voyage-estimator",
          }),
          breadcrumbsLd([
            { name: "Home", path: "/" },
            { name: "Voyage estimator", path: "/voyage-estimator" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "LEVANTER Voyage Estimator",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            description:
              "Indicative TCE, freight, bunker cost, P&L and CO₂ for major tanker lanes from your own inputs.",
            url: absoluteUrl("/voyage-estimator"),
            provider: { "@id": `${siteConfig.url}#organization` },
          },
          faqLd(faq),
        ]}
      />
      <Nav active="tools" />
      <main id="main">
        <VoyageEstimator />
      </main>
      <Footer />
    </>
  );
}
