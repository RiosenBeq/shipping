import type { Metadata } from "next";
import Link from "next/link";
import {
  Anchor,
  ArrowRight,
  Clock,
  Compass,
  Flame,
  ListChecks,
  MapPin,
  MessageCircle,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { Eyebrow, Section } from "@/components/site/Section";
import { DeskCard } from "@/components/site/DeskCard";
import { BrokerCard } from "@/components/site/BrokerCard";
import { ReportCard } from "@/components/site/ReportCard";
import { Faq } from "@/components/site/Faq";
import { CtaBand } from "@/components/site/CtaBand";
import { GasCarrierArt, TankerArt } from "@/components/site/VesselArt";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { LPG_CLASSES } from "@/lib/data/lpg-classes";
import { BROKERS } from "@/lib/data/brokers";
import { REPORTS } from "@/lib/data/research";
import { buildPageMetadata, localBusinessLd, serviceLd, webPageLd } from "@/lib/seo";
import { siteConfig, whatsappUrl } from "@/lib/site";
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
    text: "During business hours, from a broker — not an auto-reply.",
  },
  { Icon: Users, title: "Two specialist desks", text: "Tankers, and LPG & ammonia. Nothing else." },
  {
    Icon: Compass,
    title: "Three offices",
    text: "Istanbul, London and Singapore — the Med, Atlantic and East of Suez.",
  },
  {
    Icon: ShieldCheck,
    title: "Screened fixtures",
    text: "Sanctions and counterparty checks before every fix.",
  },
];

const WHY = [
  {
    Icon: Anchor,
    title: "On the Turkish Straits",
    text: "Our Istanbul desk sits on the Bosphorus. Transit timing, waiting and Straits rules go into every Black Sea estimate we send.",
  },
  {
    Icon: Flame,
    title: "Small LPG specialists",
    text: "Pressurised and semi-refrigerated LPG in the Med, Black Sea and Türkiye — the trades the large houses tend to underserve.",
  },
  {
    Icon: UserCheck,
    title: "Senior brokers on every deal",
    text: "You talk to the broker who works your cargo or ship, from first idea to post-fixture.",
  },
  {
    Icon: ListChecks,
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
    a: "A broker replies within 60 minutes during business hours (Istanbul, London and Singapore). Outside these hours, WhatsApp the desk for live fixtures.",
  },
  {
    q: "Who pays the brokerage commission?",
    a: "Brokerage is normally paid by the shipowner as a percentage of freight or hire, agreed in the charter party. There is no charge to send us an inquiry.",
  },
];

const desks = [
  {
    id: "desk-tankers",
    href: "/tankers",
    eyebrow: "Tanker desk",
    cta: "Explore the tanker desk",
    title: "Crude & product tankers",
    text: "Black Sea and CPC Suezmaxes, cross-Med Aframaxes, VLCCs East and MRs across the Atlantic.",
    Art: TankerArt,
    classes: TANKER_CLASSES.map((t) => ({ name: t.name, href: `/tankers/${t.slug}` })),
  },
  {
    id: "desk-lpg",
    href: "/lpg",
    eyebrow: "LPG & ammonia desk",
    cta: "Explore the LPG & ammonia desk",
    title: "LPG, ammonia & petchem gases",
    text: "VLGCs on the Baltic benchmarks, MGCs for ammonia, and small pressurised LPG into the Med and Türkiye.",
    Art: GasCarrierArt,
    classes: LPG_CLASSES.map((c) => ({ name: c.name, href: `/lpg/${c.slug}` })),
  },
];

const EYEBROW = "text-xs font-semibold uppercase tracking-[0.18em] text-brass-ink";

