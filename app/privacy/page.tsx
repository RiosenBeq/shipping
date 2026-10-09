import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { JsonLd } from "@/components/site/JsonLd";
import { buildPageMetadata, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const TITLE = "Privacy Policy";
const DESCRIPTION =
  "How LEVANTER handles personal data on this website and in tanker and LPG chartering work. Cookieless analytics, no tracking cookies, no stored form submissions.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/privacy",
  keywords: ["privacy policy", "KVKK", "GDPR", "data protection"],
});

const { legalEntity, email, address } = siteConfig;
const branchCities = siteConfig.offices
  .map((o) => o.city)
  .filter((c) => c !== address.locality)
  .join(" and ");

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={webPageLd({
          title: `${TITLE} — ${siteConfig.name}`,
          description: DESCRIPTION,
          path: "/privacy",
        })}
      />

      <PageHeader
        eyebrow="Legal"
        title="Privacy policy"
        lead="What personal data we receive, why we use it and the choices you have."
        crumbs={[{ name: "Privacy Policy", path: "/privacy" }]}
      />

      <div className="container py-16">
        <article className="lv-prose">
          <p className="text-sm text-slate">
            Last updated: <time dateTime="2026-10-09">9 October 2026</time>
          </p>

          <h2>Who we are</h2>
          <p>
            {legalEntity} (&ldquo;LEVANTER&rdquo;, &ldquo;we&rdquo;) is a tanker and LPG chartering
            broker. We are headquartered in {address.locality}, Türkiye, with desks in{" "}
            {branchCities}. We are the data controller (<em>veri sorumlusu</em>) for the personal
            data described here, under Türkiye&rsquo;s Personal Data Protection Law No. 6698 (KVKK)
            and, where it applies, the EU and UK GDPR.
          </p>
          <p>
            This policy covers this website and the personal data you share with us when you ask us
            to work a cargo or a ship.
          </p>

          <h2>What we collect</h2>
          <h3>When you contact us</h3>
          <p>
            Our inquiry forms do not send anything to our servers. When you press send, the form
            opens your own email app or WhatsApp with your message pre-filled. Nothing reaches us
            until you send it from there, and{" "}
            <strong>this site does not store form submissions</strong>.
          </p>
          <p>
            When you do write to us, we receive what you choose to include: usually your name,
            company, email address, phone number and the cargo, vessel, route and laycan details of
            your inquiry.
          </p>
          <h3>When you browse the site</h3>
          <p>
            We use Vercel Web Analytics and Vercel Speed Insights to count visits and measure page
            speed. Both are <strong>cookieless</strong>: they do not set cookies, do not follow you
            across other websites and do not identify you personally. They record aggregate data
            such as the page viewed, referring site, country, device and browser type, and loading
            times.
          </p>
          <p>
            Our hosting provider (Vercel) also processes technical data, such as IP addresses, in
            short-lived server logs to deliver the site and protect it from abuse.
          </p>
          <h3>When you use the LPG cargo converter</h3>
          <p>
            The converter runs entirely in your browser. We do not receive or store the figures you
            enter.
          </p>

          <h2>How we use it</h2>
          <ul>
            <li>
              To reply to your inquiry and route it to the right desk (tankers or LPG &amp;
              ammonia).
            </li>
            <li>
              To work a fixture for you: sharing the details needed with shipowners, charterers,
              other brokers and agents involved in the deal.
            </li>
            <li>
              To run sanctions and counterparty checks, keep business records and meet our other
              legal obligations.
            </li>
            <li>To understand, in aggregate, how the site is used and keep it fast.</li>
          </ul>
          <p>
            Our legal bases are the performance of a contract or steps you ask us to take before
            one, our legal obligations, and our legitimate interest in running a brokerage (KVKK
            Article 5; GDPR Article 6(1)(b), (c) and (f)). We do not sell personal data or use it
            for advertising.
          </p>

          <h2>Who we share it with</h2>
          <ul>
            <li>Counterparties to the deal you have asked us to work, only as far as needed.</li>
            <li>
              Service providers that run our website, email and messaging, such as Vercel (hosting
              and analytics), our email provider and WhatsApp when you choose to use it.
            </li>
            <li>Our own desks in {siteConfig.offices.map((o) => o.city).join(", ")}.</li>
            <li>Authorities, where the law requires it.</li>
          </ul>
          <p>
            Some of these recipients are outside Türkiye. Where we transfer personal data abroad, we
            do so under KVKK Article 9 and, where it applies, the GDPR safeguards for international
            transfers.
          </p>

          <h2>How long we keep it</h2>
          <p>
            We keep inquiries and deal correspondence for as long as we need them for the business
            relationship and for as long as Turkish commercial and tax law requires us to keep
            business records. Analytics data is held in aggregate form only.
          </p>

          <h2>Cookies</h2>
          <p>
            We do not set advertising or tracking cookies, and our analytics does not use cookies.
            That is why this site has no cookie banner. If we ever add cookies that need your
            consent, we will ask first and update this policy.
          </p>

          <h2>Your rights</h2>
          <p>
            Under KVKK Article 11 and the GDPR you can ask whether we hold your personal data, get a
            copy, have it corrected or deleted, object to or restrict its use, and ask us to
            transfer it. You can also complain to the Turkish Personal Data Protection Authority
            (KVKK Kurumu) or, in the EEA or UK, to your local data protection authority.
          </p>
          <p>
            To make a request, email <a href={`mailto:${email}`}>{email}</a> with enough detail for
            us to identify you. We reply within 30 days.
          </p>

          <h2>Contact</h2>
          <p>
            {legalEntity}, {address.street}, {address.postalCode} {address.locality}, Türkiye.
            <br />
            Email: <a href={`mailto:${email}`}>{email}</a>. You can also reach us through the{" "}
            <Link href="/contact">contact page</Link>.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this policy when our services or the law change. The date at the top shows
            the latest version. See also our <Link href="/terms">terms of use</Link>.
          </p>
        </article>
      </div>
    </>
  );
}
