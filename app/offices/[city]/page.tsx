import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail, Phone } from "lucide-react";
import { Nav } from "../../components/Nav";
import { Footer } from "../../components/Footer";
import { JsonLd } from "../../components/JsonLd";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { OFFICES, OFFICE_ORDER } from "@/lib/data/offices";
import { OFFICE_DETAILS } from "@/lib/data/office-detail";
import { BROKERS, brokerSlug } from "@/lib/data/brokers";
import { OfficeCity } from "@/lib/schemas";
import { buildPageMetadata, breadcrumbsLd, officeLd, webPageLd } from "@/lib/seo";
import { siteConfig, telUrl, mailUrl } from "@/lib/site";

export function generateStaticParams() {
  return OFFICE_ORDER.map((c) => ({ city: c }));
}

export const dynamicParams = false;

function isCity(s: string): s is OfficeCity {
  return (OFFICE_ORDER as readonly string[]).includes(s);
}

export async function generateMetadata({
  params,
}: {
  params: { city: string };
}): Promise<Metadata> {
  if (!isCity(params.city)) return { title: "Office not found" };
  const o = OFFICES[params.city];
  return buildPageMetadata({
    title: OFFICE_DETAILS[params.city].title,
    description: OFFICE_DETAILS[params.city].description,
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
  const path = `/offices/${params.city}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Offices", path: "/offices" },
    { name: o.city, path },
  ];

  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: `${siteConfig.name} ${o.city} office`,
            description: d.intro.slice(0, 200),
            path,
            type: "AboutPage",
          }),
          breadcrumbsLd(crumbs),
          officeLd({
            name: `${siteConfig.name} ${o.city}`,
            path,
            description: d.intro,
            streetAddress: o.street,
            locality: o.city,
            postalCode: o.postalCode,
            country: o.country,
            telephone: o.phone,
            hours: o.openingHours,
          }),
        ]}
      />
      <Nav active="offices" />
      <main id="main">
        <section className="ph">
          <div className="container">
            <Breadcrumbs crumbs={crumbs} />
            <span className="eyebrow">
              {o.role === "Headquarters" ? "Headquarters" : "Regional desk"} · {o.sectors}
            </span>
            <h1 className="display h1">{d.h1}</h1>
            <p>{d.intro}</p>
            <div className="flex flex-wrap gap-3" style={{ marginTop: 24 }}>
              <Button asChild>
                <Link href={`/contact?notes=${encodeURIComponent(`For the ${o.city} desk`)}`}>
                  Send a {o.city} inquiry <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <a href={telUrl(o.phone)}>
                  <Phone className="h-4 w-4" aria-hidden="true" /> {o.phone}
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
                <div className="kpi-label">Head of office</div>
                <div className="kpi-value" style={{ fontSize: 16, lineHeight: 1.3 }}>
                  {o.head}
                  <br />
                  <span style={{ color: "var(--muted)" }}>{o.headRole}</span>
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
                  <h3 className="panel-title" style={{ margin: 0 }}>
                    Service lines
                  </h3>
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
                  <h3 className="panel-title" style={{ margin: 0 }}>
                    Desk focus
                  </h3>
                </div>
                <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.65, margin: 0 }}>
                  {d.focus}
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
              {d.team.map((m) => {
                const broker = BROKERS.find((b) => b.name === m.name);
                return (
                  <article className="broker-card" key={m.name}>
                    <div
                      className="broker-avatar"
                      style={{ background: "#7F5D22" }}
                      aria-hidden="true"
                    >
                      {m.name
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <h3 className="broker-name">
                      {broker ? (
                        <Link href={`/brokers/${brokerSlug(broker)}`}>{m.name}</Link>
                      ) : (
                        m.name
                      )}
                    </h3>
                    <p className="broker-title">{m.role}</p>
                    {broker && (
                      <Link href={`/brokers/${brokerSlug(broker)}`} className="broker-profile">
                        View profile <ArrowRight className="h-3 w-3" aria-hidden="true" />
                        <span className="sr-only">: {m.name}</span>
                      </Link>
                    )}
                  </article>
                );
              })}
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
              className="panel on-dark"
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
                      <a href={telUrl(o.phone)} style={{ color: "var(--accent-brass-lt)" }}>
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
                      <a href={telUrl(o.after)} style={{ color: "var(--accent-brass-lt)" }}>
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
                        href={mailUrl(`LEVANTER ${o.city} desk`)}
                        style={{ color: "var(--accent-brass-lt)" }}
                      >
                        {siteConfig.email}
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <Button asChild>
                    <Link href={`/contact?notes=${encodeURIComponent(`For the ${o.city} desk`)}`}>
                      Charter inquiry <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All offices
              </Link>
              <Link
                href={`/brokers?desk=${o.city}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--accent-brass)",
                }}
              >
                {o.city} brokers <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
