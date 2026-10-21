import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Phone, Mail, MessageCircle } from "lucide-react";
import { Nav } from "../../components/Nav";
import { Footer } from "../../components/Footer";
import { JsonLd } from "../../components/JsonLd";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { TrackedAnchor } from "../../components/TrackedAnchor";
import { Button } from "@/components/ui/button";
import {
  BROKERS,
  brokerSlug,
  getBrokerBySlug,
  SECTOR_LABEL,
  CLASS_LABEL,
} from "@/lib/data/brokers";
import { OFFICES, DESK_TO_OFFICE } from "@/lib/data/offices";
import { absoluteUrl, buildPageMetadata, breadcrumbsLd, webPageLd } from "@/lib/seo";
import { siteConfig, telUrl, whatsappUrl, mailUrl } from "@/lib/site";
import type { Sector } from "@/lib/schemas";

/** Inquiry-form cargo pre-selection for a broker's main sector. */
const SECTOR_CARGO: Partial<Record<Sector, string>> = {
  crude: "crude",
  clean: "clean",
  chem: "chem",
  bulk: "bulk",
};

export function generateStaticParams() {
  return BROKERS.map((b) => ({ slug: brokerSlug(b) }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const b = getBrokerBySlug(params.slug);
  if (!b) return { title: "Broker not found" };
  return buildPageMetadata({
    title: `${b.name} — ${b.title}, ${b.desk}`,
    description: `${b.name}, ${b.title} on the LEVANTER ${b.desk} desk. Covers ${b.tags.join(", ")} (${b.sectors.map((s) => SECTOR_LABEL[s]).join(", ")}). Contact the desk directly.`,
    path: `/brokers/${params.slug}`,
    keywords: [
      b.name,
      b.title,
      `${b.desk} shipbroker`,
      ...b.tags,
      ...b.sectors.map((s) => SECTOR_LABEL[s]),
    ],
  });
}

export default function BrokerProfile({ params }: { params: { slug: string } }) {
  const b = getBrokerBySlug(params.slug);
  if (!b) notFound();

  const officeSlug = DESK_TO_OFFICE[b.desk];
  const office = OFFICES[officeSlug];
  const path = `/brokers/${params.slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Brokers", path: "/brokers" },
    { name: b.name, path },
  ];
  const cargo = b.sectors.map((s) => SECTOR_CARGO[s]).find(Boolean);
  const inquiryHref = `/contact?${new URLSearchParams({
    ...(cargo ? { cargo } : {}),
    notes: `Attn: ${b.name}`,
  }).toString()}`;
  const colleagues = BROKERS.filter((x) => x.desk === b.desk && x.name !== b.name);

  // No photo yet: Person.image is omitted rather than pointing at a generic brand image.
  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${absoluteUrl(path)}#person`,
    name: b.name,
    jobTitle: b.title,
    worksFor: { "@id": `${siteConfig.url}#organization` },
    workLocation: {
      "@type": "Place",
      name: `${siteConfig.name} ${b.desk}`,
      url: absoluteUrl(`/offices/${officeSlug}`),
      address: {
        "@type": "PostalAddress",
        addressLocality: b.desk,
        addressCountry: office.country,
      },
    },
    knowsAbout: [...b.tags, ...b.sectors.map((s) => SECTOR_LABEL[s])],
    url: absoluteUrl(path),
  };

  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: `${b.name} — ${b.title}`,
            description: `${b.name} — ${b.title} at the LEVANTER ${b.desk} desk.`,
            path,
            type: "ProfilePage",
          }),
          breadcrumbsLd(crumbs),
          personLd,
        ]}
      />
      <Nav active="brokers" />
      <main id="main">
        <section className="ph">
          <div className="container">
            <Breadcrumbs crumbs={crumbs} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                marginTop: 14,
                flexWrap: "wrap",
              }}
            >
              <div
                className="b-avatar"
                style={{
                  background: b.color,
                  width: 88,
                  height: 88,
                  fontSize: 28,
                  marginBottom: 0,
                }}
                aria-hidden="true"
              >
                {b.initials}
              </div>
              <div>
                <span className="eyebrow">
                  <Link href={`/offices/${officeSlug}`}>{b.desk} desk</Link>
                </span>
                <h1 className="display h1" style={{ marginBottom: 6 }}>
                  {b.name}
                </h1>
                <p style={{ marginTop: 0, fontSize: 18, color: "var(--muted)" }}>{b.title}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container" style={{ maxWidth: 980 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)",
                gap: 32,
              }}
              className="broker-detail-grid"
            >
              <div>
                <h2 className="display h2" style={{ marginBottom: 18 }}>
                  Coverage
                </h2>
                <div className="b-card" style={{ padding: 28 }}>
                  <div style={{ marginBottom: 18 }}>
                    <div
                      className="filter-h"
                      style={{ borderBottom: 0, paddingBottom: 0, marginBottom: 6 }}
                    >
                      Sectors
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {b.sectors.map((s) => (
                        <span key={s} className="broker-tag">
                          {SECTOR_LABEL[s]}
                        </span>
                      ))}
                    </div>
                  </div>
                  {b.classes.length > 0 && (
                    <div style={{ marginBottom: 18 }}>
                      <div
                        className="filter-h"
                        style={{ borderBottom: 0, paddingBottom: 0, marginBottom: 6 }}
                      >
                        Vessel classes
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {b.classes.map((c) => (
                          <span key={c} className="broker-tag">
                            {CLASS_LABEL[c]}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <div
                      className="filter-h"
                      style={{ borderBottom: 0, paddingBottom: 0, marginBottom: 6 }}
                    >
                      Routes / focus
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {b.tags.map((t) => (
                        <span key={t} className="broker-tag">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 32 }}>
                  <Button asChild>
                    <Link href={inquiryHref}>
                      Send {b.name.split(" ")[0]} an inquiry{" "}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>

                {colleagues.length > 0 && (
                  <div style={{ marginTop: 40 }}>
                    <h2 className="eyebrow" style={{ display: "block", marginBottom: 12 }}>
                      Also on the {b.desk} desk
                    </h2>
                    <ul className="related-list">
                      {colleagues.map((c) => (
                        <li key={c.name}>
                          <Link href={`/brokers/${brokerSlug(c)}`}>
                            <span className="meta">{c.title}</span>
                            {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <div className="b-card" style={{ padding: 28 }}>
                  <div className="filter-h" style={{ marginBottom: 12 }}>
                    Contact
                  </div>
                  <ul className="broker-contact">
                    <li>
                      <TrackedAnchor channel="phone" href={telUrl(office.phone)}>
                        <Phone className="h-4 w-4" aria-hidden="true" />
                        {office.phone}
                        <span className="sr-only"> ({b.desk} desk)</span>
                      </TrackedAnchor>
                    </li>
                    <li>
                      <TrackedAnchor channel="email" href={mailUrl(`Attn: ${b.name}`)}>
                        <Mail className="h-4 w-4" aria-hidden="true" />
                        Email the desk (Attn: {b.name.split(" ")[0]})
                      </TrackedAnchor>
                    </li>
                    <li>
                      <TrackedAnchor
                        channel="whatsapp"
                        href={whatsappUrl(`Hi LEVANTER desk — I'd like to speak to ${b.name}.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                        WhatsApp {siteConfig.whatsappDisplay}
                      </TrackedAnchor>
                    </li>
                  </ul>
                </div>

                <div className="b-card" style={{ padding: 28, marginTop: 16 }}>
                  <div className="filter-h" style={{ marginBottom: 12 }}>
                    {b.desk} office
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", lineHeight: 1.55 }}>
                    {office?.addr}
                  </p>
                  <p
                    style={{
                      margin: "8px 0 0",
                      fontSize: 12,
                      fontFamily: "var(--font-mono),monospace",
                      color: "var(--muted)",
                    }}
                  >
                    {office?.hours}
                  </p>
                  <Link
                    href={`/offices/${officeSlug}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 14,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--accent-brass)",
                    }}
                  >
                    {b.desk} office <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
