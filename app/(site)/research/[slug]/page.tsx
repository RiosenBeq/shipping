import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { CtaBand } from "@/components/site/CtaBand";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
import { ReportCard } from "@/components/site/ReportCard";
import { Section } from "@/components/site/Section";
import {
  REPORTS,
  getReportBySlug,
  reportDateIso,
  reportSlug,
  type Report,
} from "@/lib/data/research";
import { REPORT_BODIES, type ReportBlock } from "@/lib/data/research-bodies";
import { articleLd, buildPageMetadata } from "@/lib/seo";
import { inquiryHref } from "@/lib/inquiry";
import { siteConfig } from "@/lib/site";

type Props = { params: { slug: string } };

const DESKS = {
  lpg: {
    label: "LPG & ammonia",
    deskName: siteConfig.desks.lpg.label,
    inline: "LPG & ammonia desk",
    short: "LPG",
    href: "/lpg",
    email: siteConfig.desks.lpg.email,
    keywords: ["LPG shipping", "LPG chartering", "gas carrier market"],
  },
  tankers: {
    label: "Tankers",
    deskName: siteConfig.desks.tankers.label,
    inline: "tanker desk",
    short: "tanker",
    href: "/tankers",
    email: siteConfig.desks.tankers.email,
    keywords: ["tanker market", "tanker chartering", "crude tanker freight"],
  },
} as const satisfies Record<Report["desk"], unknown>;

const titleCase = (s: string) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());

/** "OCTOBER 2026" → "Issue October 2026"; "BRIEF" → "Brief". */
const issueLabel = (iss: string) => (/\d/.test(iss) ? `Issue ${titleCase(iss)}` : titleCase(iss));

/** "LPG · PRESSURISED" → ["LPG", "Pressurised"]: keep codes (VLGC, TD3C), soften long words. */
const tagList = (label: string) =>
  label
    .split("·")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => t.replace(/\b[A-Z]{5,}\b/g, (w) => w[0] + w.slice(1).toLowerCase()));

export function generateStaticParams() {
  return REPORTS.map((r) => ({ slug: reportSlug(r) }));
}
// Unknown slugs render on demand and hit notFound() (the styled 404); with two
// root layouts, `dynamicParams = false` would serve Next's unstyled default.

export function generateMetadata({ params }: Props): Metadata {
  const r = getReportBySlug(params.slug);
  // Unknown slug: notFound() here too, so the head gets the not-found title and
  // noindex. The page's own notFound() fires inside the loading.tsx Suspense
  // boundary, after the head is chosen (Next 14 then answers 200 + noindex).
  if (!r) notFound();
  const tags = r.label
    .split("·")
    .map((t) => t.trim())
    .filter(Boolean);
  return buildPageMetadata({
    title: r.title,
    description: r.desc,
    path: `/research/${reportSlug(r)}`,
    keywords: [...tags, r.catLabel, ...DESKS[r.desk].keywords],
    article: { publishedTime: reportDateIso(r.date), section: r.catLabel },
  });
}

function Block({ block }: { block: ReportBlock }) {
  switch (block.kind) {
    case "p":
      return <p>{block.text}</p>;
    case "h2":
      return <h2>{block.text}</h2>;
    case "ul":
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <aside className="relative my-10 overflow-hidden rounded-lg border border-line bg-sand px-6 py-5 md:px-7 md:py-6">
          <span className="absolute inset-y-0 left-0 w-[3px] bg-brass" aria-hidden="true" />
          <p className="!mb-2 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-brass-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-brass" aria-hidden="true" />
            {block.label}
          </p>
          <p className="!mb-0 text-base leading-relaxed text-navy">{block.text}</p>
        </aside>
      );
  }
}

