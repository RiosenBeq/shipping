import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
import { buildPageMetadata, localBusinessLd, webPageLd } from "@/lib/seo";
import { siteConfig, telUrl, whatsappUrl } from "@/lib/site";
import { CopyButton, InquiryForm } from "./InquiryForm";

const TITLE = "Contact — Send a Tanker or LPG Charter Inquiry";
const DESCRIPTION =
  "Send a tanker or LPG charter inquiry to LEVANTER in Istanbul. Cargo, ports and laycan — a broker replies within 60 minutes during business hours. Email, phone or WhatsApp.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/contact",
  keywords: [
    "charter inquiry",
    "LPG broker contact",
    "tanker broker contact",
    "shipbroker Istanbul",
  ],
});

const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${siteConfig.geo.latitude},${siteConfig.geo.longitude}`;

/** Small brass-ink label used for the aside's section headings. */
const ASIDE_H2 =
  "flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-brass-ink";

export default function ContactPage() {
  const lines = [
    {
      Icon: Mail,
      label: siteConfig.desks.tankers.label,
      value: siteConfig.desks.tankers.email,
      href: `mailto:${siteConfig.desks.tankers.email}`,
      copy: "Copy email",
      // Accessible names start with the visible tooltip text (WCAG 2.5.3).
      copyLabel: "Copy email, tanker desk",
    },
    {
      Icon: Mail,
      label: siteConfig.desks.lpg.label,
      value: siteConfig.desks.lpg.email,
      href: `mailto:${siteConfig.desks.lpg.email}`,
      copy: "Copy email",
      copyLabel: "Copy email, LPG & ammonia desk",
    },
    {
      Icon: Phone,
      label: "Phone",
      value: siteConfig.phone,
      href: telUrl(),
      copy: "Copy number",
      copyLabel: "Copy number, phone",
    },
    {
      Icon: MessageCircle,
      label: "WhatsApp",
      value: siteConfig.whatsappDisplay,
      href: whatsappUrl(),
      copy: "Copy number",
      copyLabel: "Copy number, WhatsApp",
      external: true,
    },
  ];

  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: TITLE,
            description: DESCRIPTION,
            path: "/contact",
            type: "ContactPage",
          }),
          localBusinessLd(),
        ]}
      />
      <PageHeader
        eyebrow="Charter inquiry"
        title="Tell us what you’re moving."
        lead="Cargo, ports, dates and a way to reach you — about two minutes, and anything marked optional can wait. A broker replies within 60 minutes during business hours."
        crumbs={[{ name: "Contact", path: "/contact" }]}
        // Phones: no chips, so the form's first control is inside the first screen.
        childrenClassName="max-sm:hidden"
      >
        <ul className="flex flex-wrap gap-2" aria-label="How we work">
          <li>
            <span className="uv-chip">First reply within 60 minutes</span>
          </li>
          <li>
            <span className="uv-chip">Istanbul · London · Singapore</span>
          </li>
          <li>
            <span className="uv-chip">Tankers · LPG · ammonia</span>
          </li>
        </ul>
      </PageHeader>

      <section className="pb-14 pt-10 md:py-20" aria-labelledby="inquiry-title">
        <div className="container grid gap-14 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-20">
          <div className="min-w-0">
            <div className="mb-6 max-w-2xl md:mb-8">
              <h2
                id="inquiry-title"
                className="font-display text-[30px] leading-tight tracking-tight text-navy md:text-[36px]"
              >
                Charter inquiry
              </h2>
              {/* Phones/tablets: the direct lines otherwise sit below the whole
                  form. Short labels keep them on one row; the spoken names
                  start with the visible word (WCAG 2.5.3). */}
              <ul
                className="mt-4 flex flex-wrap gap-2 lg:hidden"
                aria-label="Or contact us directly"
              >
                <li>
                  <a href={telUrl()} className="uv-chip">
                    Call<span className="sr-only"> {siteConfig.phone}</span>
                  </a>
                </li>
                <li>
                  <a href={whatsappUrl()} target="_blank" rel="noopener" className="uv-chip">
                    WhatsApp<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${siteConfig.email}`} className="uv-chip">
                    Email<span className="sr-only"> {siteConfig.email}</span>
                  </a>
                </li>
              </ul>
            </div>
            <InquiryForm />
          </div>

          <aside aria-label="Contact details" className="space-y-12">
            <section aria-labelledby="lines-title">
              <h2 id="lines-title" className={ASIDE_H2}>
                <span className="h-px w-6 bg-brass" aria-hidden="true" />
                Direct lines
              </h2>
              {/* No overflow:hidden here — the copy tooltips sit above each button. */}
              <ul className="mt-5 divide-y divide-line rounded-lg border border-line bg-white">
                {lines.map(({ Icon, label, value, href, copy, copyLabel, external }) => (
                  <li key={label} className="flex items-center gap-4 px-4 py-4 sm:px-5">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand text-brass-ink"
                      aria-hidden="true"
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-snug text-slate">{label}</p>
                      <a
                        href={href}
                        dir="ltr"
                        className="uv-link text-[15px] font-semibold text-navy [overflow-wrap:anywhere]"
                        {...(external ? { target: "_blank", rel: "noopener" } : {})}
                      >
                        {value}
                        {external && <span className="sr-only"> (opens in a new tab)</span>}
                      </a>
                    </div>
                    <CopyButton value={value} tooltip={copy} label={copyLabel} />
                  </li>
                ))}
              </ul>
              <p className="mt-4 flex items-start gap-2.5 text-sm leading-relaxed text-slate">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brass-ink" aria-hidden="true" />
                {siteConfig.hours}
              </p>
            </section>

            <section aria-labelledby="offices-title">
              <h2 id="offices-title" className={ASIDE_H2}>
                <span className="h-px w-6 bg-brass" aria-hidden="true" />
                Offices
              </h2>
              <ul className="mt-5 divide-y divide-line border-y border-line">
                {siteConfig.offices.map((o) => (
                  <li key={o.city} className="flex items-baseline justify-between gap-4 py-3.5">
                    <p className="font-semibold text-navy">
                      {o.city}
                      <span className="font-normal text-slate">, {o.country}</span>
                    </p>
                    <p className="text-right text-[13px] leading-snug text-slate">{o.role}</p>
                  </li>
                ))}
              </ul>
              <address className="mt-6 flex gap-3 text-sm not-italic leading-relaxed text-slate">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brass-ink" aria-hidden="true" />
                <span>
                  <span className="font-semibold text-navy">{siteConfig.legalEntity}</span>
                  <br />
                  {siteConfig.address.street}
                  <br />
                  {siteConfig.address.postalCode} {siteConfig.address.locality}, Türkiye
                  <br />
                  <a
                    href={MAPS_URL}
                    target="_blank"
                    rel="noopener"
                    className="uv-link mt-2 inline-block font-semibold text-navy"
                  >
                    Open in Google Maps
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </span>
              </address>
            </section>
          </aside>
        </div>
      </section>
    </>
  );
}
