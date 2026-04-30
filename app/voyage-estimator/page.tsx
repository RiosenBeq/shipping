import type { Metadata } from "next";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { JsonLd } from "../components/JsonLd";
import { VoyageEstimator } from "./VoyageEstimator";
import { buildPageMetadata, breadcrumbsLd, faqLd, webPageLd } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Voyage Estimator — TCE, Freight, Bunker Burn & P&L",
  description:
    "Indicative TCE, freight, bunker burn, P&L, and CO₂ modelling across all major tanker lanes. You set the bunker, WS, and port costs; the calculator does the rest.",
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
    "Bosphorus dues",
  ],
});

const faq = [
  {
    q: "What inputs does the LEVANTER voyage estimator take?",
    a: "Vessel class, speed and consumption, lane / distance, port days, cargo and Worldscale freight, demurrage, HSFO and VLSFO bunker prices, port costs, canal or SECA fees, EU ETS allowance, and charter type.",
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
    a: "No — the bunker prices are user-editable inputs in the Calculator. Type in your own VLSFO / HSFO numbers from your bunker provider and the model recomputes in place.",
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
            { name: "Tools", path: "/voyage-estimator" },
            { name: "Voyage Estimator", path: "/voyage-estimator" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "LEVANTER Voyage Estimator",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            description:
              "Calculate TCE, freight, bunker burn, P&L, and CO₂ for any major tanker lane.",
          },
          faqLd(faq),
        ]}
      />
      <Nav active="tools" />
      <main>
        <VoyageEstimator />
      </main>
      <Footer />
    </>
  );
}
