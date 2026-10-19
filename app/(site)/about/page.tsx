import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, ListChecks, ShieldCheck, UserCheck } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
import { Section } from "@/components/site/Section";
import { Faq } from "@/components/site/Faq";
import { CtaBand } from "@/components/site/CtaBand";
import { BROKERS } from "@/lib/data/brokers";
import { ABOUT_FAQ } from "@/lib/data/faqs";
import { LOCALES } from "@/lib/i18n";
import { buildPageMetadata, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const PATH = "/about";
const TITLE = "About LEVANTER — Tanker & LPG Shipbrokers";
const DESCRIPTION =
  "LEVANTER is a tanker and LPG shipbroker founded in Istanbul in 2024, with brokers in London and Singapore: two desks, senior brokers, compliance first.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  absoluteTitle: true,
  keywords: [
    "about LEVANTER",
    "shipbroker Istanbul",
    "Turkish shipbroker",
    "tanker and LPG broker",
    "independent shipbroker",
  ],
});

const LANGUAGES = Array.from(new Set(BROKERS.flatMap((b) => b.languages)));

const FACTS = [
  { k: "Founded", v: `${siteConfig.founded}, Istanbul` },
  { k: "Headquarters", v: `${siteConfig.address.street}, ${siteConfig.address.locality}` },
  { k: "Offices", v: siteConfig.offices.map((o) => o.city).join(" · ") },
  { k: "Desks", v: "Tankers · LPG & ammonia" },
  { k: "Brokers", v: String(BROKERS.length) },
  { k: "Languages", v: `${LANGUAGES.length} spoken by the team` },
];

const PRINCIPLES = [
  {
    Icon: Compass,
    title: "Narrow on purpose",
    text: "Tankers and gas carriers only. No dry bulk, no containers, no sale and purchase: every broker follows the same ships, terminals and charterers every day.",
  },
  {
    Icon: UserCheck,
    title: "One broker throughout",
    text: "The broker who answers your first message works the fixture, negotiates the charter party and follows the voyage through laytime and claims.",
  },
  {
    Icon: ListChecks,
    title: "Numbers you can check",
    text: "Every freight idea comes with its TCE and the assumptions behind it: speed, consumption, port days, routing, transit time and costs.",
  },
  {
    Icon: ShieldCheck,
    title: "Compliance first",
    text: "Counterparties, ships and cargoes are screened before an offer is made. We decline business that fails review.",
  },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={webPageLd({
          title: TITLE,
          description: DESCRIPTION,
          path: PATH,
          type: "AboutPage",
          dateModified: "2026-10-19",
          about: { "@id": `${siteConfig.url}#organization` },
        })}
      />

      <PageHeader
        eyebrow="About LEVANTER"
        title="A tanker and LPG broker, built on the Bosphorus."
        lead="We started LEVANTER in Istanbul in 2024 because the Black Sea, the Mediterranean and the Turkish Straits deserve a desk that lives with them every day. Today two desks fix tankers and gas carriers worldwide from Istanbul, London and Singapore."
        crumbs={[{ name: "About", path: PATH }]}
      >
        <Link href="/brokers" className="uv-btn uv-btn--lg w-full sm:w-auto">
          Meet the team <ArrowRight aria-hidden="true" />
        </Link>
        <Link href="/contact" className="uv-btn-outline uv-btn--lg w-full sm:w-auto">
          Send an inquiry
        </Link>
      </PageHeader>

      <section aria-label="Company facts" className="border-b border-line bg-white">
        <dl className="container grid gap-x-8 gap-y-6 py-10 sm:grid-cols-2 lg:grid-cols-3 lg:py-12">
          {FACTS.map((f) => (
            <div key={f.k} className="border-s-2 border-brass ps-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate">
                {f.k}
              </dt>
              <dd className="mt-1 text-lg text-navy">{f.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Section eyebrow="Our story" title="Why a broker on the Straits.">
        <div className="lv-prose">
          <p>
            Most of the world&apos;s large shipbrokers sit in London, Singapore, Houston or Oslo.
            Yet some of the busiest and most complicated liquid trades run past our office window:
            Black Sea crude and products through the Bosphorus, LPG into one of the world&apos;s
            largest autogas markets, and small gas carriers distributing across the Mediterranean.
          </p>
          <p>
            Those trades reward local knowledge. Transit queues, terminal limits and regional
            charterers decide whether a voyage earns money, and they change by the day. We built
            LEVANTER around that: a tanker desk and an LPG &amp; ammonia desk in Istanbul, with
            brokers in London for the Atlantic basin and in Singapore for business East of Suez.
          </p>
          <p>
            We stay small and specialised. Clients talk to senior brokers, see the assumptions
            behind every number, and get a first reply within 60 minutes during business hours.
          </p>
        </div>
      </Section>

      <Section tone="sand" eyebrow="How we work" title="Four principles on every fixture.">
        <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map(({ Icon, title, text }) => (
            <li
              key={title}
              className="relative border-t border-line pt-6 before:absolute before:-top-px before:start-0 before:h-0.5 before:w-12 before:bg-brass"
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/60 text-brass-ink"
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-navy">{title}</h3>
              <p className="mt-2 leading-relaxed text-slate">{text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-10">
          <Link href="/compliance" className="uv-link font-semibold text-navy">
            How we screen every fixture
          </Link>
        </p>
      </Section>

      <Section eyebrow="Offices" title="Three time zones, one team.">
        <ul className="grid gap-5 md:grid-cols-3">
          {siteConfig.offices.map((o) => (
            <li key={o.city} className="uv-card !p-6 sm:!p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass-ink">
                {o.country}
              </p>
              <h3 className="font-display text-[28px] leading-tight text-navy">{o.city}</h3>
              <p className="leading-relaxed text-slate">{o.role}</p>
              <p className="text-sm text-slate">
                {BROKERS.filter((b) => b.office === o.city).length} brokers
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-2xl leading-relaxed text-slate">
          Overview pages are available in {LOCALES.length} languages for clients in the main
          shipping markets. Between us we speak {LANGUAGES.join(", ")}.
        </p>
      </Section>

      <Section tone="sand" eyebrow="FAQ" title="About LEVANTER.">
        <Faq items={ABOUT_FAQ} onSand />
      </Section>

      <CtaBand />
    </>
  );
}
