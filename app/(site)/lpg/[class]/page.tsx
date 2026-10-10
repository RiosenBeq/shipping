import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, FileCheck2, Mail, Users } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow, Section } from "@/components/site/Section";
import { Faq } from "@/components/site/Faq";
import { CtaBand } from "@/components/site/CtaBand";
import { GasCarrierArt, PressurisedGasArt } from "@/components/site/VesselArt";
import { LPG_CLASSES, getLpgClassBySlug } from "@/lib/data/lpg-classes";
import { buildPageMetadata, serviceLd, webPageLd } from "@/lib/seo";
import { lpgClassInquiryHref } from "@/lib/inquiry";
import { siteConfig } from "@/lib/site";
import { CHIP_STATIC, cn } from "@/lib/utils";

type Params = { params: { class: string } };

export function generateStaticParams() {
  return LPG_CLASSES.map((c) => ({ class: c.slug }));
}
// Unknown slugs render on demand and hit notFound() (the styled 404); with two
// root layouts, `dynamicParams = false` would serve Next's unstyled default.

function copy(slug: string) {
  const c = getLpgClassBySlug(slug)!;
  return {
    title: `${c.name} Chartering — ${c.longName}`,
    description: `${c.name} chartering from LEVANTER's LPG desk: ${c.capacity.toLowerCase()}, ${c.cargoes
      .slice(0, 3)
      .join(", ")
      .toLowerCase()}. Spot, time charter and COA.`,
  };
}

export function generateMetadata({ params }: Params): Metadata {
  const c = getLpgClassBySlug(params.class);
  // Unknown slug: notFound() here too, so the head gets the not-found title and
  // noindex. Keep this route free of a loading.tsx (here or above): a Suspense
  // boundary over the page turns its notFound() into HTTP 200 instead of 404.
  if (!c) notFound();
  const { title, description } = copy(c.slug);
  return buildPageMetadata({
    title,
    description,
    path: `/lpg/${c.slug}`,
    keywords: [
      `${c.name} chartering`,
      `${c.name} broker`,
      `${c.name} charter rates`,
      `${c.longName}`,
      "LPG shipbroker",
      ...c.cargoes.slice(0, 3).map((x) => `${x} shipping`),
    ],
  });
}

const EYEBROW = "text-xs font-semibold uppercase tracking-[0.16em] text-brass-ink";

