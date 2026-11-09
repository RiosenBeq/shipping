import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, Compass, FileCheck2, Mail, Repeat } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { StageHero } from "@/components/site/PageHeader";
import { BrokerCard } from "@/components/site/BrokerCard";
import { Faq } from "@/components/site/Faq";
import { CtaBand } from "@/components/site/CtaBand";
import { GasCarrierArt, PressurisedGasArt } from "@/components/site/VesselArt";
import { NotesStrip } from "@/components/site/blog/NotesStrip";
import { ClassRows } from "@/components/site/inner/ClassRows";
import { BtnLabel, Glows, LinkArrow, SectionHead, Sub } from "@/components/site/inner/ui";
import { Card, StageProvider } from "@/components/site/stage";
import { LPG_CLASSES } from "@/lib/data/lpg-classes";
import { brokersByTeam } from "@/lib/data/brokers";
import { latestPostCards } from "@/lib/blog/posts";
import { BLOG_PATH } from "@/lib/blog/meta";
import { buildPageMetadata, serviceLd, webPageLd } from "@/lib/seo";
import { inquiryHref } from "@/lib/inquiry";
import { siteConfig } from "@/lib/site";
import { LpgConverter } from "./LpgConverter";
import { LPG_FAQ } from "@/lib/data/faqs";
import { ICON_STROKE } from "@/components/site/iconStroke";

const TITLE = "LPG Shipbroker — VLGC, MGC & Ammonia Chartering";
const DESCRIPTION =
  "LPG and ammonia chartering from Istanbul: VLGC, MGC, Handysize and pressurised gas carriers for propane, butane, ammonia and petchem gases. Spot, TC, COA.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/lpg",
  keywords: [
    "LPG shipbroker",
    "LPG broker",
    "LPG carrier chartering",
    "VLGC chartering",
    "MGC charter",
    "ammonia carrier chartering",
    "semi-refrigerated LPG carrier",
    "pressurised LPG carrier",
    "LPG broker Istanbul",
    "Mediterranean LPG shipping",
  ],
});

const SERVICES = [
  {
    Icon: Compass,
    title: "Spot voyages",
    text: "Single cargoes and relets, priced in $/mt with the routing and port-time assumptions shown.",
  },
  {
    Icon: CalendarClock,
    title: "Time charters",
    text: "Period business from 6 months to multi-year, for importers, traders and end-users.",
  },
  {
    Icon: Repeat,
    title: "Contracts of affreightment",
    text: "Regular programmes — LPG distribution or ammonia supply — with a fleet that fits your terminals.",
  },
  {
    Icon: FileCheck2,
    title: "Post-fixture",
    text: "Voyage follow-up, laytime and demurrage calculations, and claims through to settlement.",
  },
];

const CARGOES = ["Propane", "Butane", "Ammonia", "Propylene", "Butadiene", "VCM"];

const FOCUS = [
  {
    title: "Med, Black Sea & Türkiye",
    text: "Small pressurised and semi-refrigerated LPG into Turkish, East Med and Black Sea terminals — with Straits timing priced in.",
  },
  {
    title: "VLGC export lanes",
    text: "US Gulf and Middle East Gulf exports to Asia and Europe, benchmarked against BLPG1–3 and priced Panama vs. Cape.",
  },
  {
    title: "Ammonia & petchem gases",
    text: "MGC ammonia lanes and Handysize petrochemical parcels, including grade-switch planning.",
  },
];

/** Silhouette width per class (VLGC → pressurised): a quiet visual size ladder. */
const ART_WIDTH = ["100%", "84%", "70%", "56%"];

