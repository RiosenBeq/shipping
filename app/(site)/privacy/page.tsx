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

/** In-page contents; ids match the h2s below. */
const TOC = [
  { id: "who", label: "Who we are" },
  { id: "collect", label: "What we collect" },
  { id: "use", label: "How we use it" },
  { id: "share", label: "Who we share it with" },
  { id: "retention", label: "How long we keep it" },
  { id: "cookies", label: "Cookies" },
  { id: "rights", label: "Your rights" },
  { id: "contact", label: "Contact" },
  { id: "changes", label: "Changes to this policy" },
] as const;

const AT_A_GLANCE = [
  { title: "No tracking cookies", text: "Analytics is cookieless and counted in aggregate only." },
  { title: "Forms aren’t stored", text: "Inquiries open your own email app or WhatsApp." },
  { title: "Your data, your call", text: "See, correct or delete it. We reply within 30 days." },
] as const;

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
      >
        <span className="uv-chip">
          Last updated <time dateTime="2026-10-09">9 October 2026</time>
        </span>
      </PageHeader>

      <div className="container grid gap-10 py-14 md:py-20 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-16 xl:gap-24">
        {/* Contents: sticky side list on desktop, a collapsed accordion on phones. */}
        <nav
          aria-label="On this page"
          className="hidden lg:sticky lg:top-24 lg:block lg:self-start"
        >
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-brass-ink">
            <span className="h-px w-6 bg-brass" aria-hidden="true" />
            On this page
          </p>
          <ol className="mt-4 space-y-1 border-l border-line pl-4">
            {TOC.map((t) => (
              <li key={t.id}>
                {/* `!` — the kit's nav-link padding/size load after Tailwind. */}
                <a href={`#${t.id}`} className="uv-nav-link !py-1 !text-sm">
                  {t.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="min-w-0">
          <ul className="mb-12 grid max-w-prose gap-3 sm:grid-cols-3" aria-label="At a glance">
            {AT_A_GLANCE.map((g) => (
              <li key={g.title} className="uv-card !gap-1.5 !p-5">
                <p className="font-semibold leading-snug text-navy">{g.title}</p>
                <p className="text-sm leading-relaxed">{g.text}</p>
              </li>
            ))}
          </ul>

          <details className="uv-accordion mb-10 max-w-prose border-t border-line lg:hidden">
            <summary>
              <span>On this page</span>
              <span className="uv-accordion__icon" aria-hidden="true" />
            </summary>
            <nav aria-label="On this page" className="uv-accordion__body">
              <ol className="space-y-1 border-l border-line pl-4">
                {TOC.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="uv-nav-link">
                      {t.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </details>

          <div className="lv-prose">
            <h2 id="who">Who we are</h2>
            <p>
              {legalEntity} (&ldquo;LEVANTER&rdquo;, &ldquo;we&rdquo;) is a tanker and LPG
              chartering broker. We are headquartered in {address.locality}, Türkiye, with desks in{" "}
              {branchCities}. We are the data controller (<em>veri sorumlusu</em>) for the personal
              data described here, under Türkiye&rsquo;s Personal Data Protection Law No. 6698
              (KVKK) and, where it applies, the EU and UK GDPR.
            </p>
            <p>
              This policy covers this website and the personal data you share with us when you ask
              us to work a cargo or a ship.
            </p>

            <h2 id="collect">What we collect</h2>
            <h3>When you contact us</h3>
            <p>
              Our inquiry forms do not send anything to our servers. When you press send, the form
              opens your own email app or WhatsApp with your message pre-filled. Nothing reaches us
              until you send it from there, and{" "}
              <strong>this site does not store form submissions</strong>.
            </p>
            <p>
              When you do write to us, we receive what you choose to include: usually your name,
              company, email address, phone number and the cargo, vessel, route and laycan details
              of your inquiry.
            </p>
            <h3>When you browse the site</h3>
            <p>
              We use Vercel Web Analytics and Vercel Speed Insights to count visits and measure page
              speed. Both are <strong>cookieless</strong>: they do not set cookies, do not follow
              you across other websites and do not identify you personally. They record aggregate
              data such as the page viewed, referring site, country, device and browser type, and
              loading times.
            </p>
            <p>
              Our hosting provider (Vercel) also processes technical data, such as IP addresses, in
              short-lived server logs to deliver the site and protect it from abuse.
            </p>
            <h3>When you use the LPG cargo converter</h3>
            <p>
              The converter runs entirely in your browser. We do not receive or store the figures
              you enter.
            </p>

            <h2 id="use">How we use it</h2>
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
              Article 5; GDPR Article 6(1)(b),{" "}
              {/* Manrope's ligatures would turn "(c)" into "©" in this legal reference. */}
              <span className="[font-feature-settings:'calt'_0,'liga'_0,'dlig'_0] [font-variant-ligatures:none]">
                (c)
              </span>{" "}
              and (f)). We do not sell personal data or use it for advertising.
            </p>

            <h2 id="share">Who we share it with</h2>
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
              Some of these recipients are outside Türkiye. Where we transfer personal data abroad,
              we do so under KVKK Article 9 and, where it applies, the GDPR safeguards for
              international transfers.
            </p>

            <h2 id="retention">How long we keep it</h2>
            <p>
              We keep inquiries and deal correspondence for as long as we need them for the business
              relationship and for as long as Turkish commercial and tax law requires us to keep
              business records. Analytics data is held in aggregate form only.
            </p>

            <h2 id="cookies">Cookies</h2>
            <p>
              We do not set advertising or tracking cookies, and our analytics does not use cookies.
              That is why this site has no cookie banner. If we ever add cookies that need your
              consent, we will ask first and update this policy.
            </p>

            <h2 id="rights">Your rights</h2>
            <p>
              Under KVKK Article 11 and the GDPR you can ask whether we hold your personal data, get
              a copy, have it corrected or deleted, object to or restrict its use, and ask us to
              transfer it. You can also complain to the Turkish Personal Data Protection Authority
              (KVKK Kurumu) or, in the EEA or UK, to your local data protection authority.
            </p>
            <p>
              To make a request, email <a href={`mailto:${email}`}>{email}</a> with enough detail
              for us to identify you. We reply within 30 days.
            </p>

            <h2 id="contact">Contact</h2>
            <p>
              {legalEntity}, {address.street}, {address.postalCode} {address.locality}, Türkiye.
              <br />
              Email: <a href={`mailto:${email}`}>{email}</a>. You can also reach us through the{" "}
              <Link href="/contact">contact page</Link>.
            </p>

            <h2 id="changes">Changes to this policy</h2>
            <p>
              We may update this policy when our services or the law change. The date at the top
              shows the latest version. See also our <Link href="/terms">terms of use</Link>.
            </p>
          </div>
        </article>
      </div>
    </>
  );
}
