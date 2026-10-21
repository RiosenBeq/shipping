import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { initialsColor } from "@/components/site/BrokerCard";
import { CtaBand } from "@/components/site/CtaBand";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
import { ReportCard } from "@/components/site/ReportCard";
import { Eyebrow, Section } from "@/components/site/Section";
import {
  REPORTS,
  getReportBySlug,
  reportDateIso,
  reportSlug,
  type Report,
} from "@/lib/data/research";
import { REPORT_BODIES, bodyText, type ReportBlock } from "@/lib/data/research-bodies";
import { getBroker, publishableBroker } from "@/lib/data/brokers";
import { articleLd, buildPageMetadata, webPageLd } from "@/lib/seo";
import { inquiryHref } from "@/lib/inquiry";
import { siteConfig } from "@/lib/site";
import { CHIP_STATIC } from "@/lib/utils";

type Props = { params: { slug: string } };

const DESKS = {
  lpg: {
    label: "LPG & ammonia",
    deskName: siteConfig.desks.lpg.label,
    // non-breaking spaces: the heading never breaks before the ampersand
    inline: "LPG\u00a0&\u00a0ammonia desk",
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

/** Cargo to preselect from a gas-desk note: ammonia notes ask about ammonia. */
const gasSegment = (r: Report) =>
  /ammonia|\bNH3\b/i.test(`${r.label} ${r.title}`) ? ("ammonia" as const) : ("lpg" as const);

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
  // noindex. Keep this route free of a loading.tsx (here or above; the index
  // skeleton lives in research/(index)/): a Suspense boundary over the page
  // turns its notFound() into HTTP 200 instead of 404.
  if (!r) notFound();
  const tags = r.label
    .split("·")
    .map((t) => t.trim())
    .filter(Boolean);
  const seoTitle = r.seoTitle ?? r.title;
  return buildPageMetadata({
    title: seoTitle,
    // Drop the " — LEVANTER" suffix when it would push the title past ~60 characters.
    absoluteTitle: seoTitle.length > 48,
    description: r.desc,
    path: `/research/${reportSlug(r)}`,
    keywords: [...tags, r.catLabel, ...DESKS[r.desk].keywords],
    article: {
      publishedTime: reportDateIso(r.date),
      modifiedTime: reportDateIso(r.updated ?? r.date),
      section: r.catLabel,
      authors: publishableBroker(getBroker(r.author)) ? [r.author] : undefined,
      tags,
    },
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
    case "ol":
      return (
        <ol>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    case "table":
      return (
        // Wide tables scroll inside their frame instead of widening the page.
        <div className="my-8 overflow-x-auto rounded-[10px] border border-line bg-white">
          <table className="w-full text-start text-[15px] leading-snug">
            <caption className="border-b border-line bg-sand/60 px-4 py-3 text-start text-xs font-semibold uppercase tracking-[0.12em] text-slate">
              {block.caption}
            </caption>
            <thead className="border-b border-line">
              <tr>
                {block.head.map((h, i) => (
                  <th key={i} scope="col" className="px-4 py-3 text-start font-semibold text-navy">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {block.rows.map((row, i) => (
                <tr key={i} className="align-top">
                  {row.map((cell, j) =>
                    j === 0 ? (
                      <th
                        key={j}
                        scope="row"
                        className="px-4 py-3 text-start font-medium text-navy"
                      >
                        {cell}
                      </th>
                    ) : (
                      <td key={j} className="tnum px-4 py-3 text-slate">
                        {cell}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "callout":
      return (
        // House accent: the kit card's 2px brass top rule (as on the desk card).
        // Part of the article, so a note rather than a complementary landmark.
        <div
          role="note"
          className="relative my-10 overflow-hidden rounded-lg border border-line bg-sand px-6 py-5 md:px-7 md:py-6"
        >
          <span
            className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brass to-brass-light"
            aria-hidden="true"
          />
          <Eyebrow size="sm" className="!mb-2">
            {block.label}
          </Eyebrow>
          <p className="!mb-0 text-base leading-relaxed text-navy">{block.text}</p>
          {block.link && (
            <p className="!mb-0 mt-3 text-[15px]">
              <Link href={block.link.href}>{block.link.label}</Link>
            </p>
          )}
        </div>
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
  const modified = reportDateIso(r.updated ?? r.date);
  const author = getBroker(r.author);

  const related = REPORTS.filter((o) => o.desk === r.desk && reportSlug(o) !== slug)
    .sort((a, b) => reportDateIso(b.date).localeCompare(reportDateIso(a.date)))
    .slice(0, 3);

  const requestMailto = `mailto:${siteConfig.desks.research.email}?subject=${encodeURIComponent(
    `Report request: ${r.title}`
  )}`;

  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: r.title,
            description: r.desc,
            path,
            dateModified: modified,
          }),
          articleLd({
            title: r.title,
            description: r.desc,
            path,
            datePublished: published,
            dateModified: modified,
            section: r.catLabel,
            author,
            keywords: tagList(r.label),
            gated: r.gated,
            text: body ? bodyText(body) : r.desc,
          }),
        ]}
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
            <span className={CHIP_STATIC}>
              <time dateTime={published.slice(0, 10)} className="font-mono text-xs">
                {r.date}
              </time>
            </span>
          </li>
          {r.updated && (
            <li>
              <span className={CHIP_STATIC}>
                Updated{" "}
                <time dateTime={modified.slice(0, 10)} className="font-mono text-xs">
                  {r.updated}
                </time>
              </span>
            </li>
          )}
          <li>
            <span className={CHIP_STATIC}>
              {r.gated ? "Summary · full report on request" : `${r.read} min read`}
            </span>
          </li>
          <li>
            <span className={CHIP_STATIC}>{issueLabel(r.iss)}</span>
          </li>
        </ul>
      </PageHeader>

      <section className="py-12 md:py-16">
        <div className="container grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
          <article className="min-w-0">
            {author && (
              <p className="mb-8 flex max-w-prose items-center gap-3 border-b border-line pb-6 text-sm text-slate">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-xs"
                  style={{ backgroundColor: author.color, color: initialsColor(author.color) }}
                >
                  {author.initials}
                </span>
                <span>
                  By <span className="font-semibold text-navy">{author.name}</span>, {author.title}{" "}
                  · {author.office}
                </span>
              </p>
            )}
            {r.gated ? (
              <>
                <div className="lv-prose">
                  <Eyebrow size="sm" className="!mb-2">
                    Summary
                  </Eyebrow>
                  <p>{body?.summary ?? r.desc}</p>
                  {body?.blocks.map((b, i) => <Block key={i} block={b} />)}
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
                    <span className={CHIP_STATIC}>{t}</span>
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

          {/* A labelled section, not an aside: a complementary landmark must
              not sit inside <main>. */}
          <section
            aria-labelledby="note-desk-title"
            className="lg:sticky lg:top-24 lg:self-start print:hidden"
          >
            <div className="uv-card !gap-0 !p-6">
              <span
                className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brass to-brass-light"
                aria-hidden="true"
              />
              <Eyebrow as="h2" size="sm" id="note-desk-title">
                {desk.deskName}
              </Eyebrow>
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
          </section>
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
        // Gas notes preselect their cargo (ammonia notes: ammonia, others: LPG);
        // tanker notes span crude and clean, so the visitor picks.
        inquiryHref={r.desk === "lpg" ? inquiryHref({ segment: gasSegment(r) }) : undefined}
      />
    </>
  );
}
