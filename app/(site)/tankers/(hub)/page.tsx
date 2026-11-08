import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, Compass, FileCheck2, Mail, Repeat } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { StageHero } from "@/components/site/PageHeader";
import { BrokerCard } from "@/components/site/BrokerCard";
import { Faq } from "@/components/site/Faq";
import { CtaBand } from "@/components/site/CtaBand";
import { TankerArt } from "@/components/site/VesselArt";
import { NotesStrip } from "@/components/site/blog/NotesStrip";
import { ClassRows } from "@/components/site/inner/ClassRows";
import { BtnLabel, Glows, LinkArrow, SectionHead, Sub } from "@/components/site/inner/ui";
import { Card, StageProvider } from "@/components/site/stage";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { BROKERS, TEAM_LABEL } from "@/lib/data/brokers";
import { latestPostCards } from "@/lib/blog/posts";
import { BLOG_PATH } from "@/lib/blog/meta";
import { buildPageMetadata, serviceLd, webPageLd } from "@/lib/seo";
import { inquiryHref } from "@/lib/inquiry";
import { siteConfig } from "@/lib/site";
import { TANKERS_FAQ } from "@/lib/data/faqs";

const TITLE = "Tanker Broker — Crude & Product Tanker Chartering";
const DESCRIPTION =
  "Crude and product tanker chartering from Istanbul: VLCC, Suezmax, Aframax/LR2, LR1 and MR on Black Sea, CPC, Med and long-haul lanes. Spot, TC and COA.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/tankers",
  keywords: [
    "tanker broker",
    "tanker chartering",
    "crude tanker chartering",
    "product tanker broker",
    "Suezmax broker",
    "Aframax chartering Mediterranean",
    "Black Sea tanker broker",
    "MR tanker charter",
    "tanker broker Istanbul",
  ],
});

const FAMILIES = [
  {
    key: "crude" as const,
    title: "Crude",
    text: "Dirty tankers for crude oil and fuel oil. Our core: Black Sea and CPC Suezmaxes, cross-Med Aframaxes and VLCCs on the long-haul lanes East.",
  },
  {
    key: "clean" as const,
    title: "Clean products",
    text: "Coated tankers for gasoil, jet, gasoline and naphtha. LR1 and MR across the Med, the Atlantic basin and East of Suez.",
  },
];

const SERVICES = [
  {
    Icon: Compass,
    title: "Spot voyages",
    text: "Worldscale or lump sum, with laytime, demurrage and routing assumptions spelled out.",
  },
  {
    Icon: CalendarClock,
    title: "Time charters",
    text: "Short and long period business for oil majors, traders and refiners.",
  },
  {
    Icon: Repeat,
    title: "COAs",
    text: "Programme cargoes — CPC, WAF or Med refinery supply — on a planned fleet.",
  },
  {
    Icon: FileCheck2,
    title: "Post-fixture & compliance",
    text: "Laytime and demurrage, claims, and sanctions / price-cap documentation on every fixture.",
  },
];

/** Silhouette width per class (VLCC → MR): a quiet visual size ladder. */
const ART_WIDTH: Record<string, string> = {
  vlcc: "100%",
  suezmax: "88%",
  aframax: "78%",
  lr1: "70%",
  mr: "62%",
};

const TEAMS = ["crude", "clean"] as const;

