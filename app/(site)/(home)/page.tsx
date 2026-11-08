import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { Section } from "@/components/site/Section";
import { ReportCard } from "@/components/site/ReportCard";
import { Faq } from "@/components/site/Faq";
import { Journey } from "@/components/site/home/Journey";
import type { HomeCopy } from "@/components/site/home/types";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { LPG_CLASSES } from "@/lib/data/lpg-classes";
import { BROKERS, TEAM_ORDER } from "@/lib/data/brokers";
import { REPORTS } from "@/lib/data/research";
import { buildPageMetadata, localBusinessLd, serviceLd, webPageLd } from "@/lib/seo";
import { siteConfig, whatsappUrl } from "@/lib/site";
import { homeLanguages } from "@/lib/i18n";
import { HOME_FAQ } from "@/lib/data/faqs";

const TITLE = "LEVANTER — Tanker & LPG Shipbrokers in Istanbul";
const DESCRIPTION =
  "Istanbul tanker and LPG shipbrokers: crude, clean products, LPG and ammonia on spot, time charter and COA. Direct broker access, first reply in 60 minutes.";

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

const WHY = [
  {
    title: "On the Turkish Straits",
    text: "Our Istanbul desk sits on the Bosphorus. Transit timing, waiting and Straits rules go into every Black Sea estimate we send.",
    link: { href: "/turkish-straits", label: "Turkish Straits guide" },
  },
  {
    title: "Small LPG specialists",
    text: "Pressurised and semi-refrigerated LPG in the Med, Black Sea and Türkiye — the trades the large houses tend to underserve.",
    link: { href: "/lpg/pressurised", label: "Pressurised LPG guide" },
  },
  {
    title: "Senior brokers on every deal",
    text: "You talk to the broker who works your cargo or ship, from first idea to post-fixture.",
    link: { href: "/about", label: "About LEVANTER" },
  },
  {
    title: "Numbers you can check",
    text: "We show the TCE, routing and port-time assumptions behind every freight idea, so you can check them line by line.",
    link: {
      href: "/research/worldscale-and-tce-explained-how-tanker-freight-is-quoted",
      label: "Worldscale and TCE explained",
    },
  },
];

const STEPS = [
  { title: "Brief", text: "Cargo, ports, laycan — or your open ship and position." },
  { title: "Market", text: "We shortlist ships or cargoes, with compliance checks done." },
  { title: "Fix", text: "We negotiate main terms and the charter party to a clean fixture." },
  { title: "Post-fixture", text: "Voyage follow-up, laytime, demurrage and claims." },
];

/** Head office first, then the desks in the order of the team page. */
const TEAM = [...BROKERS].sort((a, b) => TEAM_ORDER.indexOf(a.team) - TEAM_ORDER.indexOf(b.team));

const head = siteConfig.offices[0];

