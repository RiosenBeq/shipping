import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Compass, MessageCircle, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/site/JsonLd";
import { Section } from "@/components/site/Section";
import { DeskCard } from "@/components/site/DeskCard";
import { BrokerCard } from "@/components/site/BrokerCard";
import { ReportCard } from "@/components/site/ReportCard";
import { Faq } from "@/components/site/Faq";
import { CtaBand } from "@/components/site/CtaBand";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { LPG_CLASSES } from "@/lib/data/lpg-classes";
import { BROKERS } from "@/lib/data/brokers";
import { REPORTS } from "@/lib/data/research";
import { buildPageMetadata, localBusinessLd, serviceLd, webPageLd } from "@/lib/seo";
import { whatsappUrl } from "@/lib/site";
import { homeLanguages } from "@/lib/i18n";

const TITLE = "LEVANTER — Tanker & LPG Shipbrokers in Istanbul";
const DESCRIPTION =
  "Istanbul-based tanker and LPG chartering brokers. Crude, clean products, LPG and ammonia — spot, time charter and COA, with direct broker access and a 60-minute first reply.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/",
  absoluteTitle: true,
  languages: homeLanguages(),
  keywords: [
    "tanker broker",
    "LPG shipbroker",
    "LPG broker Istanbul",
    "tanker broker Istanbul",
    "VLGC chartering",
    "MGC charter",
    "Aframax chartering Mediterranean",
    "Black Sea tanker broker",
    "ammonia carrier chartering",
  ],
});

const PROOF = [
  {
    Icon: Clock,
    title: "60-minute first reply",
    text: "During business hours, from a broker — not a form.",
  },
  { Icon: Users, title: "Two specialist desks", text: "Tankers, and LPG & ammonia. Nothing else." },
  {
    Icon: Compass,
    title: "Istanbul, London, Singapore",
    text: "Coverage across the Med, Atlantic and East of Suez.",
  },
  {
    Icon: ShieldCheck,
    title: "Screened fixtures",
    text: "Sanctions and counterparty checks before every fix.",
  },
];

const WHY = [
  {
    title: "On the Turkish Straits",
    text: "Our Istanbul desk sits on the Bosphorus. Transit timing, waiting and Straits rules go into every Black Sea estimate we send.",
  },
  {
    title: "Small LPG specialists",
    text: "Pressurised and semi-refrigerated LPG in the Med, Black Sea and Türkiye — the trades the large houses tend to underserve.",
  },
  {
    title: "Senior brokers on every deal",
    text: "You talk to the broker who works your cargo or ship, from first idea to post-fixture.",
  },
  {
    title: "Numbers you can check",
    text: "We show the TCE, routing and port-time assumptions behind every freight idea, so you can check the numbers line by line.",
  },
];

const STEPS = [
  { n: "01", title: "Brief", text: "Cargo, ports, laycan — or your open ship and position." },
  { n: "02", title: "Market", text: "We shortlist ships or cargoes, with compliance checks done." },
  {
    n: "03",
    title: "Fix",
    text: "We negotiate main terms and the charter party to a clean fixture.",
  },
  { n: "04", title: "Post-fixture", text: "Voyage follow-up, laytime, demurrage and claims." },
];

const FAQ = [
  {
    q: "What does a tanker or LPG shipbroker do?",
    a: "A shipbroker matches cargoes with ships. We find suitable tonnage (or cargo), negotiate freight and charter party terms for our client, and follow the voyage through to laytime, demurrage and claims settlement.",
  },
  {
    q: "Which ships do you charter?",
    a: "Crude tankers (VLCC, Suezmax, Aframax), product tankers (LR2, LR1, MR) and LPG/ammonia carriers from VLGCs and MGCs down to Handysize and small pressurised ships.",
  },
  {
    q: "Do you broker ammonia and petrochemical gases?",
    a: "Yes. Our LPG desk covers ammonia on MGCs and Handysize ships, and petrochemical gases such as propylene, butadiene and VCM on semi-refrigerated tonnage.",
  },
  {
    q: "How quickly will I hear back?",
    a: "A broker replies within 60 minutes during business hours (Istanbul, London and Singapore). For live fixtures we run an after-hours line.",
  },
  {
    q: "Who pays the brokerage commission?",
    a: "Brokerage is normally paid by the shipowner as a percentage of freight or hire, agreed in the charter party. There is no charge to send us an inquiry.",
  },
];

const desks = [
  {
    href: "/tankers",
    eyebrow: "Tanker desk",
    cta: "Explore the tanker desk",
    title: "Crude & product tankers",
    text: "Black Sea and CPC Suezmaxes, cross-Med Aframaxes, VLCCs East and MRs across the Atlantic.",
    classes: TANKER_CLASSES.map((t) => ({ name: t.name, href: `/tankers/${t.slug}` })),
  },
  {
    href: "/lpg",
    eyebrow: "LPG & ammonia desk",
    cta: "Explore the LPG & ammonia desk",
    title: "LPG, ammonia & petchem gases",
    text: "VLGCs on the Baltic benchmarks, MGCs for ammonia, and small pressurised LPG into the Med and Türkiye.",
    classes: LPG_CLASSES.map((c) => ({ name: c.name, href: `/lpg/${c.slug}` })),
  },
];

