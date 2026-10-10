import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, FileCheck2, Mail, Users } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow, Section } from "@/components/site/Section";
import { Faq } from "@/components/site/Faq";
import { CtaBand } from "@/components/site/CtaBand";
import { TankerArt } from "@/components/site/VesselArt";
import {
  TANKER_CLASSES,
  getTankerClassBySlug,
  type TankerClassData,
} from "@/lib/data/tanker-classes";
import { buildPageMetadata, serviceLd, webPageLd } from "@/lib/seo";
import { VESSEL_BY_CLASS, inquiryHref } from "@/lib/inquiry";
import { siteConfig } from "@/lib/site";
import { CHIP_STATIC, cn } from "@/lib/utils";

type Params = { params: { class: string } };

export function generateStaticParams() {
  return TANKER_CLASSES.map((t) => ({ class: t.slug }));
}
// Unknown slugs render on demand and hit notFound() (the styled 404); with two
// root layouts, `dynamicParams = false` would serve Next's unstyled default.

function copy(t: TankerClassData) {
  const family = t.family === "crude" ? "crude tanker" : "product tanker";
  return {
    title: `${t.shortName} Chartering — ${t.longName}`,
    description: `${t.shortName} ${family} chartering (${t.dwtRange}). Key routes ${t.routes
      .map((r) => r.code)
      .join(", ")}. Spot, time charter and COA from LEVANTER's tanker desk.`,
  };
}

/** "an Aframax", "a VLCC": the class name with its article, for running copy. */
const withArticle = (t: TankerClassData) => `${t.article} ${t.shortName}`;
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function faqFor(t: TankerClassData) {
  return [
    {
      q: `What size is ${withArticle(t)} tanker?`,
      a: `${capitalize(withArticle(t))} is typically ${t.dwtRange}, around ${t.loa} long with a ${t.draft} draft, carrying ${t.cargoCapacity}.`,
    },
    {
      q: `Which routes do ${t.plural} trade?`,
      a: `Key ${t.shortName} benchmarks include ${t.routes
        .map((r) => `${r.code} (${r.lane})`)
        .join(", ")}.`,
    },
    {
      q: `How are ${t.shortName} charters usually fixed?`,
      a: t.charterShape,
    },
  ];
}

export function generateMetadata({ params }: Params): Metadata {
  const t = getTankerClassBySlug(params.class);
  // Unknown slug: notFound() here too, so the head gets the not-found title and
  // noindex. Keep this route free of a loading.tsx (here or above): a Suspense
  // boundary over the page turns its notFound() into HTTP 200 instead of 404.
  if (!t) notFound();
  const { title, description } = copy(t);
  return buildPageMetadata({
    title,
    description,
    path: `/tankers/${t.slug}`,
    keywords: [
      `${t.shortName} chartering`,
      `${t.shortName} broker`,
      `${t.shortName} charter rates`,
      t.longName,
      ...t.routes.map((r) => `${r.code} ${r.lane}`),
    ],
  });
}

const EYEBROW = "text-xs font-semibold uppercase tracking-[0.16em] text-brass-ink";

