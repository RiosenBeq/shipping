import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, ArrowLeft } from "lucide-react";
import { Nav } from "../../components/Nav";
import { Footer } from "../../components/Footer";
import { JsonLd } from "../../components/JsonLd";
import { Button } from "@/components/ui/button";
import { REPORTS, getReportBySlug, reportSlug, reportDateIso } from "@/lib/data/research";
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

export default function ReportPage({ params }: { params: { slug: string } }) {
  const r = getReportBySlug(params.slug);
  if (!r) notFound();

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
                <span style={{ color: "var(--accent-amber)", marginLeft: 12 }}>
                  · LEVANTER Pro
                </span>
              )}
            </span>
            <h1 className="display h1">{r.title}</h1>
            <p>{r.desc}</p>
          </div>
        </section>

        <section className="section">
          <div className="container" style={{ maxWidth: 760 }}>
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
                <h2
                  className="display h2"
                  style={{ color: "var(--ink-bone)", margin: "0 0 12px" }}
                >
                  This is a LEVANTER Pro report.
                </h2>
                <p style={{ color: "rgba(241,236,220,.78)", margin: "0 auto 28px", maxWidth: 48 + "ch" }}>
                  Pro reports are gated to desk clients. If you have a LEVANTER login,
                  sign in. Otherwise, request access — desk clients are added automatically.
                </p>
                <div className="flex gap-3 flex-wrap justify-center">
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
            ) : (
              <article style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <p style={{ fontSize: 17, lineHeight: 1.7 }}>
                  This brief is the full text of the report as published in {r.iss}.
                  Numbers cited are indicative at time of writing — confirm current
                  rates with the desk before fixing.
                </p>
                <h2 className="display h2" style={{ marginTop: 12 }}>
                  Headline
                </h2>
                <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--muted)" }}>
                  {r.desc}
                </p>
                <h2 className="display h2" style={{ marginTop: 12 }}>
                  What it means
                </h2>
                <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--muted)" }}>
                  Full editorial content for &ldquo;{r.title}&rdquo; will appear here once the
                  desk publishes the long-form version. The summary above captures the
                  core takeaway — the desk will walk you through the underlying numbers
                  on request.
                </p>
                <div
                  style={{
                    padding: "20px 24px",
                    border: "1px solid var(--hairline)",
                    background: "var(--card)",
                    borderLeft: "3px solid var(--accent-brass)",
                    fontSize: 14,
                    color: "var(--muted)",
                    fontFamily: "var(--font-mono),monospace",
                  }}
                >
                  Filed under: {r.label} · {r.catLabel} · {r.iss}
                </div>
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