export default function HomePage() {
  const team = [
    ...BROKERS.filter((b) => b.team === "lpg").slice(0, 2),
    ...BROKERS.filter((b) => b.team !== "lpg").slice(0, 2),
  ];

  return (
    <>
      <JsonLd
        data={[
          webPageLd({ title: TITLE, description: DESCRIPTION, path: "/" }),
          localBusinessLd(),
          serviceLd({
            name: "Tanker and LPG chartering brokerage",
            description: DESCRIPTION,
            serviceType: "Shipbroking",
            path: "/",
            offers: [
              { name: "Tanker chartering", path: "/tankers" },
              { name: "LPG and ammonia chartering", path: "/lpg" },
            ],
          }),
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-white">
        <HeroBackdrop />
        <div className="container relative grid gap-12 py-16 md:py-24 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-brass-light">
              Istanbul · Tanker &amp; LPG Shipbrokers
            </p>
            <h1 className="font-display text-[40px] leading-[1.05] tracking-tight sm:text-5xl lg:text-[64px]">
              Tanker and LPG chartering, brokered from the Bosphorus.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-fog">
              Crude, clean products, LPG and ammonia — spot, time charter and COA. Talk directly to
              the broker who fixes your trade, with a first reply inside 60 minutes.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/contact">
                  Send an inquiry <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="light">
                <a href={whatsappUrl()} target="_blank" rel="noopener">
                  <MessageCircle className="h-4 w-4" /> WhatsApp the desk
                </a>
              </Button>
            </div>
          </div>
          <DeskCard />
        </div>
      </section>

      {/* Proof strip */}
      <section className="border-b border-line bg-white">
        <ul className="container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {PROOF.map(({ Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brass" aria-hidden="true" />
              <div>
                <p className="font-semibold text-navy">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Desks */}
      <Section
        eyebrow="Two desks, one focus"
        title="Liquid cargoes. Nothing else."
        intro="We stay narrow on purpose: tankers and gas carriers are all we broker, so every desk knows its ships, terminals and charterers in depth."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {desks.map((d) => (
            <article
              key={d.href}
              className="flex flex-col rounded-lg border border-line bg-white p-7 md:p-9"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass-ink">
                {d.eyebrow}
              </p>
              <h3 className="mt-3 font-display text-[28px] leading-tight text-navy">{d.title}</h3>
              <p className="mt-3 leading-relaxed text-slate">{d.text}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {d.classes.map((c) => (
                  <li key={c.href}>
                    <Link
                      href={c.href}
                      className="inline-flex rounded-full border border-line px-3 py-1.5 text-sm text-navy transition-colors hover:border-navy"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={d.href}
                className="mt-8 inline-flex items-center gap-2 font-semibold text-navy hover:text-brass-ink"
              >
                {d.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </Section>

      {/* Why */}
      <Section tone="sand" eyebrow="Why LEVANTER" title="A boutique desk with local depth.">
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
          {WHY.map((w) => (
            <div key={w.title} className="border-t-2 border-brass pt-5">
              <h3 className="text-lg font-semibold text-navy">{w.title}</h3>
              <p className="mt-2 leading-relaxed text-slate">{w.text}</p>
            </div>
          ))}
        </div>
        <ol className="mt-14 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n} className="bg-white p-6">
              <p className="font-mono text-xs text-brass-ink">{s.n}</p>
              <p className="mt-2 font-semibold text-navy">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate">{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Team */}
      <Section
        eyebrow="The team"
        title="Speak to the broker, not a switchboard."
        action={
          <Button asChild variant="outline">
            <Link href="/brokers">
              Meet the team <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((b) => (
            <BrokerCard key={b.name} broker={b} />
          ))}
        </div>
      </Section>

      {/* Research */}
      <Section
        tone="sand"
        eyebrow="Research"
        title="Practical notes from the desk."
        action={
          <Button asChild variant="outline">
            <Link href="/research">
              All research <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      >
        <div className="grid gap-5 md:grid-cols-3">
          {REPORTS.slice(0, 3).map((r) => (
            <ReportCard key={r.slug} report={r} />
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section eyebrow="FAQ" title="Working with a tanker & LPG broker">
        <Faq items={FAQ} />
      </Section>

      <CtaBand />
    </>
  );
}

/** Quiet chart-grid backdrop with the Bosphorus channel line. */
function HeroBackdrop() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1600 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="heroGlow" cx="0.85" cy="0.9" r="0.6">
          <stop offset="0%" stopColor="#B8893A" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#B8893A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="800" fill="url(#heroGlow)" />
      <g stroke="#F1ECDC" strokeWidth="0.5" opacity="0.06">
        {[100, 200, 300, 400, 500, 600, 700].map((y) => (
          <line key={y} x1="0" y1={y} x2="1600" y2={y} />
        ))}
        {[200, 400, 600, 800, 1000, 1200, 1400].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="800" />
        ))}
      </g>
      <path
        d="M-20 560 Q 300 540 520 548 Q 760 556 860 470 Q 960 380 1180 372 Q 1400 364 1640 300"
        stroke="#B8893A"
        strokeWidth="1.5"
        fill="none"
        opacity="0.35"
      />
    </svg>
  );
}