export default function TankerClassPage({ params }: Params) {
  const t = getTankerClassBySlug(params.class);
  if (!t) notFound();
  const { title, description } = copy(t);
  const others = TANKER_CLASSES.filter((o) => o.slug !== t.slug);
  // Inquiries from this page arrive with the cargo and ship size preselected.
  const inquiry = inquiryHref({ segment: t.family, vessel: VESSEL_BY_CLASS[t.slug] });

  const specs = [
    { k: "Deadweight", v: t.dwtRange },
    { k: "Cargo", v: t.cargoCapacity },
    { k: "LOA / beam", v: `${t.loa} / ${t.beam}` },
    { k: "Draft", v: t.draft },
    { k: "Speed", v: t.speed },
    { k: "Consumption", v: t.consumption },
  ];

  return (
    <>
      <JsonLd
        data={[
          webPageLd({ title, description, path: `/tankers/${t.slug}` }),
          serviceLd({
            name: `${t.shortName} chartering`,
            description,
            serviceType:
              t.family === "crude" ? "Crude tanker chartering" : "Product tanker chartering",
            path: `/tankers/${t.slug}`,
          }),
        ]}
      />

      <PageHeader
        eyebrow={t.longName}
        title={`${t.shortName} chartering`}
        lead={t.intro}
        crumbs={[
          { name: "Tankers", path: "/tankers" },
          { name: t.shortName, path: `/tankers/${t.slug}` },
        ]}
        aside={
          <div className="uv-card !gap-0 !p-0 shadow-[0_24px_48px_-32px_rgba(10,31,51,0.45)]">
            <div className="relative isolate overflow-hidden bg-navy px-6 pb-2 pt-5 text-white/80">
              <div className="uv-hero-pattern [--uv-grid:48px]" aria-hidden="true" />
              <div className="relative z-[1] flex items-baseline justify-between gap-4">
                <Eyebrow dark size="sm">
                  At a glance
                </Eyebrow>
                <p className="font-mono text-xs text-fog">
                  {t.family === "crude" ? "Crude" : "Clean"} · {t.shortName}
                </p>
              </div>
              <TankerArt className="relative z-[1] mx-auto mt-4 w-full max-w-[340px]" />
            </div>
            <dl className="divide-y divide-line px-6">
              {specs.map((s) => (
                <div
                  key={s.k}
                  className="grid gap-1 py-3 text-sm sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-4"
                >
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate sm:pt-0.5">
                    {s.k}
                  </dt>
                  <dd className="tnum leading-relaxed text-navy">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        }
      >
        <Link href={inquiry} className="uv-btn uv-btn--lg w-full sm:w-auto">
          Request {t.shortName} tonnage <ArrowRight aria-hidden="true" />
        </Link>
        <a
          href={`mailto:${siteConfig.desks.tankers.email}?subject=${encodeURIComponent(`${t.shortName} inquiry`)}`}
          className="uv-btn-outline uv-btn--lg w-full sm:w-auto"
        >
          <Mail aria-hidden="true" />
          <span>Email the tanker desk</span>
        </a>
      </PageHeader>

      {/* Routes */}
      <Section eyebrow="Routes" title={`Key ${t.shortName} lanes.`}>
        <div className="overflow-hidden rounded-[10px] border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <caption className="sr-only">
                Key {t.shortName} routes, with benchmark code, lane and notes
              </caption>
              <thead className="border-b border-line bg-sand/60">
                <tr className="text-[11px] uppercase tracking-[0.14em] text-slate">
                  <th scope="col" className="w-28 px-4 py-3 text-start font-semibold sm:px-6">
                    Code
                  </th>
                  <th scope="col" className="px-4 py-3 text-start font-semibold sm:px-6">
                    Lane
                  </th>
                  <th
                    scope="col"
                    className="hidden px-6 py-3 text-start font-semibold md:table-cell"
                  >
                    Note
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {t.routes.map((r) => (
                  <tr key={r.code} className="align-top hover:bg-sand/30">
                    <th scope="row" className="px-4 py-4 text-start font-normal sm:px-6">
                      {/* same chip as the route codes on the /tankers fleet cards;
                          a block pulled up 4px so its 28px centre lines up with
                          the 20px first line of the lane and note text */}
                      <span
                        className={cn(
                          CHIP_STATIC,
                          "-my-1 !flex !min-h-[28px] w-fit font-mono !text-xs"
                        )}
                      >
                        {r.code}
                      </span>
                    </th>
                    <td className="px-4 py-4 sm:px-6">
                      <span className="font-medium text-navy">{r.lane}</span>
                      <p className="mt-1 leading-relaxed text-slate md:hidden">{r.note}</p>
                    </td>
                    <td className="hidden px-6 py-4 leading-relaxed text-slate md:table-cell">
                      {r.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10">
          <h3 id="charterers" className={EYEBROW}>
            Typical charterers
          </h3>
          <ul aria-labelledby="charterers" className="mt-4 flex flex-wrap gap-2">
            {t.marketsServed.map((m) => (
              <li key={m} className={cn(CHIP_STATIC, "max-w-full !whitespace-normal")}>
                {m}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Desk view */}
      <Section tone="sand" eyebrow="Desk view" title="What we watch before fixing.">
        <ol className="grid gap-x-8 gap-y-10 md:grid-cols-3">
          {t.keyTrends.map((k, i) => (
            <li
              key={k.title}
              className="relative border-t border-line pt-6 before:absolute before:-top-px before:start-0 before:h-0.5 before:w-12 before:bg-brass"
            >
              <span aria-hidden="true" className="font-mono text-xs text-brass-ink">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-navy">{k.title}</h3>
              <p className="mt-2 leading-relaxed text-slate">{k.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {[
            { Icon: FileCheck2, h: `How ${t.shortName} business is fixed`, body: t.charterShape },
            { Icon: Users, h: "Who covers it", body: t.desk },
          ].map(({ Icon, h, body }) => (
            <div key={h} className="uv-card !gap-4 !p-6 sm:!flex-row sm:!gap-5 sm:!p-7">
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-sand/60 text-brass-ink"
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-navy">{h}</h3>
                <p className="mt-2 leading-relaxed text-slate">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="FAQ" title={`${t.shortName} questions.`}>
        <Faq items={faqFor(t)} />
      </Section>

      {/* Compare */}
      <Section tone="sand" eyebrow="Other tanker sizes" title="Compare segments.">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {others.map((o) => (
            <li key={o.slug} className="flex">
              <Link href={`/tankers/${o.slug}`} className="uv-card w-full">
                <p className={EYEBROW}>{o.family === "crude" ? "Crude" : "Clean"}</p>
                <h3 className="uv-card__title font-display !text-2xl !font-normal">
                  {o.shortName}
                </h3>
                <p className="tnum text-sm">{o.dwtRange}</p>
                <span className="uv-card__meta pt-3 font-semibold !text-navy">
                  {o.shortName} guide
                </span>
                <span className="uv-card__arrow" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand
        title={`Looking for ${withArticle(t)}?`}
        text="Send the cargo, ports and laycan — or your open position. The tanker desk replies within 60 minutes during business hours."
        email={siteConfig.desks.tankers.email}
        inquiryHref={inquiry}
      />
    </>
  );
}
