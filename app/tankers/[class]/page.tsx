import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, ArrowUpRight } from "lucide-react";
import { Nav } from "../../components/Nav";
import { Footer } from "../../components/Footer";
import { JsonLd } from "../../components/JsonLd";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { ContactCta } from "../../components/ContactCta";
import { Button } from "@/components/ui/button";
import { buildPageMetadata, breadcrumbsLd, serviceLd, webPageLd } from "@/lib/seo";
import { TANKER_CLASSES, getTankerClassBySlug } from "@/lib/data/tanker-classes";
import { BROKERS, brokerSlug } from "@/lib/data/brokers";
import { REPORTS, reportSlug } from "@/lib/data/research";

export function generateStaticParams() {
  return TANKER_CLASSES.map((t) => ({ class: t.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: { class: string };
}): Promise<Metadata> {
  const t = getTankerClassBySlug(params.class);
  if (!t) return { title: "Tanker class not found" };
  return buildPageMetadata({
    title: t.title,
    description: t.description,
    path: `/tankers/${t.slug}`,
    keywords: [
      `${t.shortName} chartering`,
      `${t.shortName} broker`,
      t.longName,
      ...t.routes.map((r) => `${r.code} ${r.lane}`),
      `${t.shortName} size`,
      `${t.shortName} dwt`,
    ],
  });
}

export default function TankerClassPage({ params }: { params: { class: string } }) {
  const t = getTankerClassBySlug(params.class);
  if (!t) notFound();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Tankers", path: "/tankers" },
    { name: t.name, path: `/tankers/${t.slug}` },
  ];
  const cargo = t.family === "crude" ? "crude" : "clean";
  const desk = BROKERS.filter((b) =>
    t.brokerClass
      ? b.classes.includes(t.brokerClass)
      : b.sectors.includes(t.family === "crude" ? "crude" : "clean")
  );
  const related = t.related
    .map((slug) => REPORTS.find((r) => reportSlug(r) === slug))
    .filter((r): r is (typeof REPORTS)[number] => Boolean(r));
  const siblings = TANKER_CLASSES.filter((c) => c.slug !== t.slug);

  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: `${t.title} — LEVANTER`,
            description: t.intro.slice(0, 200),
            path: `/tankers/${t.slug}`,
          }),
          breadcrumbsLd(crumbs),
          serviceLd({
            name: `LEVANTER ${t.shortName} chartering`,
            description: `Spot voyages, COAs, and time charters for ${t.longName} tonnage (${t.dwtRange}).`,
            serviceType:
              t.family === "crude" ? "Crude tanker chartering" : "Clean tanker chartering",
            path: `/tankers/${t.slug}`,
          }),
        ]}
      />
      <Nav active="tankers" />
      <main id="main">
        <section className="hero-band">
          <div className="container" style={{ position: "relative", zIndex: 2 }}>
            <Breadcrumbs crumbs={crumbs} />
            <span className="eyebrow">
              {t.family === "crude" ? "Crude tankers" : "Clean tankers"}
            </span>
            <h1 className="display h1">{t.h1}</h1>
            <p className="lead">{t.intro}</p>
            <div className="flex flex-wrap gap-3" style={{ marginTop: 24 }}>
              <Button asChild>
                <Link href={`/contact?cargo=${cargo}`}>
                  Quote a {t.shortName} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="bone">
                <Link href="/voyage-estimator">
                  Run voyage estimator <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <div className="hero-stats">
              <div className="stat">
                <div className="lbl">DWT range</div>
                <div className="val display">{t.dwtRange.split(" ")[0]}</div>
                <div className="delta">{t.dwtRange.split(" ").slice(1).join(" ")}</div>
              </div>
              <div className="stat">
                <div className="lbl">Cargo</div>
                <div className="val display" style={{ fontSize: 22 }}>
                  {t.cargoCapacity}
                </div>
              </div>
              <div className="stat">
                <div className="lbl">Laden speed</div>
                <div className="val display">{t.speed.split(" ")[0]}</div>
                <div className="delta">kn laden</div>
              </div>
              <div className="stat">
                <div className="lbl">Consumption</div>
                <div className="val display" style={{ fontSize: 26 }}>
                  {t.consumption.split(" ")[0]}
                </div>
                <div className="delta">mt/d at sea</div>
              </div>
            </div>
          </div>
        </section>

        {/* Spec sheet */}
        <section className="section" aria-labelledby="spec-h">
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Specifications</span>
              <h2 id="spec-h" className="display h2">
                {t.shortName} spec sheet.
              </h2>
              <p>Typical figures for the class — individual ships vary.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="dist-table">
                <caption className="sr-only">{t.longName} typical specifications</caption>
                <tbody>
                  {[
                    ["Full name", t.longName],
                    ["DWT range", t.dwtRange],
                    ["Cargo capacity", t.cargoCapacity],
                    ["Length overall", t.loa],
                    ["Beam", t.beam],
                    ["Draft", t.draft],
                    ["Speed", t.speed],
                    ["Consumption", t.consumption],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <th scope="row" className="spec-key">
                        {k}
                      </th>
                      <td>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Routes */}
        <section className="section" style={{ paddingTop: 0 }} aria-labelledby="routes-h">
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Routes</span>
              <h2 id="routes-h" className="display h2">
                Where the {t.shortName} trades.
              </h2>
            </div>
            <div className="class-grid">
              {t.routes.map((r) => (
                <article key={`${r.code}-${r.lane}`} className="class-cell">
                  <div className="dwt">{r.code}</div>
                  <h3 className="nm">{r.lane}</h3>
                  <p
                    style={{
                      color: "var(--muted)",
                      fontSize: 14,
                      lineHeight: 1.6,
                      margin: "8px 0 16px",
                      flex: 1,
                    }}
                  >
                    {r.note}
                  </p>
                  <Link href="/voyage-estimator" className="cta">
                    Estimate a {r.code} voyage{" "}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Trends */}
        <section className="section" style={{ paddingTop: 0 }} aria-labelledby="trends-h">
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Desk view</span>
              <h2 id="trends-h" className="display h2">
                What the desk is watching.
              </h2>
              <p>
                Market commentary from the desk — not investment advice; check current conditions.
              </p>
            </div>
            <div className="result-grid" style={{ marginBottom: 0 }}>
              {t.keyTrends.map((tr) => (
                <article key={tr.title} className="panel">
                  <div className="panel-head">
                    <h3 className="panel-title" style={{ margin: 0 }}>
                      <ArrowUpRight className="inline h-3.5 w-3.5" aria-hidden="true" /> {tr.title}
                    </h3>
                  </div>
                  <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.65, margin: 0 }}>
                    {tr.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Charter shape + charterers + desk */}
        <section className="section" style={{ paddingTop: 0 }} aria-labelledby="business-h">
          <div className="container">
            <h2 id="business-h" className="sr-only">
              How the {t.shortName} is chartered
            </h2>
            <div className="result-grid" style={{ marginBottom: 0 }}>
              <article className="panel">
                <div className="panel-head">
                  <h3 className="panel-title" style={{ margin: 0 }}>
                    Charter shape
                  </h3>
                </div>
                <p style={{ color: "var(--fg)", fontSize: 15, lineHeight: 1.65, margin: 0 }}>
                  {t.charterShape}
                </p>
              </article>
              <article className="panel">
                <div className="panel-head">
                  <h3 className="panel-title" style={{ margin: 0 }}>
                    Who charters this class
                  </h3>
                </div>
                <ul
                  style={{
                    paddingLeft: 18,
                    margin: 0,
                    color: "var(--muted)",
                    fontSize: 14,
                    lineHeight: 1.7,
                  }}
                >
                  {t.marketsServed.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </article>
            </div>
            {desk.length > 0 && (
              <div
                style={{
                  marginTop: 20,
                  padding: "16px 22px",
                  background: "var(--card)",
                  border: "1px solid var(--hairline)",
                  borderLeft: "3px solid var(--accent-brass)",
                  fontSize: 14,
                  color: "var(--fg)",
                }}
                className="prose-links"
              >
                <strong>Brokers covering the {t.shortName}:</strong>{" "}
                {desk.map((b, i) => (
                  <span key={b.name}>
                    {i > 0 && ", "}
                    <Link href={`/brokers/${brokerSlug(b)}`}>{b.name}</Link> ({b.desk})
                  </span>
                ))}
                .
              </div>
            )}
          </div>
        </section>

        {/* Related reading + other classes */}
        <section className="section" style={{ paddingTop: 0 }} aria-labelledby="related-h">
          <div className="container">
            <div className="result-grid" style={{ marginBottom: 0 }}>
              {related.length > 0 && (
                <div>
                  <h2
                    id="related-h"
                    className="eyebrow"
                    style={{ display: "block", marginBottom: 12 }}
                  >
                    Related research
                  </h2>
                  <ul className="related-list">
                    {related.map((r) => (
                      <li key={r.title}>
                        <Link href={`/research/${reportSlug(r)}`}>
                          <span className="meta">
                            {r.catLabel} · {r.date}
                          </span>
                          {r.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <h2 className="eyebrow" style={{ display: "block", marginBottom: 12 }}>
                  Other tanker classes
                </h2>
                <ul className="related-list">
                  {siblings.map((c) => (
                    <li key={c.slug}>
                      <Link href={`/tankers/${c.slug}`}>
                        <span className="meta">{c.dwtRange}</span>
                        {c.name} chartering
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div style={{ marginTop: 32 }}>
              <Link
                href="/tankers"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--accent-brass)",
                }}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All tanker classes
              </Link>
            </div>
          </div>
        </section>

        <ContactCta
          headline={`A ${t.shortName} cargo to move?`}
          body={`Send the cargo, load and discharge areas, laycan and stem. The ${t.family} desk replies within 60 minutes during business hours.`}
          context={`${t.shortName} inquiry`}
          inquiryHref={`/contact?cargo=${cargo}`}
        />
      </main>
      <Footer />
    </>
  );
}
