import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { JsonLd } from "@/components/site/JsonLd";
import { buildPageMetadata, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const TITLE = "Terms of Use";
const DESCRIPTION =
  "The terms for using the LEVANTER website, research and LPG cargo converter. All figures are indicative.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/terms",
  keywords: ["terms of use", "terms of service", "legal"],
});

const { legalEntity, email, address } = siteConfig;

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={webPageLd({
          title: `${TITLE} — ${siteConfig.name}`,
          description: DESCRIPTION,
          path: "/terms",
        })}
      />

      <PageHeader
        eyebrow="Legal"
        title="Terms of use"
        lead="The rules for using this website and its free tools. By using the site you accept these terms."
        crumbs={[{ name: "Terms of Use", path: "/terms" }]}
      />

      <div className="container py-16">
        <article className="lv-prose">
          <p className="text-sm text-slate">
            Last updated: <time dateTime="2026-10-09">9 October 2026</time>
          </p>

          <h2>About us</h2>
          <p>
            This website is run by {legalEntity} (&ldquo;LEVANTER&rdquo;, &ldquo;we&rdquo;),{" "}
            {address.street}, {address.postalCode} {address.locality}, Türkiye. We are a chartering
            broker for crude and product tankers and for LPG and ammonia carriers. On this site we
            describe those services and publish market research and a free LPG cargo converter.
          </p>

          <h2>Information, not an offer</h2>
          <p>
            Market commentary and other figures on this site are <strong>indicative</strong> and
            given in good faith. They are not an offer to broker, charter or hedge, and they do not
            create a broking mandate. A fixture is agreed only when the parties confirm it in
            writing, for example in a recap or charter party. Always confirm current numbers with
            our desk before you rely on them.
          </p>

          <h2>LPG cargo converter</h2>
          <p>
            The converter gives indicative results only. It uses standard liquid densities and the
            filling limit you enter; actual cargo intake depends on cargo temperature, composition
            and the ship&rsquo;s certified limits. Use it for quick checks, not for commercial
            commitments, and confirm figures with a broker.
          </p>

          <h2>Research</h2>
          <p>
            Our research reflects the views of our desks at the time of writing and may change
            without notice. It is not investment advice and not a recommendation to buy, sell or
            hedge any ship, cargo or freight derivative.
          </p>

          <h2>Contacting us</h2>
          <p>
            Our inquiry forms open your own email app or WhatsApp with your message pre-filled. This
            site does not store what you type. Sending us an inquiry does not by itself create a
            broking relationship. See our <Link href="/privacy">privacy policy</Link> for how we
            handle the personal data you send.
          </p>

          <h2>Compliance</h2>
          <p>
            We screen every counterparty and ship against US (OFAC), UK (OFSI) and EU sanctions
            lists and the G7 oil price cap. We will not act on inquiries that fail our compliance
            review.
          </p>

          <h2>Using this site</h2>
          <ul>
            <li>
              The text, research, design and logo on this site belong to LEVANTER. You may quote
              short extracts with a clear credit and a link to the source page.
            </li>
            <li>
              Do not copy the site or its research in bulk, scrape it for commercial use, or try to
              disrupt or gain unauthorised access to it.
            </li>
            <li>
              Links to other sites, such as WhatsApp or LinkedIn, are for convenience. We are not
              responsible for their content or practices.
            </li>
          </ul>

          <h2>Liability</h2>
          <p>
            We take care to keep the site accurate and available, but we do not guarantee either. To
            the fullest extent the law allows, {legalEntity} is not liable for any loss or damage
            arising from use of, or reliance on, this site, its research or its tools. Nothing in
            these terms limits liability that cannot be limited by law.
          </p>

          <h2>Changes</h2>
          <p>
            We may update these terms from time to time. The date at the top shows the latest
            version. Continuing to use the site means you accept the updated terms.
          </p>

          <h2>Governing law</h2>
          <p>
            These terms are governed by the laws of the Republic of Türkiye. Disputes that cannot be
            resolved amicably will be referred to the Istanbul Arbitration Centre (ISTAC).
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms: <a href={`mailto:${email}`}>{email}</a>, or use the{" "}
            <Link href="/contact">contact page</Link>.
          </p>
        </article>
      </div>
    </>
  );
}