const COPY: HomeCopy = {
  heroSplit: "chars",
  hero: {
    title: "Brokered from the Bosphorus.",
    accent: "Bosphorus",
    h1Rest: "Tanker and LPG chartering by LEVANTER, shipbrokers in Istanbul.",
    sub: "LEVANTER",
    lead: "Crude, clean products, LPG and ammonia — spot, time charter and COA. Talk directly to the broker who fixes your trade, with a first reply inside 60 minutes.",
    inquiry: "Send an inquiry",
    inquiryHref: "/contact",
    whatsapp: { label: "WhatsApp the desk" },
    newTab: "(opens in a new tab)",
    place: "Beşiktaş, Istanbul",
  },
  what: {
    lines: ["Liquid cargoes.", "Nothing else."],
    sub: "What we do",
    lead: "Tankers and gas carriers are all we broker — crude, clean products, LPG and ammonia, on spot, time charter and COA — so every desk knows its ships, terminals and charterers in depth.",
    more: "Find out more",
    moreHref: "/tankers",
  },
  services: {
    heading: "Our desks",
    columns: [
      {
        id: "desk-tankers",
        title: "Crude & product tankers",
        text: "Black Sea and CPC Suezmaxes, cross-Med Aframaxes, VLCCs East and MRs across the Atlantic.",
        href: "/tankers",
        chipsLabel: "Tanker desk ship sizes",
        chips: TANKER_CLASSES.map((t) => ({ label: t.name, href: `/tankers/${t.slug}` })),
      },
      {
        id: "desk-lpg",
        title: "LPG, ammonia & petchem",
        text: "VLGCs on the Baltic benchmarks, MGCs for ammonia, and small pressurised LPG into the Med and Türkiye.",
        href: "/lpg",
        chipsLabel: "LPG & ammonia desk ship sizes",
        chips: LPG_CLASSES.map((c) => ({ label: c.name, href: `/lpg/${c.slug}` })),
      },
      {
        id: "desk-straits",
        title: "Turkish Straits",
        text: "Transit timing, waiting and the Straits rules, worked into every Black Sea fixture we quote.",
        href: "/turkish-straits",
        chips: [],
      },
    ],
  },
  who: {
    lines: ["A boutique desk", "with local depth."],
    sub: "Who we are",
    lead: "An Istanbul shipbroker that stays narrow on purpose: senior brokers on every deal, the Straits on our doorstep, and the numbers behind every idea on the table.",
    traits: WHY,
  },
  team: {
    lines: ["Speak to the broker,", "not a switchboard."],
    sub: "Our team",
    lead: `${BROKERS.length} brokers in ${siteConfig.offices
      .map((o) => o.city)
      .join(", ")
      .replace(
        /, ([^,]*)$/,
        " and $1"
      )}, each on one desk and one set of trades. Write to them directly, by email or WhatsApp.`,
    cta: "Meet the team",
    stripLabel: "Our brokers",
    brokers: TEAM,
    whatsapp: "WhatsApp {name}",
    emailHint: "email via the desk inbox",
    newTab: "(opens in a new tab)",
  },
  process: {
    lines: ["Four steps,", "one broker throughout."],
    sub: "How we work",
    steps: STEPS,
  },
  offices: {
    lines: ["Three offices,", "one desk."],
    sub: "Where we are",
    lead: "Istanbul on the Bosphorus for the Med and the Black Sea, London for the Atlantic basin, Singapore for East of Suez — one desk, working your fixture around the clock.",
    cards: siteConfig.offices.map((o) =>
      o === head
        ? {
            city: o.city,
            lines: [
              siteConfig.address.street,
              `${siteConfig.address.postalCode} ${o.city}, ${o.country}`,
            ],
            phone: siteConfig.phone,
            email: siteConfig.email,
          }
        : { city: o.city, lines: [o.role, o.country] }
    ),
  },
  letter: {
    line: "Have a cargo or a ship to fix?",
    sign: "LEVANTER",
    text: "Send the cargo, ports and laycan. A broker replies within 60 minutes during business hours.",
    inquiry: "Send an inquiry",
    inquiryHref: "/contact",
    email: siteConfig.email,
    deskLinesTitle: "Direct desk lines",
    deskLines: [
      {
        label: "Tankers",
        href: `mailto:${siteConfig.desks.tankers.email}`,
        value: siteConfig.desks.tankers.email,
      },
      {
        label: "LPG & ammonia",
        href: `mailto:${siteConfig.desks.lpg.email}`,
        value: siteConfig.desks.lpg.email,
      },
      {
        label: "WhatsApp",
        href: whatsappUrl(),
        value: siteConfig.whatsappDisplay,
        external: true,
      },
    ],
    officesLabel: "Offices",
    offices: siteConfig.offices.map((o) => ({
      city: o.city,
      line: o === head ? `${siteConfig.address.street}, ${o.city}` : o.role,
    })),
    social: { linkedin: siteConfig.socials.linkedin, x: siteConfig.socials.twitter },
    legal: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/compliance", label: "Compliance" },
    ],
    newTab: "(opens in a new tab)",
  },
  rail: {
    label: "Scenes on this page",
    labels: {
      hero: "Overview",
      what: "What we do",
      services: "Our desks",
      who: "Who we are",
      team: "Our team",
      process: "How we work",
      offices: "Where we are",
      letter: "Contact",
    },
  },
};

export default function HomePage() {
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

      <Journey
        copy={COPY}
        after={
          <>
            {/* Research and FAQ: opaque sheets after the journey (kept for search). */}
            <Section
              id="research"
              tone="sand"
              className="lv-sheet"
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

            <Section
              id="faq"
              className="lv-sheet bg-background"
              eyebrow="FAQ"
              title="Working with a tanker & LPG broker."
            >
              <Faq items={HOME_FAQ} />
            </Section>
          </>
        }
      />
    </>
  );
}
