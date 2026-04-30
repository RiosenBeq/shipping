import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { JsonLd } from "../components/JsonLd";
import { InquiryWizard } from "./InquiryWizard";
import { buildPageMetadata, breadcrumbsLd, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact — Charter Inquiry · 60-Minute First Reply",
  description:
    "Send a charter inquiry to the LEVANTER desk. Four short steps — cargo, route, laycan, contact — and a broker replies within 60 minutes during business hours.",
  path: "/contact",
  keywords: [
    "charter inquiry",
    "tanker fixture",
    "chartering broker contact",
    "shipbroker contact",
    "Bosphorus desk",
  ],
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: "Charter Inquiry — LEVANTER",
            description:
              "Tell us what you're moving. Four short steps. A broker replies within 60 minutes.",
            path: "/contact",
            type: "ContactPage",
          }),
          breadcrumbsLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ContactPoint",
            telephone: siteConfig.phone,
            email: siteConfig.email,
            contactType: "Charter inquiry",
            availableLanguage: ["English", "Turkish", "Russian", "Arabic"],
            hoursAvailable: "Mo-Su 06:00-22:00",
            areaServed: ["Worldwide"],
          },
        ]}
      />
      <Nav />
      <main>
        <section className="ph">
          <div className="container">
            <div className="crumbs">
              <Link href="/">LEVANTER</Link>
              <span>/</span> Contact
            </div>
            <span className="eyebrow">Charter Inquiry</span>
            <h1 className="display h1">Tell us what you&apos;re moving.</h1>
            <p>
              Four short steps. A broker replies within 60 minutes during business hours. No forms
              forwarded — your inquiry lands directly on the desk that handles your cargo.
            </p>
          </div>
        </section>

        <section className="contact-shell">
          <div className="container">
            <InquiryWizard />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
