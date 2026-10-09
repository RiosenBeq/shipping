import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
import { Section } from "@/components/site/Section";
import { Faq } from "@/components/site/Faq";
import { CtaBand } from "@/components/site/CtaBand";
import {
  TANKER_CLASSES,
  getTankerClassBySlug,
  type TankerClassData,
} from "@/lib/data/tanker-classes";
import { buildPageMetadata, serviceLd, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

type Params = { params: { class: string } };

export function generateStaticParams() {
  return TANKER_CLASSES.map((t) => ({ class: t.slug }));
}

export const dynamicParams = false;

function copy(t: TankerClassData) {
  const family = t.family === "crude" ? "crude tanker" : "product tanker";
  return {
    title: `${t.shortName} Chartering — ${t.longName}`,
    description: `${t.shortName} ${family} chartering (${t.dwtRange}). Key routes ${t.routes
      .map((r) => r.code)
      .join(", ")}. Spot, time charter and COA from LEVANTER's tanker desk.`,
  };
}

function faqFor(t: TankerClassData) {
  return [
    {
      q: `What size is a ${t.shortName} tanker?`,
      a: `A ${t.longName} is typically ${t.dwtRange}, around ${t.loa} long with a ${t.draft} draft, carrying ${t.cargoCapacity}.`,
    },
    {
      q: `Which routes do ${t.shortName}s trade?`,
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
  if (!t) return {};
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

export default function TankerClassPage({ params }: Params) {
  const t = getTankerClassBySlug(params.class);
  if (!t) notFound();
  const { title, description } = copy(t);
  const others = TANKER_CLASSES.filter((o) => o.slug !== t.slug);

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
          <dl className="divide-y divide-line rounded-lg border border-line bg-white">
            {specs.map((s) => (
              <div key={s.k} className="grid grid-cols-[110px_1fr] gap-4 px-5 py-3 text-sm">
                <dt className="text-slate">{s.k}</dt>
                <dd className="text-navy">{s.v}</dd>
              </div>
            ))}
          </dl>
        }
      >
        <Button asChild size="lg" variant="dark">
          <Link href={`/contact?segment=${t.family}`}>
            Request {t.shortName} tonnage <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </PageHeader>

      <Section eyebrow="Routes" title={`Key ${t.shortName} lanes`}>
        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand/70 text-xs uppercase tracking-[0.12em] text-slate">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Code
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Lane
                </th>
                <th scope="col" className="hidden px-5 py-3 font-semibold md:table-cell">
                  Note
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {t.routes.map((r) => (
                <tr key={r.code}>
                  <td className="px-5 py-4 font-mono text-xs font-semibold text-navy">{r.code}</td>
                  <td className="px-5 py-4 font-medium text-navy">
                    {r.lane}
                    <p className="mt-1 font-normal text-slate md:hidden">{r.note}</p>
                  </td>
                  <td className="hidden px-5 py-4 text-slate md:table-cell">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Typical charterers">
          {t.marketsServed.map((m) => (
            <li
              key={m}
              className="rounded-full border border-line bg-white px-3 py-1.5 text-sm text-navy"
            >
              {m}
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="sand" eyebrow="Desk view" title="What we are watching.">
        <div className="grid gap-8 md:grid-cols-3">
          {t.keyTrends.map((k) => (
            <div key={k.title} className="border-t-2 border-brass pt-4">
              <h3 className="font-semibold text-navy">{k.title}</h3>
              <p className="mt-2 leading-relaxed text-slate">{k.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-lg border border-line bg-white p-6">
            <h3 className="font-semibold text-navy">How {t.shortName} business is fixed</h3>
            <p className="mt-2 leading-relaxed text-slate">{t.charterShape}</p>
          </div>
          <div className="rounded-lg border border-line bg-white p-6">
            <h3 className="font-semibold text-navy">Who covers it</h3>
            <p className="mt-2 leading-relaxed text-slate">{t.desk}</p>
          </div>
        </div>
      </Section>

      <Section eyebrow="FAQ" title={`${t.shortName} questions`}>
        <Faq items={faqFor(t)} />
      </Section>

      <Section tone="sand" eyebrow="Other tanker sizes" title="Compare segments">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {others.map((o) => (
            <Link
              key={o.slug}
              href={`/tankers/${o.slug}`}
              className="group rounded-lg border border-line bg-white p-5 hover:border-navy/40"
            >
              <p className="font-display text-xl text-navy">{o.shortName}</p>
              <p className="mt-1 text-sm text-slate">{o.dwtRange}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-navy group-hover:text-brass-ink">
                View <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <CtaBand
        title={`Looking for a ${t.shortName}?`}
        text="Send the cargo, ports and laycan — or your open position. The tanker desk replies within 60 minutes during business hours."
        email={siteConfig.desks.tankers.email}
      />
    </>
  );
}
