import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { JsonLd } from "../components/JsonLd";
import { OfficesView } from "./OfficesView";
import { buildPageMetadata, breadcrumbsLd, webPageLd } from "@/lib/seo";
import { OFFICES } from "@/lib/data/offices";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Offices — Istanbul, London, Singapore, Houston",
  description:
    "Four desks across the Bosphorus, City of London, Marina Bay, and the US Gulf. 22-hour live coverage with direct broker access.",
  path: "/offices",
  keywords: [
    "Istanbul shipbroker",
    "London shipbroker",
    "Singapore shipbroker",
    "Houston shipbroker",
    "Bosphorus tanker desk",
  ],
});

const officeLocationsLd = Object.values(OFFICES).map((o) => ({
  "@context": "https://schema.org",
  "@type": "Place",
  name: `${siteConfig.name} ${o.city}`,
  address: {
    "@type": "PostalAddress",
    streetAddress: o.addr,
    addressLocality: o.city,
  },
  telephone: o.phone,
  containedInPlace: { "@id": `${siteConfig.url}#organization` },
}));

export default function OfficesPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: "LEVANTER Offices — 22-hour coverage",
            description: "Four desks. Headquartered on the Bosphorus.",
            path: "/offices",
            type: "AboutPage",
          }),
          breadcrumbsLd([
            { name: "Home", path: "/" },
            { name: "Offices", path: "/offices" },
          ]),
          ...officeLocationsLd,
        ]}
      />
      <Nav active="offices" />
      <main>
        <section className="ph">
          <div className="container">
            <div className="crumbs">
              <Link href="/">LEVANTER</Link>
              <span>/</span> Offices
            </div>
            <span className="eyebrow">Offices</span>
            <h1 className="display h1">Four desks. The sun never sets on the order book.</h1>
            <p>Headquartered on the Bosphorus. Coverage across UKC, Asia, and the US Gulf.</p>
          </div>
        </section>

        <OfficesView />

        <section className="coverage">
          <div className="container">
            <span className="eyebrow" style={{ color: "var(--accent-amber)" }}>
              Coverage
            </span>
            <h2 className="display h2">Where we cover, who we cover with.</h2>
            <p>
              Direct counterparty access in every major loading region for crude and clean. No layered
              sub-broking.
            </p>
            <div className="cov-stats">
              <div className="cov-stat">
                <div className="v">38</div>
                <div className="l">Countries · charterers</div>
              </div>
              <div className="cov-stat">
                <div className="v">120+</div>
                <div className="l">Owners on first-name terms</div>
              </div>
              <div className="cov-stat">
                <div className="v">4</div>
                <div className="l">Time zones · 22-hr coverage</div>
              </div>
              <div className="cov-stat">
                <div className="v">62 min</div>
                <div className="l">Median first reply, hand-off</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