/** Decimal degrees → nautical "41°02.6′N" style. */
function toDm(v: number, pos: string, neg: string, pad: number) {
  const a = Math.abs(v);
  const d = Math.floor(a);
  const m = ((a - d) * 60).toFixed(1).padStart(4, "0");
  return `${String(d).padStart(pad, "0")}°${m}′${v >= 0 ? pos : neg}`;
}
const POSITION = `${toDm(siteConfig.geo.latitude, "N", "S", 2)} ${toDm(siteConfig.geo.longitude, "E", "W", 3)}`;

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

      {/* Hero — chart graticule behind, brass glow low right */}
      <section className="relative isolate overflow-hidden bg-navy text-white">
        <div className="uv-hero-pattern" aria-hidden="true" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-48 -right-40 h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(184,137,58,0.22),transparent)]"
        />
        <div className="container relative z-[1] grid gap-12 pb-16 pt-12 md:pb-24 md:pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:items-center lg:gap-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,29rem)] xl:pb-28 xl:pt-24">
          <div>
            <Eyebrow dark>Istanbul · Tanker &amp; LPG Shipbrokers</Eyebrow>
            <h1 className="mt-6 font-display text-[40px] font-normal leading-[1.04] tracking-[-0.02em] sm:text-[52px] lg:text-[60px] xl:text-[68px]">
              Tanker and LPG chartering, brokered from the{" "}
              <span className="text-brass-light">Bosphorus.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-fog">
              Crude, clean products, LPG and ammonia — spot, time charter and COA. Talk directly to
              the broker who fixes your trade, with a first reply inside 60 minutes.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/contact" className="uv-btn uv-btn--lg">
                Send an inquiry <ArrowRight aria-hidden="true" />
              </Link>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener"
                className="uv-btn-ghost-light uv-btn--lg"
              >
                <MessageCircle aria-hidden="true" />
                <span>
                  WhatsApp the desk<span className="sr-only"> (opens in a new tab)</span>
                </span>
              </a>
            </div>
            <p className="mt-10 flex flex-wrap items-center gap-2 font-mono text-xs tracking-wide text-fog">
              <MapPin className="h-3.5 w-3.5 text-brass-light" aria-hidden="true" />
              <span>{POSITION}</span>
              <span aria-hidden="true" className="text-white/25">
                /
              </span>
              <span>Beşiktaş, Istanbul</span>
            </p>
          </div>
          <DeskCard />
        </div>
      </section>

      {/* Proof strip */}
      <section aria-label="At a glance" className="border-b border-line bg-white">
        <ul className="container grid gap-x-8 gap-y-7 py-10 sm:grid-cols-2 lg:py-12 xl:grid-cols-4">
          {PROOF.map(({ Icon, title, text }) => (
            <li
              key={title}
              className="flex gap-4 xl:border-s xl:border-line xl:ps-8 xl:first:border-s-0 xl:first:ps-0"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-sand/60 text-brass-ink">
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
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
          {desks.map(({ Art, ...d }) => (
            // Stretched-link card: the title link covers the card, class chips sit
            // above it. The kit's hover (lift, brass sweep, title underline, arrow)
            // is driven by the title link's hover, not the card's, so hovering a
            // size chip highlights only that chip.
            <article
              key={d.href}
              className="group/desk uv-card !gap-0 !p-5 !pb-14 has-[h3_a:hover]:-translate-y-0.5 has-[h3_a:hover]:border-navy/20 has-[h3_a:hover]:shadow-[0_14px_32px_-18px_rgba(10,31,51,0.35)] has-[h3_a:focus-visible]:outline has-[h3_a:focus-visible]:outline-2 has-[h3_a:focus-visible]:outline-offset-[3px] has-[h3_a:focus-visible]:outline-navy has-[h3_a:hover]:before:scale-x-100 sm:!p-8 sm:!pb-14"
            >
              <div
                aria-hidden="true"
                className="relative isolate overflow-hidden rounded-md bg-navy px-6 pb-3 pt-10 text-white/80 sm:px-12"
              >
                <div className="uv-hero-pattern [--uv-grid:56px]" />
                <Art className="relative z-[1] mx-auto w-full max-w-[400px]" />
              </div>
              <p className={`mt-7 ${EYEBROW}`}>{d.eyebrow}</p>
              <h3 className="uv-card__title !mt-3 font-display !text-[26px] !font-normal !leading-tight has-[a:hover]:underline has-[a:hover]:decoration-brass has-[a:hover]:decoration-1 has-[a:hover]:underline-offset-4 sm:!text-[30px]">
                {/* Name = visible title + visible CTA, so "click Explore the
                    tanker desk" works for voice users too. */}
                <Link
                  href={d.href}
                  aria-labelledby={`${d.id}-title ${d.id}-cta`}
                  className="after:absolute after:inset-0 after:z-[1] focus-visible:outline-none"
                >
                  <span id={`${d.id}-title`}>{d.title}</span>
                </Link>
              </h3>
              <p className="mt-3 max-w-lg leading-relaxed">{d.text}</p>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${d.eyebrow} ship sizes`}>
                {d.classes.map((c) => (
                  <li key={c.href}>
                    <Link href={c.href} className="uv-chip z-[2]">
                      {c.name}
                      <ArrowRight className="h-3 w-3 text-brass-ink" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
              <span
                id={`${d.id}-cta`}
                className="uv-card__meta pt-6 !text-[15px] font-semibold !text-navy"
              >
                {d.cta}
              </span>
              <span
                className="uv-card__arrow group-has-[h3_a:hover]/desk:bg-navy group-has-[h3_a:hover]/desk:text-brass-light group-has-[h3_a:hover]/desk:before:translate-x-[3px]"
                aria-hidden="true"
              />
            </article>
          ))}
        </div>
      </Section>

      {/* Why */}
      <Section tone="sand" eyebrow="Why LEVANTER" title="A boutique desk with local depth.">
        <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map(({ Icon, title, text }) => (
            <li
              key={title}
              className="relative border-t border-line pt-6 before:absolute before:-top-px before:start-0 before:h-0.5 before:w-12 before:bg-brass"
            >
              {/* same 40px holder as the proof strip, one size step below the 48px process rings */}
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
      </Section>

      {/* Process — numbered timeline (vertical on mobile, horizontal from lg) */}
      <Section tone="dark" eyebrow="How we work" title="Four steps, one broker throughout.">
        <ol className="grid lg:grid-cols-4 lg:gap-8">
          {STEPS.map((s, i) => (
            <li key={s.n} className="relative flex gap-5 pb-10 last:pb-0 lg:block lg:pb-0">
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-2 start-6 top-14 w-px bg-gradient-to-b from-brass-light/70 to-white/10 lg:-end-6 lg:bottom-auto lg:start-[60px] lg:top-6 lg:h-px lg:w-auto lg:bg-gradient-to-r rtl:lg:bg-gradient-to-l"
                />
              )}
              <span
                aria-hidden="true"
                className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-brass-light/60 bg-navy-soft font-mono text-sm text-brass-light"
              >
                {s.n}
              </span>
              <div className="pt-2.5 lg:pt-0">
                <h3 className="text-lg font-semibold text-white lg:mt-6">{s.title}</h3>
                <p className="mt-1.5 leading-relaxed text-fog">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* Team */}
      <Section
        eyebrow="The team"
        title="Speak to the broker, not a switchboard."
        action={
          <Link href="/brokers" className="uv-btn-outline">
            Meet the team <ArrowRight aria-hidden="true" />
          </Link>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
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
          <Link href="/research" className="uv-btn-outline">
            All research <ArrowRight aria-hidden="true" />
          </Link>
        }
      >
        <div className="grid gap-5 md:grid-cols-3">
          {REPORTS.slice(0, 3).map((r) => (
            <ReportCard key={r.slug} report={r} />
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section eyebrow="FAQ" title="Working with a tanker & LPG broker.">
        <Faq items={FAQ} />
      </Section>

      <CtaBand />
    </>
  );
}
