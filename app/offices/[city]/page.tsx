import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail, Phone } from "lucide-react";
import { Nav } from "../../components/Nav";
import { Footer } from "../../components/Footer";
import { JsonLd } from "../../components/JsonLd";
import { Button } from "@/components/ui/button";
import { OFFICES } from "@/lib/data/offices";
import { OFFICE_DETAILS } from "@/lib/data/office-detail";
import { OfficeCity } from "@/lib/schemas";
import { buildPageMetadata, breadcrumbsLd, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const CITIES = ["ist", "lon", "sg", "hou"] as const;

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c }));
}

export const dynamicParams = false;

function isCity(s: string): s is OfficeCity {
  return (CITIES as readonly string[]).includes(s);
}

export async function generateMetadata({
  params,
}: {
  params: { city: string };
}): Promise<Metadata> {
  if (!isCity(params.city)) return { title: "Office not found" };
  const o = OFFICES[params.city];
  return buildPageMetadata({
    title: `${o.city} Office — LEVANTER ${o.city} Desk`,
    description: `LEVANTER ${o.city} desk. ${o.sectors}. ${o.addr}. Trading hours ${o.hours}.`,
    path: `/offices/${params.city}`,
    keywords: [
      `${o.city} shipbroker`,
      `${o.city} tanker desk`,
      `${o.city} chartering`,
      ...o.sectors.split(" · "),
    ],
  });
}

