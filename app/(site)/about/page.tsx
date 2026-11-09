import type { Metadata } from "next";
import Link from "next/link";
import { Compass, ListChecks, ShieldCheck, UserCheck } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { Crumbs } from "@/components/site/PageHeader";
import { Faq } from "@/components/site/Faq";
import { CtaBand } from "@/components/site/CtaBand";
import { OfficeClocks } from "@/components/site/inner/OfficeClocks";
import { BtnLabel, Glows, LinkArrow, SectionHead, Sub } from "@/components/site/inner/ui";
import { Card, PauseMotion, StageProvider, StageWindow, calm } from "@/components/site/stage";
import { BROKERS } from "@/lib/data/brokers";
import { ABOUT_FAQ } from "@/lib/data/faqs";
import { LOCALES } from "@/lib/i18n";
import { buildPageMetadata, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { ICON_STROKE } from "@/components/site/iconStroke";

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
    <div className="ip-page">
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
      <StageProvider plates={["P-bathy", "V-ocean"]} />

      {/* "Local depth" (DESIGN-V2 §7.2, §10): the statement and the facts over the
          bathymetry of the channel, the sonar pinging from the Istanbul desk. */}
      <StageWindow
        plate="P-bathy"
        id="hero"
        aria-labelledby="page-title"
        data-header-overlay=""
        className="ip-hero ip-hero--tall"
      >
        <Glows />
        <div className="ip-wrap">
          <Crumbs crumbs={[{ name: "About", path: PATH }]} className="ip-hero__crumbs" />
          <div className="ip-about__grid">
            <div {...calm(0.4)} className="ip-about__copy">
              <Sub className="ip-rise">About LEVANTER</Sub>
              <h1 id="page-title" className="t-display ip-display--long ip-rise ip-rise--2">
                A tanker and LPG broker, <span className="ip-quiet">built on the Bosphorus.</span>
              </h1>
              <p className="t-lead ip-rise ip-rise--3 !mt-7">
                We started LEVANTER in Istanbul in 2024 because the Black Sea, the Mediterranean and
                the Turkish Straits deserve a desk that lives with them every day. Today two desks
                fix tankers and gas carriers worldwide from Istanbul, London and Singapore.
              </p>
              <div className="ip-actions ip-actions--stack ip-rise ip-rise--4 !mt-8">
                <Link href="/brokers" className="lv-btn lv-btn--cta">
                  <BtnLabel>Meet the team</BtnLabel>
                </Link>
                <Link href="/contact" className="lv-btn lv-btn--ghost">
                  Send an inquiry
                </Link>
              </div>
            </div>
            <section {...calm(0.4)} aria-label="Company facts" className="ip-about__facts">
              <dl className="ip-facts ip-facts--2">
                {FACTS.map((f, i) => (
                  <div key={f.k}>
                    <dt>
                      <span className="t-label">{f.k}</span>
                      <span className="t-data" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </dt>
                    <dd>{f.v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
          <div className="ip-about__foot">
            {/* The sonar ping starts here (data-stage-pin); the pin itself is DOM. */}
            <p className="ip-pin t-data" data-stage-pin="">
              <span className="ip-pin__dot" aria-hidden="true" />
              41°02.6′N 029°00.5′E · Istanbul desk
            </p>
            <PauseMotion />
          </div>
        </div>
      </StageWindow>

      <Card ground="paper" id="story" aria-labelledby="story-title" className="ip-card">
        <div className="ip-wrap">
          <div className="ip-story">
            <div>
              <Sub>Our story</Sub>
              <h2 id="story-title" className="ip-h2">
                Why a broker on the Straits.
              </h2>
            </div>
            <div className="ip-prose">
              <p>
                Most of the world&apos;s large shipbrokers sit in London, Singapore, Houston or
                Oslo. Yet some of the busiest and most complicated liquid trades run past our office
                window: Black Sea crude and products through the Bosphorus, LPG into one of the
                world&apos;s largest autogas markets, and small gas carriers distributing across the
                Mediterranean.
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
          </div>
        </div>
      </Card>

      <Card
        ground="night"
        id="principles"
        aria-labelledby="principles-title"
        className="ip-card ip-card--night"
      >
        <Glows />
        <div className="ip-wrap">
          <SectionHead
            size="sm"
            sub="How we work"
            id="principles-title"
            title="Four principles on every fixture."
            action={
              <Link href="/compliance" className="lv-link">
                <span>How we screen every fixture</span>
                <LinkArrow />
              </Link>
            }
          />
          <ul className="ip-services ip-services--4 ip-reveal">
            {PRINCIPLES.map(({ Icon, title, text }, i) => (
              <li key={title} className="ip-glass ip-service">
                <div className="ip-service__top">
                  <span className="ip-icon">
                    <Icon aria-hidden="true" strokeWidth={ICON_STROKE.ring} />
                  </span>
                  <span className="t-data" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="t-card">{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card ground="paper" id="offices" aria-labelledby="offices-title" className="ip-card">
        <div className="ip-wrap">
          <SectionHead
            size="sm"
            sub="Offices"
            id="offices-title"
            title="Three time zones, one team."
            lead={`Overview pages are available in ${LOCALES.length} languages for clients in the main shipping markets. Between us we speak ${LANGUAGES.join(", ")}.`}
          />
          <ul className="ip-offices">
            {siteConfig.offices.map((o) => (
              <li key={o.city}>
                <p className="t-label acc">{o.country}</p>
                <h3 className="t-h3">{o.city}</h3>
                <p className="text-slate">{o.role}</p>
                <p className="t-data !mt-auto pt-6">
                  {BROKERS.filter((b) => b.office === o.city).length} brokers
                </p>
                <OfficeClocks offices={[o]} />
              </li>
            ))}
          </ul>

          <section id="faq" aria-labelledby="faq-title" className="ip-block">
            <div className="ip-faq-block">
              <div className="ip-faq-block__head">
                <div>
                  <Sub>FAQ</Sub>
                  <h2 id="faq-title" className="ip-h2">
                    About LEVANTER.
                  </h2>
                </div>
                <Link href="/contact" className="lv-link">
                  <span>Ask us</span>
                  <LinkArrow />
                </Link>
              </div>
              <Faq items={ABOUT_FAQ} />
            </div>
          </section>
        </div>
      </Card>

      <CtaBand />
    </div>
  );
}
