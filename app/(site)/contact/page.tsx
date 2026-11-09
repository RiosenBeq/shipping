import type { Metadata } from "next";
import {
  ArrowDown,
  ArrowRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Ship,
} from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { Crumbs } from "@/components/site/PageHeader";
import { Eyebrow } from "@/components/site/Section";
import { OfficeClocks } from "@/components/site/inner/OfficeClocks";
import { Stamp } from "@/components/site/inner/Stamp";
import { Sub } from "@/components/site/inner/ui";
import { Card, PauseMotion, StageProvider, StageWindow, calm } from "@/components/site/stage";
import { buildPageMetadata, localBusinessLd, webPageLd } from "@/lib/seo";
import { dutyWhatsappUrl, siteConfig, telUrl, whatsappUrl } from "@/lib/site";
import { CopyButton, InquiryForm } from "./InquiryForm";
import { ICON_STROKE } from "@/components/site/iconStroke";
import { DutyRibbon } from "@/components/site/DutyRibbon";

const TITLE = "Contact — Send a Tanker or LPG Charter Inquiry";
const DESCRIPTION =
  "Send a tanker or LPG charter inquiry to LEVANTER in Istanbul: cargo, ports and laycan. A broker replies within 60 minutes. Email, phone or WhatsApp.";

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

/** Link chip with a leading icon in place of the dot. */
const LINK_CHIP = "ip-chip [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:shrink-0 [&_svg]:text-brass-ink";