export default function LpgPage() {
  const team = brokersByTeam("lpg");
  const notes = latestPostCards(3, "lpg");

  return (
    <div className="ip-page">
      <JsonLd
        data={[
          webPageLd({ title: TITLE, description: DESCRIPTION, path: "/lpg" }),
          serviceLd({
            name: "LPG and ammonia chartering",
            description: DESCRIPTION,
            serviceType: "LPG shipbroking",
            path: "/lpg",
            offers: LPG_CLASSES.map((c) => ({
              name: `${c.name} chartering`,
              path: `/lpg/${c.slug}`,
            })),
          }),
        ]}
      />
      <StageProvider plates={["V-gas", "V-ocean"]} />

      <StageHero
        plate="V-gas"
        crumbs={[{ name: "LPG & Ammonia", path: "/lpg" }]}
        sub="LPG & ammonia desk"
        long
        bright
        title="LPG and ammonia chartering, from VLGCs to pressurised coasters."
        lead="Propane, butane, ammonia and petrochemical gases — spot, period and COA. One desk that follows every size of gas carrier, run from Istanbul with brokers in London and Singapore."
        actions={
          <>
            <Link href={inquiryHref({ segment: "lpg" })} className="lv-btn lv-btn--cta">
              <BtnLabel>Send an LPG inquiry</BtnLabel>
            </Link>
            {/* labelled like the class pages; the address is printed in the letter and footer */}
            <a href={`mailto:${siteConfig.desks.lpg.email}`} className="lv-btn lv-btn--ghost">
              <Mail aria-hidden="true" strokeWidth={ICON_STROKE.inline} />
              <span>
                Email the LPG desk
                <span className="sr-only"> ({siteConfig.desks.lpg.email})</span>
              </span>
            </a>
          </>
        }
        meta={{ label: "LPG & ammonia desk · Istanbul", coords: "41°02.6′N 029°00.5′E" }}
      />

      {/* Fleet: Seacon rows */}
      <Card ground="paper" id="fleet" aria-labelledby="fleet-title" className="ip-card">
        <div className="ip-wrap">
          <SectionHead
            sub="Fleet we cover"
            id="fleet-title"
            title="Every size of gas carrier."
            lead="Each segment trades differently. Pick the ship size for a quick guide to capacities, cargoes and routes — or just send us the cargo and we will advise."
          />
          <ClassRows
            className="!border-t !border-t-[var(--ink)]"
            rows={LPG_CLASSES.map((c, i) => {
              // Pressurised coasters carry cylindrical deck tanks, not a refrigerated trunk deck.
              const Art = c.slug === "pressurised" ? PressurisedGasArt : GasCarrierArt;
              return {
                href: `/lpg/${c.slug}`,
                name: c.name,
                sub: c.longName,
                size: c.capacity.split(" — ")[0],
                chips: c.cargoes.slice(0, 3),
                chipsLabel: "Main cargoes",
                go: `${c.name} guide`,
                art: <Art />,
                artWidth: ART_WIDTH[i],
              };
            })}
          />
        </div>
      </Card>

      {/* Services, cargoes and focus: night glass */}
      <Card
        ground="night"
        id="services"
        aria-labelledby="services-title"
        className="ip-card ip-card--night"
      >
        <Glows />
        <div className="ip-wrap">
          <SectionHead
            sub="What we fix"
            id="services-title"
            title="From first idea to final demurrage."
          />
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            <ul className="ip-services ip-reveal">
              {SERVICES.map(({ Icon, title, text }, i) => (
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
            <div className="ip-glass p-7 sm:p-8">
              <h3 className="t-label acc">Cargoes</h3>
              <ul className="ip-chips mt-4">
                {CARGOES.map((c) => (
                  <li key={c}>
                    <span className="ip-chip ip-chip--dot">{c}</span>
                  </li>
                ))}
              </ul>
              <h3 className="t-label acc !mt-9">Where we focus</h3>
              <ul className="mt-2">
                {FOCUS.map((f) => (
                  <li
                    key={f.title}
                    className="border-t border-[var(--hair)] py-4 first:border-t-0 last:pb-0"
                  >
                    <p className="font-semibold">{f.title}</p>
                    <p className="mt-1 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
                      {f.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <hr className="ip-rule" />

          <SectionHead
            sub="The LPG desk"
            id="team-title"
            title="Gas brokers by segment."
            action={
              <Link href="/brokers" className="lv-link">
                <span>Full team</span>
                <LinkArrow />
              </Link>
            }
          />
          <ul className="ip-team ip-team--4">
            {team.map((b) => (
              <li key={b.name}>
                <BrokerCard broker={b} />
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Converter (physical densities only — no market data): the paper tool card */}
      <Card ground="paper" id="converter" aria-labelledby="converter-title" className="ip-card">
        <div className="ip-wrap">
          <SectionHead
            sub="Free tool"
            id="converter-title"
            size="sm"
            title="LPG cargo converter: cbm to tonnes."
            lead="Quickly check how many tonnes fit in a ship's tanks — or how much capacity a parcel needs — for propane, butane, ammonia and petrochemical gases."
          />
          <LpgConverter />

          {notes.length > 0 && (
            <NotesStrip
              posts={notes}
              id="notes"
              sub="LPG research"
              title="Notes from the gas desk."
              allHref={BLOG_PATH}
              allLabel="All posts"
              className="ip-block"
            />
          )}

          <section id="faq" aria-labelledby="faq-title" className="ip-block">
            <div className="ip-faq-block">
              <div className="ip-faq-block__head">
                <div>
                  <Sub>FAQ</Sub>
                  <h2 id="faq-title" className="t-display">
                    LPG chartering questions.
                  </h2>
                </div>
                <Link href={inquiryHref({ segment: "lpg" })} className="lv-link">
                  <span>Ask the desk</span>
                  <LinkArrow />
                </Link>
              </div>
              <Faq items={LPG_FAQ} />
            </div>
          </section>
        </div>
      </Card>

      <CtaBand
        title="Have an LPG or ammonia cargo?"
        text="Send the grade, quantity, ports and laycan. The LPG desk replies within 60 minutes during business hours."
        email={siteConfig.desks.lpg.email}
        // LPG or ammonia: no cargo preselected, so an ammonia shipper isn't sent
        // in as "LPG". Both reach the gas desk.
        inquiryHref={inquiryHref()}
      />
    </div>
  );
}