export default function ReportPage({ params }: Props) {
  const r = getReportBySlug(params.slug);
  if (!r) notFound();

  const slug = reportSlug(r);
  const path = `/research/${slug}`;
  const body = REPORT_BODIES[slug];
  const desk = DESKS[r.desk];
  const published = reportDateIso(r.date);

  const related = REPORTS.filter((o) => o.desk === r.desk && reportSlug(o) !== slug)
    .sort((a, b) => reportDateIso(b.date).localeCompare(reportDateIso(a.date)))
    .slice(0, 3);

  const requestMailto = `mailto:${siteConfig.desks.research.email}?subject=${encodeURIComponent(
    `Report request: ${r.title}`
  )}`;

  return (
    <>
      <JsonLd
        data={articleLd({
          title: r.title,
          description: r.desc,
          path,
          datePublished: published,
          section: r.catLabel,
        })}
      />

      <PageHeader
        eyebrow={`${desk.label} · ${r.catLabel}`}
        title={r.title}
        lead={body?.dek ?? r.desc}
        crumbs={[
          { name: "Research", path: "/research" },
          { name: r.title, path },
        ]}
      >
        <ul className="flex flex-wrap gap-2" aria-label="About this note">
          <li>
            <span className="uv-chip">
              <time dateTime={published.slice(0, 10)} className="font-mono text-xs">
                {r.date}
              </time>
            </span>
          </li>
          <li>
            <span className="uv-chip">
              {r.gated ? "Summary · full report on request" : `${r.read} min read`}
            </span>
          </li>
          <li>
            <span className="uv-chip">{issueLabel(r.iss)}</span>
          </li>
        </ul>
      </PageHeader>

      <section className="py-12 md:py-16">
        <div className="container grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
          <article>
            {r.gated ? (
              <>
                <div className="lv-prose">
                  <p className="!mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brass-ink">
                    Summary
                  </p>
                  <p>{body?.summary ?? r.desc}</p>
                </div>
                {/* static kit card (shared border, radius, colours) with the brass top rule */}
                <div className="uv-card mt-10 max-w-prose !gap-0 !p-6 md:!p-8">
                  <span
                    className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brass to-brass-light"
                    aria-hidden="true"
                  />
                  <h2 className="font-display text-2xl leading-tight text-navy md:text-[28px]">
                    Full report on request
                  </h2>
                  <p className="mt-3 leading-relaxed text-slate">
                    The full report is sent by email. Write to the research desk and we will send
                    you a copy. There is no charge.
                  </p>
                  <a href={requestMailto} className="uv-btn mt-6 self-start">
                    <Mail aria-hidden="true" />
                    <span>Request the full report</span>
                  </a>
                </div>
              </>
            ) : (
              <div className="lv-prose">
                {body && body.blocks.length > 0 ? (
                  body.blocks.map((b, i) => <Block key={i} block={b} />)
                ) : (
                  <p>{r.desc}</p>
                )}
              </div>
            )}

            <div className="mt-12 flex max-w-prose flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate">
                Filed under
              </p>
              <ul className="flex flex-wrap gap-2">
                {tagList(r.label).map((t) => (
                  <li key={t}>
                    <span className="uv-chip">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-8">
              <Link
                href="/research"
                className="uv-link inline-flex items-center gap-2 text-sm font-semibold text-navy"
              >
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                All research
              </Link>
            </p>
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start print:hidden">
            <div className="uv-card !gap-0 !p-6">
              <span
                className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brass to-brass-light"
                aria-hidden="true"
              />
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-brass-ink">
                <span className="h-px w-6 bg-brass" aria-hidden="true" />
                {desk.deskName}
              </p>
              <p className="mt-4 leading-relaxed text-slate">
                Questions on this note, or a cargo or ship it affects? Talk to the brokers who wrote
                it.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <a href={`mailto:${desk.email}`} className="uv-btn">
                  <Mail aria-hidden="true" />
                  <span>Email the desk</span>
                </a>
                {/* short enough for one line in the 300px aside */}
                <Link href={desk.href} className="uv-btn-outline">
                  About the {desk.short} desk
                  <ArrowRight aria-hidden="true" />
                </Link>
              </div>
              <p className="mt-4 text-center font-mono text-[12px] text-slate" dir="ltr">
                <span className="select-all">{desk.email}</span>
              </p>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <Section
          tone="sand"
          eyebrow="Related"
          title={`More from the ${desk.inline}.`}
          className="print:hidden"
          action={
            <Link href="/research" className="uv-btn-outline">
              All research
              <ArrowRight aria-hidden="true" />
            </Link>
          }
        >
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {related.map((o) => (
              <li key={o.slug}>
                <ReportCard report={o} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <CtaBand
        email={r.desk === "lpg" ? siteConfig.desks.lpg.email : siteConfig.desks.tankers.email}
        // LPG notes preselect LPG; tanker notes span crude and clean, so the visitor picks.
        inquiryHref={r.desk === "lpg" ? inquiryHref({ segment: "lpg" }) : undefined}
      />
    </>
  );
}
