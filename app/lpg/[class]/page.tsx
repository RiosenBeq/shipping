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
import { LPG_CLASSES, getLpgClassBySlug } from "@/lib/data/lpg-classes";
import { buildPageMetadata, serviceLd, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

type Params = { params: { class: string } };

export function generateStaticParams() {
  return LPG_CLASSES.map((c) => ({ class: c.slug }));
}

export const dynamicParams = false;

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
  if (!c) return {};
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

export default function LpgClassPage({ params }: Params) {
  const c = getLpgClassBySlug(params.class);
  if (!c) notFound();
  const { title, description } = copy(c.slug);
  const others = LPG_CLASSES.filter((o) => o.slug !== c.slug);

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
          <dl className="divide-y divide-line rounded-lg border border-line bg-white">
            {specs.map((s) => (
              <div key={s.k} className="grid grid-cols-[110px_1fr] gap-4 px-5 py-3.5 text-sm">
                <dt className="text-slate">{s.k}</dt>
                <dd className="text-navy">{s.v}</dd>
              </div>
            ))}
          </dl>
        }
      >
        <Button asChild size="lg" variant="dark">
          <Link href="/contact?segment=lpg">
            Request {c.name} tonnage <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </PageHeader>

      <Section eyebrow="Routes" title={`Key ${c.name} trades`}>
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
              {c.routes.map((r) => (
                <tr key={r.code + r.lane}>
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
        <ul className="mt-6 flex flex-wrap gap-2">
          {c.trades.map((t) => (
            <li
              key={t}
              className="rounded-full border border-line bg-white px-3 py-1.5 text-sm text-navy"
            >
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="sand" eyebrow="Desk view" title="What we watch before fixing.">
        <div className="grid gap-8 md:grid-cols-3">
          {c.watchpoints.map((w) => (
            <div key={w.title} className="border-t-2 border-brass pt-4">
              <h3 className="font-semibold text-navy">{w.title}</h3>
              <p className="mt-2 leading-relaxed text-slate">{w.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-lg border border-line bg-white p-6">
          <h3 className="font-semibold text-navy">How {c.name} business is fixed</h3>
          <p className="mt-2 leading-relaxed text-slate">{c.charterShape}</p>
        </div>
      </Section>

      <Section eyebrow="FAQ" title={`${c.name} questions`}>
        <Faq items={c.faq} />
      </Section>

      <Section tone="sand" eyebrow="Other gas carrier sizes" title="Compare segments">
        <div className="grid gap-4 sm:grid-cols-3">
          {others.map((o) => (
            <Link
              key={o.slug}
              href={`/lpg/${o.slug}`}
              className="group rounded-lg border border-line bg-white p-5 hover:border-navy/40"
            >
              <p className="font-display text-xl text-navy">{o.name}</p>
              <p className="mt-1 text-sm text-slate">{o.capacity}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-navy group-hover:text-brass-ink">
                View <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <CtaBand
        title={`Looking for a ${c.name}?`}
        text="Send the cargo, ports and laycan — or your open position. The LPG desk replies within 60 minutes during business hours."
        email={siteConfig.desks.lpg.email}
      />
    </>
  );
}
