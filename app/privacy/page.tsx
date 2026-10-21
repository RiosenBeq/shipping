import type { Metadata } from "next";
import { Nav } from "../components/Nav";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Footer } from "../components/Footer";
import { JsonLd } from "../components/JsonLd";
import { ContactCta } from "../components/ContactCta";
import { buildPageMetadata, breadcrumbsLd, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "How LEVANTER handles personal data: inquiries, optional cookieless analytics (with consent only), local storage, retention and your GDPR / KVKK rights.",
  path: "/privacy",
  keywords: ["privacy policy", "GDPR", "KVKK", "data protection"],
});

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Privacy", path: "/privacy" },
];

const SECTIONS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <p>
        {siteConfig.legalEntity} is a maritime brokerage headquartered in Istanbul, Türkiye, with
        desks in London, Singapore and Houston. We are the data controller for personal data you
        send us through this website or in the course of broking business.
      </p>
    ),
  },
  {
    id: "what-we-collect",
    title: "What we collect",
    body: (
      <>
        <p>
          <strong>When you contact us</strong> — by email, WhatsApp or phone — we receive the
          details you choose to share, typically your name, company, email, phone number and cargo,
          route and laycan details. The charter inquiry form does not submit anything to this
          website: it opens your own email app with the inquiry pre-filled, and we receive it only
          when you send it.
        </p>
        <p>
          <strong>Optional analytics</strong> — only if you accept in the consent banner: Vercel Web
          Analytics (page views, referrer, country and device type, without cookies) and Vercel
          Speed Insights (page-load performance). If you decline, these scripts are not loaded.
        </p>
        <p>
          <strong>Technical logs</strong> — our hosting provider processes request data such as IP
          address and browser type to deliver the site and protect it from abuse.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-it",
    title: "How we use it, and on what basis",
    body: (
      <p>
        We use inquiry data to answer you and, if you go ahead, to run the fixture or transaction —
        steps taken at your request before or under a contract. We keep business correspondence on
        the basis of our legitimate interest in maintaining client relationships and to meet
        record-keeping obligations. Analytics run only with your consent, which you can withdraw at
        any time. We do not sell personal data or use it for advertising.
      </p>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <p>
        Inquiry correspondence is kept for as long as the commercial relationship requires and for
        any longer period the law requires for business records. Analytics data is aggregated by the
        provider and is not used to identify you.
      </p>
    ),
  },
  {
    id: "providers",
    title: "Service providers and international transfers",
    body: (
      <p>
        The website is hosted, and optional analytics are provided, by Vercel Inc., which may
        process data outside Türkiye and the EEA. Email and messaging go through the providers you
        and we use (for example your email service or WhatsApp). Where data leaves Türkiye, the EEA
        or the UK, we rely on the safeguards those laws require.
      </p>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and local storage",
    body: (
      <p>
        This site does not set advertising or tracking cookies. It keeps a few preferences in your
        browser&apos;s local storage: your light/dark theme, your analytics choice, and the inputs
        you enter in the voyage estimator. You can clear them in your browser settings at any time,
        and change your analytics choice with &ldquo;Cookie settings&rdquo; in the footer.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <p>
        Under the GDPR (EEA / UK), KVKK (Türkiye) and similar laws you can ask to access, correct or
        delete your personal data, object to or restrict its use, and withdraw consent. Email{" "}
        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> with enough detail for us to
        identify you and we&apos;ll respond within 30 days. You can also complain to the Turkish
        Personal Data Protection Authority (KVKK) or your local data protection authority.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Privacy and data-protection enquiries:{" "}
        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>. Postal address:{" "}
        {siteConfig.legalEntity}, {siteConfig.address.street}, {siteConfig.address.postalCode}{" "}
        {siteConfig.address.locality}, Türkiye.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: "Privacy Policy — LEVANTER",
            description:
              "How LEVANTER handles personal data, local storage and optional analytics.",
            path: "/privacy",
            dateModified: "2026-10-21",
          }),
          breadcrumbsLd(CRUMBS),
        ]}
      />
      <Nav />
      <main id="main">
        <section className="ph">
          <div className="container">
            <Breadcrumbs crumbs={CRUMBS} />
            <span className="eyebrow">Legal</span>
            <h1 className="display h1">Privacy policy.</h1>
            <p>
              How {siteConfig.legalEntity} handles personal data on this website and in the broking
              workflow. Last updated <time dateTime="2026-10-21">21 October 2026</time>.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container" style={{ maxWidth: 760 }}>
            <article
              className="legal-copy"
              style={{ display: "flex", flexDirection: "column", gap: 32 }}
            >
              {SECTIONS.map((sec) => (
                <section key={sec.id} id={sec.id} style={{ scrollMarginTop: 96 }}>
                  <h2 className="display h2" style={{ marginBottom: 12 }}>
                    {sec.title}
                  </h2>
                  <div
                    style={{ color: "var(--muted)", lineHeight: 1.65, display: "grid", gap: 12 }}
                  >
                    {sec.body}
                  </div>
                </section>
              ))}
            </article>
          </div>
        </section>

        <ContactCta
          headline="Privacy or data question?"
          body="Send enough detail for us to identify you and we'll respond within 30 days. The desk also takes general inquiries via the same channels."
          context="privacy / data subject request"
        />
      </main>
      <Footer />
    </>
  );
}