export default function LpgClassPage({ params }: Params) {
  const c = getLpgClassBySlug(params.class);
  if (!c) notFound();
  const { title, description } = copy(c.slug);
  const others = LPG_CLASSES.filter((o) => o.slug !== c.slug);
  // Pressurised coasters carry cylindrical deck tanks, not a refrigerated trunk deck.
  const Art = c.slug === "pressurised" ? PressurisedGasArt : GasCarrierArt;
  // Inquiries from this page arrive with the ship size preselected, and the
  // cargo too where the class mainly trades LPG (MGC/Handysize: visitor picks).
  const inquiry = lpgClassInquiryHref(c.slug);

  const specs = [
    { k: "Capacity", v: c.capacity },
    { k: "Containment", v: c.containment },
    { k: "Typical cargo", v: c.typicalCargo },
    { k: "Cargoes", v: c.cargoes.join(", ") },
  ];

  return (
    <>
      <JsonLd
        data={[
          webPageLd({ title, description, path: `/lpg/${c.slug}` }),
          serviceLd({
            name: `${c.name} chartering`,
            description,
            serviceType: `${c.longName} chartering`,
            path: `/lpg/${c.slug}`,
          }),
        ]}
      />

      <PageHeader
        eyebrow={c.longName}
        title={`${c.name} chartering`}
        lead={c.intro}
        crumbs={[
          { name: "LPG & Ammonia", path: "/lpg" },
          { name: c.name, path: `/lpg/${c.slug}` },
        ]}
        aside={
          <div className="uv-card !gap-0 !p-0 shadow-[0_24px_48px_-32px_rgba(10,31,51,0.45)]">
            <div className="relative isolate overflow-hidden bg-navy px-6 pb-2 pt-5 text-white/80">
              <div className="uv-hero-pattern [--uv-grid:48px]" aria-hidden="true" />
              <div className="relative z-[1] flex items-baseline justify-between gap-4">
                <Eyebrow dark size="sm">
                  At a glance
                </Eyebrow>
                <p className="font-mono text-xs text-fog">LPG · {c.name.replace(/ LPG$/, "")}</p>
              </div>
              <Art className="relative z-[1] mx-auto mt-4 w-full max-w-[340px]" />
            </div>
            <dl className="divide-y divide-line px-6">
              {specs.map((s) => (
                <div
                  key={s.k}
                  className="grid gap-1 py-3.5 text-sm sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-4"
                >
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate sm:pt-0.5">
                    {s.k}
                  </dt>
                  <dd className="leading-relaxed text-navy">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        }
      >
        <Link href={inquiry} className="uv-btn uv-btn--lg w-full sm:w-auto">
          Request {c.name} tonnage <ArrowRight aria-hidden="true" />
        </Link>
        <a
          href={`mailto:${siteConfig.desks.lpg.email}?subject=${encodeURIComponent(`${c.name} inquiry`)}`}
          className="uv-btn-outline uv-btn--lg w-full sm:w-auto"
        >
          <Mail aria-hidden="true" />
          <span>Email the LPG desk</span>
        </a>
      </PageHeader>

      {/* Routes */}
      <Section eyebrow="Routes" title={`Key ${c.name} trades.`}>
        <div className="overflow-hidden rounded-[10px] border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <caption className="sr-only">
                Key {c.name} routes, with benchmark code, lane and notes
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
                {c.routes.map((r) => (
                  <tr key={r.code + r.lane} className="align-top hover:bg-sand/30">
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
          <h3 id="trades" className={EYEBROW}>
            Main trades
          </h3>
          {/* kit chips, like "Typical charterers" on the tanker class pages */}
          <ul aria-labelledby="trades" className="mt-4 flex flex-wrap gap-2">
            {c.trades.map((t) => (
              <li key={t} className={cn(CHIP_STATIC, "max-w-full !whitespace-normal")}>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Desk view */}
      <Section tone="sand" eyebrow="Desk view" title="What we watch before fixing.">
        <ol className="grid gap-x-8 gap-y-10 md:grid-cols-3">
          {c.watchpoints.map((w, i) => (
            <li
              key={w.title}
              className="relative border-t border-line pt-6 before:absolute before:-top-px before:start-0 before:h-0.5 before:w-12 before:bg-brass"
            >
              <span aria-hidden="true" className="font-mono text-xs text-brass-ink">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-navy">{w.title}</h3>
              <p className="mt-2 leading-relaxed text-slate">{w.body}</p>
            </li>
          ))}
        </ol>
        {/* same pair of cards as the tanker class pages */}
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {[
            { Icon: FileCheck2, h: `How ${c.name} business is fixed`, body: c.charterShape },
            { Icon: Users, h: "Who covers it", body: c.desk },
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

      <Section eyebrow="FAQ" title={`${c.name} questions.`}>
        <Faq items={c.faq} />
      </Section>

      {/* Compare */}
      <Section tone="sand" eyebrow="Other gas carrier sizes" title="Compare segments.">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((o) => (
            <li key={o.slug} className="flex">
              <Link href={`/lpg/${o.slug}`} className="uv-card w-full">
                <p className={EYEBROW}>{o.longName}</p>
                <h3 className="uv-card__title font-display !text-2xl !font-normal">{o.name}</h3>
                <p className="text-sm leading-relaxed">{o.capacity}</p>
                <span className="uv-card__meta pt-3 font-semibold !text-navy">{o.name} guide</span>
                <span className="uv-card__arrow" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand
        title={`Looking for ${c.ctaNoun}?`}
        text="Send the cargo, ports and laycan — or your open position. The LPG desk replies within 60 minutes during business hours."
        email={siteConfig.desks.lpg.email}
        inquiryHref={inquiry}
      />
    </>
  );
}