const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${siteConfig.geo.latitude},${siteConfig.geo.longitude}`;

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
    <div className="ip-page">
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
      <StageProvider plates={["V-night", "V-ocean"]} />

      {/* The letter scene as the page head (DESIGN-V2 §7.9, §10): h1 = the letter's headline. */}
      <StageWindow
        plate="V-night"
        id="hero"
        aria-labelledby="page-title"
        data-header-overlay=""
        className="ip-hero ip-hero--tall"
      >
        <div className="ip-wrap">
          <Crumbs crumbs={[{ name: "Contact", path: "/contact" }]} className="ip-hero__crumbs" />
          <div className="ip-contact-hero__grid">
            {/* data-ground: the header turns to its paper colours over the letter (phones). */}
            <div className="ip-letter ip-letter--hero ip-rise" data-ground="light">
              {/* "Contact", not "Charter inquiry": the form's own h2 says that just below. */}
              <p className="ip-letter__label">Contact · From the Bosphorus</p>
              <h1 id="page-title" className="ip-letter__title">
                Tell us what you’re moving.
              </h1>
              <p className="ip-letter__text">
                Cargo, ports, dates and a way to reach you — about two minutes, and anything marked
                optional can wait. A broker replies within 60 minutes during business hours.
              </p>
              {/* Facts, not links: plain text with icons, so nothing here looks tappable. */}
              <ul className="ip-letter__facts" aria-label="How we work">
                {[
                  { Icon: Clock, text: "First reply within 60 minutes" },
                  { Icon: MapPin, text: "Istanbul, London and Singapore" },
                  { Icon: Ship, text: "Tankers, LPG and ammonia" },
                ].map(({ Icon, text }) => (
                  <li key={text}>
                    <Icon aria-hidden="true" strokeWidth={ICON_STROKE.inline} />
                    {text}
                  </li>
                ))}
              </ul>
              <div className="ip-letter__sign">
                <p className="ip-letter__mark">
                  <b>LEVANTER</b>
                  <span>Beşiktaş, Istanbul</span>
                </p>
                <Stamp />
              </div>
            </div>

            <div {...calm(0.5)} className="ip-contact ip-rise ip-rise--3">
              <Sub className="!mb-0">Desk lines</Sub>
              <a href={`mailto:${siteConfig.email}`} className="ip-contact__email" dir="ltr">
                {siteConfig.email}
              </a>
              <ul className="ip-lines" aria-label="Desk lines">
                {[
                  {
                    label: siteConfig.desks.tankers.label,
                    value: siteConfig.desks.tankers.email,
                    href: `mailto:${siteConfig.desks.tankers.email}`,
                  },
                  {
                    label: siteConfig.desks.lpg.label,
                    value: siteConfig.desks.lpg.email,
                    href: `mailto:${siteConfig.desks.lpg.email}`,
                  },
                  {
                    label: `Phone · ${siteConfig.address.locality}`,
                    value: siteConfig.phone,
                    href: telUrl(),
                  },
                ].map((l) => (
                  <li key={l.label}>
                    <a href={l.href}>
                      <span>
                        <span className="t-label">{l.label}</span>
                        <b dir="ltr">{l.value}</b>
                      </span>
                      <ArrowRight aria-hidden="true" strokeWidth={ICON_STROKE.cta} />
                    </a>
                  </li>
                ))}
              </ul>
              <div className="ip-duty ip-glass">
                <DutyRibbon />
                <span className="ip-duty__dot" aria-hidden="true" />
                <p>
                  <b>{siteConfig.duty.label}</b>
                  WhatsApp the duty broker —{" "}
                  <a href={dutyWhatsappUrl()} target="_blank" rel="noopener" dir="ltr">
                    {siteConfig.duty.display}
                    <span className="sr-only"> (WhatsApp, opens in a new tab)</span>
                  </a>
                  . {siteConfig.duty.hours}
                </p>
              </div>
              <a href="#inquiry-title" className="lv-btn lv-btn--cta">
                <span>Write the inquiry</span>
                <span className="lv-btn__arrow" aria-hidden="true">
                  <ArrowDown />
                </span>
              </a>
            </div>
          </div>
          <div {...calm(0.4)} className="ip-contact-hero__foot">
            <OfficeClocks offices={siteConfig.offices} />
            <PauseMotion />
          </div>
        </div>
      </StageWindow>

      <Card ground="paper" id="inquiry" aria-labelledby="inquiry-title" className="ip-card">
        <div className="ip-wrap">
          <div className="ip-sheet-grid">
            <div className="min-w-0">
              <div className="mb-8 max-w-2xl">
                <Sub>Send an inquiry</Sub>
                {/* tabIndex: the header's "Send inquiry" on this page moves focus here */}
                <h2 id="inquiry-title" tabIndex={-1} className="ip-h2 outline-none">
                  Charter inquiry
                </h2>
                {/* Phones/tablets: the direct lines otherwise sit below the whole
                    form. Short labels keep them on one row; the spoken names
                    start with the visible word (WCAG 2.5.3). */}
                <ul className="ip-chips mt-6 lg:!hidden" aria-label="Or contact us directly">
                  <li>
                    <a href={telUrl()} className={LINK_CHIP}>
                      <Phone aria-hidden="true" strokeWidth={ICON_STROKE.inline} />
                      Call<span className="sr-only"> {siteConfig.phone}</span>
                    </a>
                  </li>
                  <li>
                    <a href={whatsappUrl()} target="_blank" rel="noopener" className={LINK_CHIP}>
                      <MessageCircle aria-hidden="true" strokeWidth={ICON_STROKE.inline} />
                      WhatsApp<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                  <li>
                    <a href={`mailto:${siteConfig.email}`} className={LINK_CHIP}>
                      <Mail aria-hidden="true" strokeWidth={ICON_STROKE.inline} />
                      Email<span className="sr-only"> {siteConfig.email}</span>
                    </a>
                  </li>
                </ul>
              </div>
              <InquiryForm />
            </div>

            {/* Sticky beside the long form on desktop where the viewport is tall
                enough to show all of it. A plain div, not an aside: a
                complementary landmark inside <main> is flagged, and its two
                sections are already labelled regions. */}
            <div className="ip-sheet-grid__side">
              <section aria-labelledby="lines-title">
                <Eyebrow as="h2" size="sm" id="lines-title">
                  Direct lines
                </Eyebrow>
                {/* No overflow:hidden here — the copy tooltips sit above each button. */}
                <ul className="ip-panel mt-5 !p-0">
                  {lines.map(({ Icon, label, value, href, copy, copyLabel, external }) => (
                    <li
                      key={label}
                      className="flex items-center gap-4 border-t border-[var(--hair)] px-4 py-4 first:border-t-0 sm:px-5"
                    >
                      <span className="ip-icon !h-10 !w-10" aria-hidden="true">
                        <Icon className="!h-[18px] !w-[18px]" strokeWidth={ICON_STROKE.inline} />
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
                  <Clock
                    className="mt-0.5 h-4 w-4 shrink-0 text-brass-ink"
                    aria-hidden="true"
                    strokeWidth={ICON_STROKE.inline}
                  />
                  {siteConfig.hours}
                </p>
              </section>

              <section aria-labelledby="offices-title">
                <Eyebrow as="h2" size="sm" id="offices-title">
                  Offices
                </Eyebrow>
                <ul className="mt-5 border-y border-[var(--hair)]">
                  {siteConfig.offices.map((o) => (
                    <li
                      key={o.city}
                      className="flex items-baseline justify-between gap-4 border-t border-[var(--hair)] py-3.5 first:border-t-0"
                    >
                      <p className="font-semibold text-navy">
                        {o.city}
                        <span className="font-normal text-slate">, {o.country}</span>
                      </p>
                      <p className="text-right text-[13px] leading-snug text-slate">{o.role}</p>
                    </li>
                  ))}
                </ul>
                <OfficeClocks offices={siteConfig.offices} className="mt-4" />
                <address className="mt-6 flex gap-3 text-sm not-italic leading-relaxed text-slate">
                  <MapPin
                    className="mt-0.5 h-4 w-4 shrink-0 text-brass-ink"
                    aria-hidden="true"
                    strokeWidth={ICON_STROKE.inline}
                  />
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
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
