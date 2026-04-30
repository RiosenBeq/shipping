import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Phone, Mail, Linkedin, MessageCircle } from "lucide-react";
import { Nav } from "../../components/Nav";
import { Footer } from "../../components/Footer";
import { JsonLd } from "../../components/JsonLd";
import { Button } from "@/components/ui/button";
import {
  BROKERS,
  brokerSlug,
  getBrokerBySlug,
  SECTOR_LABEL,
  CLASS_LABEL,
} from "@/lib/data/brokers";
import { OFFICES } from "@/lib/data/offices";
import { buildPageMetadata, breadcrumbsLd, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

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
    title: `${b.name} — ${b.title}`,
    description: `${b.name} — ${b.title}, LEVANTER ${b.desk} desk. Coverage: ${b.tags.join(", ")}. Sectors: ${b.sectors.map((s) => SECTOR_LABEL[s]).join(", ")}.`,
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

const DESK_TO_OFFICE: Record<string, keyof typeof OFFICES> = {
  Istanbul: "ist",
  London: "lon",
  Singapore: "sg",
  Houston: "hou",
};

export default function BrokerProfile({ params }: { params: { slug: string } }) {
  const b = getBrokerBySlug(params.slug);
  if (!b) notFound();

  const office = OFFICES[DESK_TO_OFFICE[b.desk]];

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteConfig.url}/brokers/${params.slug}#person`,
    name: b.name,
    jobTitle: b.title,
    image: `${siteConfig.url}/opengraph-image`,
    worksFor: { "@id": `${siteConfig.url}#organization` },
    workLocation: {
      "@type": "Place",
      name: `${siteConfig.name} ${b.desk}`,
      address: { "@type": "PostalAddress", addressLocality: b.desk },
    },
    knowsAbout: [...b.tags, ...b.sectors.map((s) => SECTOR_LABEL[s])],
    url: `${siteConfig.url}/brokers/${params.slug}`,
  };

  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: `${b.name} — ${b.title}`,
            description: `${b.name} — ${b.title} at the LEVANTER ${b.desk} desk.`,
            path: `/brokers/${params.slug}`,
            type: "AboutPage",
          }),
          breadcrumbsLd([
            { name: "Home", path: "/" },
            { name: "Brokers", path: "/brokers" },
            { name: b.name, path: `/brokers/${params.slug}` },
          ]),
          personLd,
        ]}
      />
      <Nav active="brokers" />
      <main>
        <section className="ph">
          <div className="container">
            <div className="crumbs">
              <Link href="/">LEVANTER</Link>
              <span>/</span>
              <Link href="/brokers">Brokers</Link>
              <span>/</span> {b.name}
            </div>
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
                <span className="eyebrow">{b.desk} desk</span>
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
                    <Link href="/contact">
                      Send {b.name.split(" ")[0]} an inquiry <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <aside>
                <div className="b-card" style={{ padding: 28 }}>
                  <div className="filter-h" style={{ marginBottom: 12 }}>
                    Contact
                  </div>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      fontSize: 14,
                    }}
                  >
                    <li>
                      <a
                        href={`tel:${office?.phone.replace(/\s+/g, "")}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          color: "var(--accent-brass)",
                        }}
                      >
                        <Phone className="h-4 w-4" />
                        {office?.phone}
                      </a>
                    </li>
                    <li>
                      <a
                        href={`mailto:${b.name.toLowerCase().replace(/[^a-z]+/g, ".")}@${siteConfig.url.replace(
                          /^https?:\/\//,
                          ""
                        )}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          color: "var(--accent-brass)",
                        }}
                      >
                        <Mail className="h-4 w-4" />
                        Direct email
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          color: "var(--accent-brass)",
                        }}
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          color: "var(--accent-brass)",
                        }}
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </a>
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
                    href="/offices"
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
                    All offices <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
