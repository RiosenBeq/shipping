import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { JsonLd } from "../components/JsonLd";
import { buildPageMetadata, breadcrumbsLd, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "How LEVANTER collects, uses, and protects personal data on its corporate website and through its broking workflow.",
  path: "/privacy",
  keywords: ["privacy policy", "GDPR", "data protection"],
});

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: "Privacy Policy — LEVANTER",
            description: "How LEVANTER collects and uses personal data.",
            path: "/privacy",
          }),
          breadcrumbsLd([
            { name: "Home", path: "/" },
            { name: "Privacy", path: "/privacy" },
          ]),
        ]}
      />
      <Nav />
      <main>
        <section className="ph">
          <div className="container">
            <div className="crumbs">
              <Link href="/">LEVANTER</Link>
              <span>/</span> Privacy
            </div>
            <span className="eyebrow">Legal</span>
            <h1 className="display h1">Privacy policy.</h1>
            <p>
              How {siteConfig.legalEntity} collects, uses, and protects personal data on this website
              and through the broking workflow. Last updated 30 April 2026.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container" style={{ maxWidth: 760 }}>
            <article style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              <div>
                <h2 className="display h2" style={{ marginBottom: 12 }}>
                  Who we are
                </h2>
                <p style={{ color: "var(--muted)", lineHeight: 1.65 }}>
                  {siteConfig.legalEntity} is a maritime brokerage headquartered in Istanbul, Türkiye,
                  with desks in London, Singapore, and Houston. We act as the data controller for any
                  personal data submitted via this website or shared during the broking workflow.
                </p>
              </div>
              <div>
                <h2 className="display h2" style={{ marginBottom: 12 }}>
                  What we collect
                </h2>
                <p style={{ color: "var(--muted)", lineHeight: 1.65 }}>
                  Through the charter inquiry form: name, firm, email, phone, and the cargo, route,
                  and laycan details you provide. Through analytics: anonymised usage data
                  (page views, referrer, viewport size). We do not place advertising cookies.
                </p>
              </div>
              <div>
                <h2 className="display h2" style={{ marginBottom: 12 }}>
                  How we use it
                </h2>
                <p style={{ color: "var(--muted)", lineHeight: 1.65 }}>
                  Inquiry data is routed to the broker desk that matches your cargo, used to respond
                  to your fixture, and retained as long as the commercial relationship persists.
                  Analytics data is aggregated and never tied back to you personally.
                </p>
              </div>
              <div>
                <h2 className="display h2" style={{ marginBottom: 12 }}>
                  Your rights
                </h2>
                <p style={{ color: "var(--muted)", lineHeight: 1.65 }}>
                  Under GDPR (EEA / UK), KVKK (Türkiye), and equivalent laws elsewhere, you can
                  request access, correction, or deletion of your personal data. Email{" "}
                  <a href={`mailto:${siteConfig.email}`} style={{ color: "var(--accent-brass)" }}>
                    {siteConfig.email}
                  </a>{" "}
                  with a verifiable identifier and we&apos;ll respond inside 30 days.
                </p>
              </div>
              <div>
                <h2 className="display h2" style={{ marginBottom: 12 }}>
                  Cookies
                </h2>
                <p style={{ color: "var(--muted)", lineHeight: 1.65 }}>
                  We use only strictly necessary cookies (session and CSRF tokens). No third-party
                  advertising or social media trackers are loaded on this site.
                </p>
              </div>
              <div>
                <h2 className="display h2" style={{ marginBottom: 12 }}>
                  Contact
                </h2>
                <p style={{ color: "var(--muted)", lineHeight: 1.65 }}>
                  Privacy and data-protection enquiries:{" "}
                  <a href={`mailto:${siteConfig.email}`} style={{ color: "var(--accent-brass)" }}>
                    {siteConfig.email}
                  </a>
                  . Postal address: {siteConfig.address.street}, {siteConfig.address.locality}{" "}
                  {siteConfig.address.postalCode}, {siteConfig.address.country}.
                </p>
              </div>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