export default function OfficeCityPage({ params }: { params: { city: string } }) {
  if (!isCity(params.city)) notFound();
  const o = OFFICES[params.city];
  const d = OFFICE_DETAILS[params.city];

  const placeLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    "@id": `${siteConfig.url}/offices/${params.city}#place`,
    name: `${siteConfig.name} ${o.city}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: o.addr,
      addressLocality: o.city,
    },
    telephone: o.phone,
    openingHours: o.hours,
    containedInPlace: { "@id": `${siteConfig.url}#organization` },
    description: d.intro,
  };

  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: `${siteConfig.name} ${o.city} office`,
            description: d.intro.slice(0, 200),
            path: `/offices/${params.city}`,
            type: "AboutPage",
          }),
          breadcrumbsLd([
            { name: "Home", path: "/" },
            { name: "Offices", path: "/offices" },
            { name: o.city, path: `/offices/${params.city}` },
          ]),
          placeLd,
        ]}
      />
      <Nav active="offices" />
      <main>
        <section className="ph">
          <div className="container">
            <div className="crumbs">
              <Link href="/">LEVANTER</Link>
              <span>/</span>
              <Link href="/offices">Offices</Link>
              <span>/</span> {o.city}
            </div>
            <span className="eyebrow">
              {params.city === "ist" ? "Headquarters" : "Regional desk"}
            </span>
            <h1 className="display h1">
              LEVANTER {o.city}.
              <br />
              {o.sectors}.
            </h1>
            <p>{d.intro}</p>
            <div className="flex flex-wrap gap-3" style={{ marginTop: 24 }}>
              <Button asChild>
                <Link href="/contact">
                  Send a {o.city} inquiry <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <a href={`tel:${o.phone.replace(/\s+/g, "")}`}>
                  <Phone className="h-4 w-4" /> {o.phone}
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Quick facts */}
        <section className="section" style={{ paddingTop: 64, paddingBottom: 0 }}>
          <div className="container">
            <div className="summary-strip">
              <div className="kpi">
                <div className="kpi-label">Address</div>
                <div className="kpi-value" style={{ fontSize: 18, lineHeight: 1.3 }}>
                  {o.addr}
                </div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Trading hours</div>
                <div className="kpi-value" style={{ fontSize: 20 }}>
                  {o.hours}
                </div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Languages</div>
                <div className="kpi-value" style={{ fontSize: 18, lineHeight: 1.3 }}>
                  {o.lang}
                </div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Memberships</div>
                <div className="kpi-value" style={{ fontSize: 16, lineHeight: 1.3 }}>
                  {o.member}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="section" style={{ paddingTop: 64 }}>
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">What this desk does</span>
              <h2 className="display h2">Services covered.</h2>
            </div>
            <div className="result-grid" style={{ marginBottom: 0 }}>
              <article className="panel">
                <div className="panel-head">
                  <span className="panel-title">Service lines</span>
                </div>
                <ul
                  style={{
                    paddingLeft: 18,
                    margin: 0,
                    color: "var(--muted)",
                    fontSize: 15,
                    lineHeight: 1.7,
                  }}
                >
                  {d.services.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </article>
              <article className="panel">
                <div className="panel-head">
                  <span className="panel-title">What we fix here</span>
                </div>
                <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.65, margin: 0 }}>
                  {d.whatWeFix}
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">{o.city} team</span>
              <h2 className="display h2">Brokers on this desk.</h2>
              <p>
                {d.team.length} brokers; head of office: {o.head} ({o.headRole}).
              </p>
            </div>
            <div className="brokers-row">
              {d.team.map((m) => (
                <article className="broker-card" key={m.name}>
                  <div
                    className="broker-avatar"
                    style={{ background: "var(--accent-brass)" }}
                    aria-hidden="true"
                  >
                    {m.name
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <h3 className="broker-name">{m.name}</h3>
                  <p className="broker-title">{m.role}</p>
                  <Link href="/brokers" className="broker-profile">
                    View brokers <ArrowRight className="h-3 w-3" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Why here */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <div className="sec-head">
              <span className="eyebrow">Why here</span>
              <h2 className="display h2">Why this desk, in this place.</h2>
            </div>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--fg)" }}>{d.whyHere}</p>
            <p
              style={{
                fontSize: 14,
                color: "var(--muted)",
                fontFamily: "var(--font-mono),monospace",
                marginTop: 18,
              }}
            >
              {d.founded}
            </p>
          </div>
        </section>

        {/* Contact card */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <article
              className="panel"
              style={{
                background: "var(--ink-deep-petrol)",
                color: "var(--ink-bone)",
                padding: 40,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 32,
                  alignItems: "center",
                }}
                className="broker-detail-grid"
              >
                <div>
                  <span className="eyebrow" style={{ color: "var(--accent-brass-lt)" }}>
                    Reach the {o.city} desk
                  </span>
                  <h3
                    className="display"
                    style={{
                      fontSize: 28,
                      fontWeight: 500,
                      letterSpacing: "-0.015em",
                      margin: "10px 0 16px",
                      color: "var(--ink-bone)",
                    }}
                  >
                    Direct line, no gatekeepers.
                  </h3>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      color: "rgba(241,236,220,.86)",
                      fontSize: 15,
                    }}
                  >
                    <li
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Phone className="h-4 w-4" />
                      <a
                        href={`tel:${o.phone.replace(/\s+/g, "")}`}
                        style={{ color: "var(--accent-brass-lt)" }}
                      >
                        {o.phone}
                      </a>
                      <span style={{ opacity: 0.6, fontSize: 13 }}>· general</span>
                    </li>
                    <li
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Phone className="h-4 w-4" />
                      <a
                        href={`tel:${o.after.replace(/\s+/g, "")}`}
                        style={{ color: "var(--accent-brass-lt)" }}
                      >
                        {o.after}
                      </a>
                      <span style={{ opacity: 0.6, fontSize: 13 }}>· after hours</span>
                    </li>
                    <li
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Mail className="h-4 w-4" />
                      <a
                        href={`mailto:${siteConfig.email}`}
                        style={{ color: "var(--accent-brass-lt)" }}
                      >
                        {siteConfig.email}
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <Button asChild>
                    <Link href="/contact">
                      Charter inquiry <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Bottom nav */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div
              style={{
                paddingTop: 24,
                borderTop: "1px solid var(--hairline)",
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <Link
                href="/offices"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--accent-brass)",
                }}
              >
                <ArrowLeft className="h-4 w-4" /> All offices
              </Link>
              <Link
                href="/brokers"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--accent-brass)",
                }}
              >
                Find a broker <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
