import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, ArrowLeft } from "lucide-react";
import { Nav } from "../../components/Nav";
import { Footer } from "../../components/Footer";
import { JsonLd } from "../../components/JsonLd";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { ContactCta } from "../../components/ContactCta";
import { Button } from "@/components/ui/button";
import { REPORTS, getReportBySlug, reportSlug, reportDateIso } from "@/lib/data/research";
import { REPORT_BODIES, type ReportBlock } from "@/lib/data/research-bodies";
import { absoluteUrl, buildPageMetadata, breadcrumbsLd, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const contactWithNote = (note: string) => `/contact?notes=${encodeURIComponent(note)}`;

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
  const published = reportDateIso(r.date);
  return buildPageMetadata({
    title: r.title,
    description: r.desc,
    path: `/research/${params.slug}`,
    keywords: [r.label, r.catLabel, "tanker market research"],
    // Pro reports only show a short public summary, so they stay out of the index
    // until a fuller public abstract exists.
    noindex: r.gated,
    article: { publishedTime: published, section: r.catLabel },
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
    <div
      role="note"
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
    </div>
  );
}

export default function ReportPage({ params }: { params: { slug: string } }) {
  const r = getReportBySlug(params.slug);
  if (!r) notFound();

  const body = REPORT_BODIES[params.slug];
  const path = `/research/${params.slug}`;
  const datePublished = reportDateIso(r.date);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Research", path: "/research" },
    { name: r.title, path },
  ];
  const related = REPORTS.filter((x) => x !== r && (x.cat === r.cat || !x.gated)).slice(0, 3);
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${absoluteUrl(path)}#article`,
    headline: r.title,
    description: r.desc,
    image: absoluteUrl(siteConfig.ogImage),
    datePublished,
    dateModified: datePublished,
    author: {
      "@type": "Organization",
      "@id": `${siteConfig.url}#organization`,
      name: siteConfig.legalEntity,
      url: siteConfig.url,
    },
    publisher: { "@id": `${siteConfig.url}#organization` },
    isAccessibleForFree: !r.gated,
    articleSection: r.catLabel,
    timeRequired: `PT${r.read}M`,
    inLanguage: "en",
    mainEntityOfPage: absoluteUrl(path),
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
          breadcrumbsLd(crumbs),
          articleLd,
        ]}
      />
      <Nav active="research" />
      <main id="main">
        <section className="ph">
          <div className="container">
            <Breadcrumbs crumbs={crumbs} />
            <span className="eyebrow">
              {r.catLabel} · <time dateTime={datePublished.slice(0, 10)}>{r.date}</time> · {r.read}{" "}
              min read
              {r.gated && <span style={{ marginLeft: 12 }}>· LEVANTER Pro</span>}
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
                  The full report is shared with desk clients. Request access and the desk will get
                  back to you.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button asChild>
                    <Link href={contactWithNote(`Pro access request: ${r.title}`)}>
                      Request Pro access <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </article>
            ) : body ? (
              <article style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                {body.blocks.map((b, i) => (
                  <Block key={i} block={b} />
                ))}
                <p className="disclaimer">
                  Desk commentary as at {r.date} ({r.label} · {r.iss}). Figures are indicative, may
                  have changed since publication and are not investment advice.
                </p>
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
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All research
              </Link>
              <Link
                href={contactWithNote(`Re: ${r.title}`)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--accent-brass)",
                }}
              >
                Ask the desk about this note <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {related.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <h2 className="eyebrow" style={{ display: "block", marginBottom: 12 }}>
                  More from the desk
                </h2>
                <ul className="related-list">
                  {related.map((x) => (
                    <li key={x.title}>
                      <Link href={`/research/${reportSlug(x)}`}>
                        <span className="meta">
                          {x.catLabel} · {x.date}
                          {x.gated ? " · Pro" : ""}
                        </span>
                        {x.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
        <ContactCta
          headline={r.gated ? "Want the full Pro report?" : "Take this view to the desk."}
          body={
            r.gated
              ? "Pro reports are gated to desk clients. Request access — we'll set you up if you're already on the desk roster, or schedule a call if not."
              : "Have a follow-up question on this view, or a fixture that's affected? The desk replies within 60 minutes during business hours."
          }
          context={`research: ${r.title}`}
        />
      </main>
      <Footer />
    </>
  );
}
