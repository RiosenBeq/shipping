import type { Metadata } from "next";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { JsonLd } from "../components/JsonLd";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { ContactCta } from "../components/ContactCta";
import { BrokersDirectory } from "./BrokersDirectory";
import { buildPageMetadata, breadcrumbsLd, itemListLd, webPageLd } from "@/lib/seo";
import { BROKERS, brokerSlug } from "@/lib/data/brokers";

export const metadata: Metadata = buildPageMetadata({
  title: "Shipbrokers — Tanker, Dry Bulk & S&P Desks",
  description:
    "Find the LEVANTER broker for your cargo — crude, clean, chemicals, dry bulk and S&P desks in Istanbul, London, Singapore and Houston.",
  path: "/brokers",
  keywords: [
    "shipbroker contact",
    "tanker broker",
    "dry bulk broker",
    "chemical tanker broker",
    "S&P broker",
    "Istanbul shipbroker",
    "London shipbroker",
    "Singapore shipbroker",
  ],
});

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Brokers", path: "/brokers" },
];

export default function BrokersPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: "LEVANTER Brokers — Direct desk access",
            description:
              "Brokers across crude, clean, chemicals, dry bulk and S&P, filterable by class or office.",
            path: "/brokers",
            type: "CollectionPage",
          }),
          breadcrumbsLd(CRUMBS),
          itemListLd(
            "LEVANTER brokers",
            BROKERS.map((b) => ({ name: b.name, path: `/brokers/${brokerSlug(b)}` }))
          ),
        ]}
      />
      <Nav active="brokers" />
      <main id="main">
        <section className="ph">
          <div className="container">
            <Breadcrumbs crumbs={CRUMBS} />
            <span className="eyebrow">Find a broker</span>
            <h1 className="display h1">
              Shipbrokers by desk: tankers, dry bulk, chemicals and S&amp;P.
            </h1>
            <p>Filter by sector, vessel class or office, then call the desk directly.</p>
          </div>
        </section>
        <BrokersDirectory />
        <ContactCta
          headline="Can't find the right broker?"
          body="Tell us the cargo and the lift window — we'll route you to the desk that handles it. No forms forwarded, no phone tag."
          context="broker introduction"
        />
      </main>
      <Footer />
    </>
  );
}
