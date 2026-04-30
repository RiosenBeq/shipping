import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, ArrowLeft } from "lucide-react";
import { Nav } from "../../components/Nav";
import { Footer } from "../../components/Footer";
import { JsonLd } from "../../components/JsonLd";
import { Button } from "@/components/ui/button";
import { REPORTS, getReportBySlug, reportSlug, reportDateIso } from "@/lib/data/research";
import { REPORT_BODIES, type ReportBlock } from "@/lib/data/research-bodies";
import { buildPageMetadata, breadcrumbsLd, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export function generateStaticParams() {
  return REPORTS.map((r) => ({ slug: reportSlug(r) }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const r = getReportBySlug(params.slug);
  if (!r) return { title: "Report not found" };
  return buildPageMetadata({
    title: r.title,
    description: r.desc,
    path: `/research/${params.slug}`,
    keywords: [r.label, r.catLabel, "tanker research", "LEVANTER"],
  });
}

function Block({ block }: { block: ReportBlock }) {
  if (block.kind === "p") {
    return (
      <p style={{ fontSize: 17, lineHeight: 1.75, color: "var(--fg)", margin: 0 }}>{block.text}</p>
    );
  }
  if (block.kind === "h2") {
    return (
      <h2
        className="display"
        style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.015em", margin: "12px 0 0" }}
      >
        {block.text}
      </h2>
    );
  }
  if (block.kind === "ul") {
    return (
      <ul style={{ paddingLeft: 22, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {block.items.map((item, i) => (
          <li key={i} style={{ fontSize: 16, lineHeight: 1.65, color: "var(--muted)" }}>
            {item}
          </li>
        ))}
      </ul>
    );
  }
  // callout
  return (
    <aside
      style={{
        padding: "18px 22px",
        background: "var(--card)",
        border: "1px solid var(--hairline)",
        borderLeft: "3px solid var(--accent-brass)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono),monospace",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--accent-brass)",
          marginBottom: 6,
        }}
      >
        {block.label}
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--fg)", margin: 0 }}>{block.text}</p>
    </aside>
  );
}

export default function ReportPage({ params }: { params: { slug: string } }) {
  const r = getReportBySlug(params.slug);
  if (!r) notFound();

  const body = REPORT_BODIES[params.slug];
  const datePublished = reportDateIso(r.date);
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${siteConfig.url}/research/${params.slug}#article`,
    headline: r.title,
    description: r.desc,
    image: `${siteConfig.url}/opengraph-image`,
    datePublished,
    dateModified: datePublished,
    author: { "@id": `${siteConfig.url}#organization` },
    publisher: { "@id": `${siteConfig.url}#organization` },
    isAccessibleForFree: !r.gated,
    articleSection: r.catLabel,
    timeRequired: `PT${r.read}M`,
    inLanguage: "en-US",
    mainEntityOfPage: `${siteConfig.url}/research/${params.slug}`,
  };

  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: r.title,
            description: r.desc,
            path: `/research/${params.slug}`,
          }),
          breadcrumbsLd([
            { name: "Home", path: "/" },
            { name: "Research", path: "/research" },
            { name: r.title, path: `/research/${params.slug}` },
          ]),
          articleLd,
        ]}
      />
      <Nav active="research" />
      <main>
        <section className="ph">
          <div className="container">
            <div className="crumbs">
              <Link href="/">LEVANTER</Link>
              <span>/</span>
              <Link href="/research">Research</Link>
              <span>/</span> {r.iss}
            </div>
            <span className="eyebrow">
              {r.catLabel} · {r.date} · {r.read} min read
              {r.gated && (
                <span style={{ color: "var(--accent-amber)", marginLeft: 12 }}>· LEVANTER Pro</span>
              )}
            </span>
            <h1 className="display h1">{r.title}</h1>
            {body?.dek ? <p>{body.dek}</p> : <p>{r.desc}</p>}
          </div>
        </section>

        <section className="section" style={{ paddingTop: 56 }}>
          <div className="container" style={{ maxWidth: 760 }}>
            {/* Summary above the gate (Pro reports) */}
            {body?.summary && (
              <div
                style={{
                  marginBottom: 32,
                  padding: "20px 24px",
                  background: "var(--card)",
                  border: "1px solid var(--hairline)",
                  borderLeft: "3px solid var(--accent-amber)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono),monospace",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--accent-amber)",
                    marginBottom: 8,
                  }}
                >
                  Executive summary
                </div>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--fg)", margin: 0 }}>
                  {body.summary}
                </p>
              </div>
            )}

            {r.gated ? (
              <article
                className="b-card"
                style={{
                  padding: 48,
                  textAlign: "center",
                  background: "var(--ink-deep-petrol)",
                  color: "var(--ink-bone)",
                }}
              >
                <Lock
                  className="h-10 w-10"
                  strokeWidth={1.4}
                  style={{ color: "var(--accent-amber)", margin: "0 auto 16px" }}
                />
                <h2 className="display h2" style={{ color: "var(--ink-bone)", margin: "0 0 12px" }}>
                  Continue with LEVANTER Pro.
                </h2>
                <p
                  style={{
                    color: "rgba(241,236,220,.78)",
                    margin: "0 auto 28px",
                    maxWidth: "48ch",
                  }}
                >
                  The full report is gated to desk clients. If you have a LEVANTER login, sign in.
                  Otherwise, request access — desk clients are added automatically.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button asChild>
                    <Link href="/contact">
                      Request Pro access <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <a href="#">Sign in</a>
                  </Button>
                </div>
              </article>
            ) : body ? (
              <article style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                {body.blocks.map((b, i) => (
                  <Block key={i} block={b} />
                ))}
                <div
                  style={{
                    padding: "20px 24px",
                    border: "1px solid var(--hairline)",
                    background: "var(--card)",
                    borderLeft: "3px solid var(--accent-brass)",
                    fontSize: 14,
                    color: "var(--muted)",
                    fontFamily: "var(--font-mono),monospace",
                    marginTop: 12,
                  }}
                >
                  Filed under: {r.label} · {r.catLabel} · {r.iss}
                </div>
              </article>
            ) : (
              <article style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--muted)" }}>{r.desc}</p>
              </article>
            )}

            <div
              style={{
                marginTop: 48,
                paddingTop: 24,
                borderTop: "1px solid var(--hairline)",
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <Link
                href="/research"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--accent-brass)",
                }}
              >
                <ArrowLeft className="h-4 w-4" /> All research
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
                Send to desk <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
