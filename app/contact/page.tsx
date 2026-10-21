import type { Metadata } from "next";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { JsonLd } from "../components/JsonLd";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { InquiryWizard } from "./InquiryWizard";
import { buildPageMetadata, breadcrumbsLd, webPageLd } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Charter Inquiry — Contact the Desk",
  description:
    "Send a charter inquiry to the LEVANTER desk in four short steps — cargo, route, laycan, contact. A broker replies within 60 minutes during business hours.",
  path: "/contact",
  keywords: [
    "charter inquiry",
    "tanker charter inquiry",
    "dry bulk charter inquiry",
    "shipbroker contact",
    "Istanbul shipbroker contact",
  ],
});

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Charter inquiry", path: "/contact" },
];

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: "Charter Inquiry — LEVANTER",
            description:
              "Tell us what you're moving. Four short steps. A broker replies within 60 minutes during business hours.",
            path: "/contact",
            type: "ContactPage",
          }),
          breadcrumbsLd(CRUMBS),
        ]}
      />
      <Nav active="contact" />
      <main id="main">
        <section className="ph">
          <div className="container">
            <Breadcrumbs crumbs={CRUMBS} />
            <span className="eyebrow">Charter inquiry</span>
            <h1 className="display h1">Send a charter inquiry.</h1>
            <p>
              Tell us what you&apos;re moving in four short steps. A broker replies within 60
              minutes during business hours, from the desk that handles your cargo.
            </p>
          </div>
        </section>

        <section className="contact-shell" aria-label="Charter inquiry form">
          <div className="container">
            <InquiryWizard />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
