import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { JsonLd } from "../components/JsonLd";
import { BrokersDirectory } from "./BrokersDirectory";
import { buildPageMetadata, breadcrumbsLd, webPageLd } from "@/lib/seo";
import { BROKERS } from "@/lib/data/brokers";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Find a Broker — Tanker, Bulk, Chemicals, S&P",
  description:
    "Direct access to the LEVANTER broker desk. Filter 14 brokers by sector, vessel class, or office. Real brokers, no forms forwarded.",
  path: "/brokers",
  keywords: [
    "shipping broker directory",
    "tanker broker",
    "dry bulk broker",
    "chemicals broker",
    "S&P broker",
    "Istanbul shipbroker",
    "London shipbroker",
    "Singapore shipbroker",
  ],
});

const brokerCollectionLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "LEVANTER broker desk",
  numberOfItems: BROKERS.length,
  itemListElement: BROKERS.map((b, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Person",
      name: b.name,
      jobTitle: b.title,
      worksFor: { "@id": `${siteConfig.url}#organization` },
      workLocation: { "@type": "Place", name: b.desk },
    },
  })),
};

export default function BrokersPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: "LEVANTER Brokers — Direct desk access",
            description:
              "Filter 14 brokers across crude, clean, chemicals, dry bulk, and S&P by class or desk.",
            path: "/brokers",
            type: "CollectionPage",
          }),
          breadcrumbsLd([
            { name: "Home", path: "/" },
            { name: "Brokers", path: "/brokers" },
          ]),
          brokerCollectionLd,
        ]}
      />
      <Nav active="brokers" />
      <main>
        <section className="ph">
          <div className="container">
            <div className="crumbs">
              <Link href="/">LEVANTER</Link>
              <span>/</span> Brokers
            </div>
            <span className="eyebrow">Find a broker</span>
            <h1 className="display h1">Direct access. Real brokers.</h1>
            <p>Filter by sector, class, or desk. Call them. No forms forwarded.</p>
          </div>
        </section>
        <BrokersDirectory />
      </main>
      <Footer />
    </>
  );
}
