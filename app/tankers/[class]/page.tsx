import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, ArrowUpRight } from "lucide-react";
import { Nav } from "../../components/Nav";
import { Footer } from "../../components/Footer";
import { JsonLd } from "../../components/JsonLd";
import { Button } from "@/components/ui/button";
import { buildPageMetadata, breadcrumbsLd, professionalServiceLd, webPageLd } from "@/lib/seo";
import { TANKER_CLASSES, getTankerClassBySlug } from "@/lib/data/tanker-classes";

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
  const family = t.family === "crude" ? "Crude tanker" : "Clean products tanker";
  return buildPageMetadata({
    title: `${t.shortName} — ${family} chartering · ${t.dwtRange}`,
    description: `${t.longName} (${t.dwtRange}, ~${t.cargoCapacity}). Routes: ${t.routes
      .map((r) => `${r.code} ${r.lane}`)
      .join(" · ")}. LEVANTER ${t.family} desk.`,
    path: `/tankers/${t.slug}`,
    keywords: [
      `${t.shortName} chartering`,
      `${t.shortName} broker`,
      `${t.longName}`,
      ...t.routes.map((r) => `${r.code} ${r.lane}`),
      `${t.shortName} TCE`,
      `${t.shortName} dwt`,
    ],
  });
}

export default function TankerClassPage({ params }: { params: { class: string } }) {
  const t = getTankerClassBySlug(params.class);
  if (!t) notFound();

  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: `${t.shortName} — ${t.longName}`,
            description: t.intro.slice(0, 200),
            path: `/tankers/${t.slug}`,
          }),
          breadcrumbsLd([
            { name: "Home", path: "/" },
            { name: "Tankers", path: "/tankers" },
            { name: t.shortName, path: `/tankers/${t.slug}` },
          ]),
          professionalServiceLd({
            name: `LEVANTER ${t.shortName} Desk`,
            description: `Spot voyages, COAs, and time charters for ${t.longName} (${t.dwtRange}).`,
            serviceType:
              t.family === "crude" ? "Crude tanker brokerage" : "Clean products tanker brokerage",
            path: `/tankers/${t.slug}`,
          }),
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: `${t.shortName} chartering — LEVANTER`,
            description: t.intro,
            category: "Tanker brokerage",
            brand: { "@type": "Brand", name: "LEVANTER" },
          },
        ]}
      />
      <Nav active="tankers" />
      <main>
        <section className="hero-band">
          <div className="container" style={{ position: "relative", zIndex: 2 }}>
            <div className="crumbs">
              <Link href="/">LEVANTER</Link>
              <span>/</span>
              <Link href="/tankers">Tankers</Link>
              <span>/</span> {t.shortName}
            </div>
            <span className="eyebrow">
              {t.family === "crude" ? "Crude tankers" : "Clean tankers"}
            </span>
            <h1 className="display h1">
              {t.shortName} — {t.longName}.
            </h1>
            <p className="lead">{t.intro}</p>
            <div className="flex flex-wrap gap-3" style={{ marginTop: 24 }}>
              <Button asChild>
                <Link href="/contact">
                  Quote {t.shortName} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="bone">
                <Link href="/voyage-estimator">
                  Run voyage estimator <ArrowRight className="h-4 w-4" />
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
        <section className="section">
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Specifications</span>
              <h2 className="display h2">Class spec sheet.</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="dist-table">
                <tbody>
                  <tr>
                    <td className="route">
                      <strong>Long name</strong>
                    </td>
                    <td>{t.longName}</td>
                  </tr>
                  <tr>
                    <td className="route">
                      <strong>DWT range</strong>
                    </td>
                    <td>{t.dwtRange}</td>
                  </tr>
                  <tr>
                    <td className="route">
                      <strong>Cargo capacity</strong>
                    </td>
                    <td>{t.cargoCapacity}</td>
                  </tr>
                  <tr>
                    <td className="route">
                      <strong>Length overall</strong>
                    </td>
                    <td>{t.loa}</td>
                  </tr>
                  <tr>
                    <td className="route">
                      <strong>Beam</strong>
                    </td>
                    <td>{t.beam}</td>
                  </tr>
                  <tr>
                    <td className="route">
                      <strong>Draft</strong>
                    </td>
                    <td>{t.draft}</td>
                  </tr>
                  <tr>
                    <td className="route">
                      <strong>Speed</strong>
                    </td>
                    <td>{t.speed}</td>
                  </tr>
                  <tr>
                    <td className="route">
                      <strong>Consumption</strong>
                    </td>
                    <td>{t.consumption}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Routes */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Routes</span>
              <h2 className="display h2">Where this class fixes.</h2>
            </div>
            <div className="class-grid">
              {t.routes.map((r) => (
                <article key={`${r.code}-${r.lane}`} className="class-cell">
                  <div
                    style={{
                      fontFamily: "var(--font-mono),monospace",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--accent-brass)",
                      marginBottom: 8,
                    }}
                  >
                    {r.code}
                  </div>
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
                    Estimate {r.code} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Trends */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">2026 trends</span>
              <h2 className="display h2">What the desk is watching.</h2>
            </div>
            <div className="result-grid" style={{ marginBottom: 0 }}>
              {t.keyTrends.map((tr) => (
                <article key={tr.title} className="panel">
                  <div className="panel-head">
                    <span className="panel-title">
                      <ArrowUpRight className="inline h-3.5 w-3.5" /> {tr.title}
                    </span>
                  </div>
                  <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.65, margin: 0 }}>
                    {tr.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Charter shape + desk */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="result-grid" style={{ marginBottom: 0 }}>
              <article className="panel">
                <div className="panel-head">
                  <span className="panel-title">Charter shape</span>
                </div>
                <p style={{ color: "var(--fg)", fontSize: 15, lineHeight: 1.65, margin: 0 }}>
                  {t.charterShape}
                </p>
              </article>
              <article className="panel">
                <div className="panel-head">
                  <span className="panel-title">Markets served</span>
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
            >
              <strong>Desk:</strong> {t.desk}
            </div>
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
                <ArrowLeft className="h-4 w-4" /> All tanker classes
              </Link>
              <Link
                href="/contact"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--accent-brass)",
                }}
              >
                Send a {t.shortName} inquiry <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