export default function TankersPage() {
  const notes = latestPostCards(3, "tankers");
  let n = 1;

  return (
    <div className="ip-page">
      <JsonLd
        data={[
          webPageLd({ title: TITLE, description: DESCRIPTION, path: "/tankers" }),
          serviceLd({
            name: "Tanker chartering",
            description: DESCRIPTION,
            serviceType: "Tanker shipbroking",
            path: "/tankers",
            offers: TANKER_CLASSES.map((t) => ({
              name: `${t.name} chartering`,
              path: `/tankers/${t.slug}`,
            })),
          }),
        ]}
      />
      <StageProvider plates={["V-hero", "V-ocean"]} />

      <StageHero
        plate="V-hero"
        crumbs={[{ name: "Tankers", path: "/tankers" }]}
        sub="Tanker desk"
        long
        title={
          <>
            Crude and product tanker chartering,{" "}
            <span className="ip-quiet">with the Straits on our doorstep.</span>
          </>
        }
        lead="VLCC to MR — spot, period and COA. Black Sea, CPC and Mediterranean business run from Istanbul, with London and Singapore covering the Atlantic and East of Suez."
        actions={
          <>
            <Link href={inquiryHref()} className="lv-btn lv-btn--cta">
              <BtnLabel>Send a tanker inquiry</BtnLabel>
            </Link>
            {/* labelled like the class pages; the address is printed in the letter and footer */}
            <a href={`mailto:${siteConfig.desks.tankers.email}`} className="lv-btn lv-btn--ghost">
              <Mail aria-hidden="true" />
              <span>
                Email the tanker desk
                <span className="sr-only"> ({siteConfig.desks.tankers.email})</span>
              </span>
            </a>
          </>
        }
        meta={{ label: "Tanker desk · Istanbul", coords: "41°02.6′N 029°00.5′E" }}
      />

      {/* Fleet, grouped by market: Seacon rows */}
      <Card ground="paper" id="fleet" aria-labelledby="fleet-title" className="ip-card">
        <div className="ip-wrap">
          <SectionHead
            sub="Fleet we cover"
            id="fleet-title"
            title="Five tanker sizes, two markets."
            lead="Pick a size for a quick guide to dimensions, key routes and how the business is fixed."
          />
          {FAMILIES.map((f) => {
            const classes = TANKER_CLASSES.filter((t) => t.family === f.key);
            const start = n;
            n += classes.length;
            return (
              // Group label is not a heading: the class names are the h3s under the h2.
              <div key={f.key} role="group" aria-labelledby={`family-${f.key}`}>
                <div className="ip-rows__group">
                  <p id={`family-${f.key}`} className="t-label acc">
                    {f.title} · {classes.length} {classes.length === 1 ? "size" : "sizes"}
                  </p>
                  <p>{f.text}</p>
                </div>
                <ClassRows
                  start={start}
                  rows={classes.map((t) => ({
                    href: `/tankers/${t.slug}`,
                    name: t.name,
                    sub: t.longName,
                    size: t.dwtRange,
                    chips: t.routes.map((r) => r.code),
                    chipsLabel: "Key routes",
                    go: `${t.shortName} guide`,
                    art: <TankerArt />,
                    artWidth: ART_WIDTH[t.slug],
                  }))}
                />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Services + the desk: night glass */}
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
            title="Full-cycle tanker broking."
            lead="Spot, period and programme business, followed through laytime, claims and the compliance file — by the broker who fixed the ship."
          />
          <ul className="ip-services ip-reveal">
            {SERVICES.map(({ Icon, title, text }, i) => (
              <li key={title} className="ip-glass ip-service">
                <div className="ip-service__top">
                  <span className="ip-icon">
                    <Icon aria-hidden="true" />
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

          <hr className="ip-rule" />

          <SectionHead
            sub="The tanker desk"
            id="team-title"
            title="Brokers by market."
            action={
              <Link href="/brokers" className="lv-link">
                <span>Full team</span>
                <LinkArrow />
              </Link>
            }
          />
          <div className="grid gap-14">
            {TEAMS.map((team) => (
              // Group label is not a heading: BrokerCard names are already h3 under this h2.
              <div key={team} role="group" aria-labelledby={`team-${team}`}>
                <Sub as="p" className="!mb-6">
                  <span id={`team-${team}`}>{TEAM_LABEL[team]}</span>
                </Sub>
                <ul className="ip-team">
                  {BROKERS.filter((b) => b.team === team).map((b) => (
                    <li key={b.name}>
                      <BrokerCard broker={b} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Desk notes + FAQ */}
      <Card ground="paper" id="notes-faq" className="ip-card">
        <div className="ip-wrap">
          {notes.length > 0 && (
            <NotesStrip
              posts={notes}
              id="notes"
              sub="Tanker research"
              title="Notes from the tanker desk."
              allHref={BLOG_PATH}
              allLabel="All posts"
            />
          )}
          <section
            id="faq"
            aria-labelledby="faq-title"
            className={notes.length > 0 ? "ip-block" : undefined}
          >
            <div className="ip-faq-block">
              <div className="ip-faq-block__head">
                <div>
                  <Sub>FAQ</Sub>
                  <h2 id="faq-title" className="t-display">
                    Tanker chartering questions.
                  </h2>
                </div>
                <Link href={inquiryHref()} className="lv-link">
                  <span>Ask the desk</span>
                  <LinkArrow />
                </Link>
              </div>
              <Faq items={TANKERS_FAQ} />
            </div>
          </section>
        </div>
      </Card>

      <CtaBand
        title="Have a tanker cargo or an open ship?"
        text="Send the cargo, ports and laycan — or your position. The tanker desk replies within 60 minutes during business hours."
        email={siteConfig.desks.tankers.email}
        inquiryHref={inquiryHref()}
      />
    </div>
  );
}
