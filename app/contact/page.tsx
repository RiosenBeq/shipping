import type { Metadata } from "next";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
import { buildPageMetadata, localBusinessLd, webPageLd } from "@/lib/seo";
import { siteConfig, telUrl, whatsappUrl } from "@/lib/site";
import { InquiryForm } from "./InquiryForm";

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

export default function ContactPage() {
  const channels = [
    {
      Icon: Mail,
      label: siteConfig.desks.tankers.label,
      value: siteConfig.desks.tankers.email,
      href: `mailto:${siteConfig.desks.tankers.email}`,
    },
    {
      Icon: Mail,
      label: siteConfig.desks.lpg.label,
      value: siteConfig.desks.lpg.email,
      href: `mailto:${siteConfig.desks.lpg.email}`,
    },
    { Icon: Phone, label: "Phone", value: siteConfig.phone, href: telUrl() },
    {
      Icon: MessageCircle,
      label: "WhatsApp",
      value: siteConfig.whatsappDisplay,
      href: whatsappUrl(),
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
        title="Tell us what you're moving."
        lead="Cargo, ports and laycan are enough to start. A broker replies within 60 minutes during business hours — skip anything you don't have yet."
        crumbs={[{ name: "Contact", path: "/contact" }]}
      />

      <section className="py-14 md:py-20">
        <div className="container grid gap-10 lg:grid-cols-[1fr_340px]">
          <InquiryForm />

          <aside className="space-y-8">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-brass-ink">
                Direct lines
              </h2>
              <ul className="mt-4 space-y-4">
                {channels.map(({ Icon, label, value, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="group flex gap-3"
                      {...(href.startsWith("https") ? { target: "_blank", rel: "noopener" } : {})}
                    >
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brass" aria-hidden="true" />
                      <span>
                        <span className="block text-sm text-slate">{label}</span>
                        <span className="font-medium text-navy group-hover:text-brass-ink">
                          {value}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm leading-relaxed text-slate">{siteConfig.hours}</p>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-brass-ink">
                Offices
              </h2>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {siteConfig.offices.map((o) => (
                  <li key={o.city} className="py-3">
                    <p className="font-medium text-navy">
                      {o.city}, {o.country}
                    </p>
                    <p className="text-sm text-slate">{o.role}</p>
                  </li>
                ))}
              </ul>
              <address className="mt-4 text-sm not-italic leading-relaxed text-slate">
                {siteConfig.legalEntity}
                <br />
                {siteConfig.address.street}
                <br />
                {siteConfig.address.postalCode} {siteConfig.address.locality}, Türkiye
              </address>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
