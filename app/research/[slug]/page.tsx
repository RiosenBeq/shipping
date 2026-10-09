import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { siteConfig } from "@/lib/site";

type Props = { params: { slug: string } };

const DESKS = {
  lpg: {
    label: "LPG & ammonia",
    deskName: siteConfig.desks.lpg.label,
    inline: "LPG & ammonia desk",
    href: "/lpg",
    email: siteConfig.desks.lpg.email,
    keywords: ["LPG shipping", "LPG chartering", "gas carrier market"],
  },
  tankers: {
    label: "Tankers",
    deskName: siteConfig.desks.tankers.label,
    inline: "tanker desk",
    href: "/tankers",
    email: siteConfig.desks.tankers.email,
    keywords: ["tanker market", "tanker chartering", "crude tanker freight"],
  },
} as const satisfies Record<Report["desk"], unknown>;

const titleCase = (s: string) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());

/** "OCTOBER 2026" → "Issue October 2026"; "BRIEF" → "Brief". */
const issueLabel = (iss: string) => (/\d/.test(iss) ? `Issue ${titleCase(iss)}` : titleCase(iss));

export const dynamicParams = false;

export function generateStaticParams() {
  return REPORTS.map((r) => ({ slug: reportSlug(r) }));
}

export function generateMetadata({ params }: Props): Metadata {
  const r = getReportBySlug(params.slug);
  if (!r) return {};
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
        <aside className="my-8 rounded-r-lg border border-l-4 border-line border-l-brass bg-sand/60 px-6 py-5">
          <p className="!mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brass-ink">
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
        <span className="inline-flex items-center gap-1.5 text-sm text-slate">
          <CalendarDays className="h-4 w-4 text-brass" aria-hidden="true" />
          <time dateTime={published.slice(0, 10)}>{r.date}</time>
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm text-slate">
          <Clock className="h-4 w-4 text-brass" aria-hidden="true" />
          {r.read} min read
        </span>
        <span className="text-sm text-slate">{issueLabel(r.iss)}</span>
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
                <div className="mt-8 max-w-prose rounded-lg border border-line bg-white p-6 md:p-8">
                  <h2 className="font-display text-2xl leading-tight text-navy">
                    Full report on request
                  </h2>
                  <p className="mt-3 leading-relaxed text-slate">
                    The full report is sent by email. Write to the research desk and we will send
                    you a copy. There is no charge.
                  </p>
                  <Button asChild className="mt-6">
                    <a href={requestMailto}>
                      <Mail className="h-4 w-4" aria-hidden="true" /> Request the full report
                    </a>
                  </Button>
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

            <p className="mt-10 max-w-prose border-t border-line pt-5 text-xs uppercase tracking-[0.14em] text-slate">
              Filed under: {r.label}
            </p>
            <Link
              href="/research"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-brass-ink"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All research
            </Link>
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border border-line bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass-ink">
                {desk.deskName}
              </p>
              <p className="mt-3 leading-relaxed text-slate">
                Questions on this note, or a cargo or ship it affects? Talk to the brokers who wrote
                it.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Button asChild variant="dark">
                  <a href={`mailto:${desk.email}`}>
                    <Mail className="h-4 w-4" aria-hidden="true" /> Email the desk
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <Link href={desk.href}>
                    About the {desk.inline}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <Section
          tone="sand"
          eyebrow="Related"
          title={`More from the ${desk.inline}`}
          action={
            <Link
              href="/research"
              className="inline-flex items-center gap-2 font-semibold text-navy hover:text-brass-ink"
            >
              All research <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {related.map((o) => (
              <ReportCard key={o.slug} report={o} />
            ))}
          </div>
        </Section>
      )}

      <CtaBand
        email={r.desk === "lpg" ? siteConfig.desks.lpg.email : siteConfig.desks.tankers.email}
      />
    </>
  );
}
