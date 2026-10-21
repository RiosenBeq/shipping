import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Phone, Mail, MessageCircle, FileText, Award } from "lucide-react";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { JsonLd } from "./components/JsonLd";
import { TrackedAnchor } from "./components/TrackedAnchor";
import { Button } from "@/components/ui/button";
import { HomeHero } from "./_home/HomeHero";
import { Ticker } from "./_home/Ticker";
import { BosphorusSection } from "./_home/BosphorusSection";
import { BROKERS, brokerSlug } from "@/lib/data/brokers";
import { REPORTS, reportSlug } from "@/lib/data/research";
import { OFFICES, OFFICE_ORDER, DESK_TO_OFFICE, weekdayCoverageHours } from "@/lib/data/offices";
import { siteConfig, telUrl, whatsappUrl, mailUrl, verifiedMemberships } from "@/lib/site";
import { buildPageMetadata, webPageLd } from "@/lib/seo";

const TITLE = "LEVANTER — Tanker & Dry Bulk Shipbrokers, Istanbul";
const DESCRIPTION =
  "Istanbul shipbrokers for crude, clean and chemical tankers, dry bulk and S&P, with desks in London, Singapore and Houston. Send a charter inquiry.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/",
  keywords: [
    "shipbroker Istanbul",
    "tanker chartering",
    "dry bulk chartering",
    "ship sale and purchase",
    "Bosphorus shipbroker",
    "Black Sea tanker broker",
    "VLCC charter",
    "Suezmax",
    "Aframax",
  ],
  absoluteTitle: true,
});

const offices = OFFICE_ORDER.map((slug) => OFFICES[slug]);
const coverageHours = weekdayCoverageHours(offices);

/** Structural facts that follow from the site's own data — no unverifiable statistics. */
const COVERAGE = [
  { lbl: "Desks", val: String(offices.length), note: offices.map((o) => o.city).join(" · ") },
  {
    lbl: "Weekday coverage",
    val: coverageHours >= 24 ? "24" : String(coverageHours),
    unit: "h",
    note: `Across ${new Set(offices.map((o) => o.tz)).size} time zones, from published trading hours`,
  },
  { lbl: "Segments", val: "5", note: "Crude · Clean · Chemicals · Dry bulk · S&P" },
  { lbl: "First reply target", val: "60", unit: "min", note: "During business hours" },
];

const TANKER_TILES = [
  {
    lbl: "Crude",
    name: "VLCC · Suezmax · Aframax",
    desc: "Long-haul crude trades: MEG–East, WAF–UKC, CPC and the Black Sea.",
    href: "/tankers",
    cta: "Crude tankers",
  },
  {
    lbl: "Clean",
    name: "LR2 · LR1 · MR · Handy",
    desc: "Refined products from the Med, MEG, USG and the Far East.",
    href: "/tankers#clean",
    cta: "Clean tankers",
  },
  {
    lbl: "Chemicals & specialised",
    name: "IMO 2/3, coated, stainless",
    desc: "Parcel trades with strict specs and tank-coating requirements.",
    href: "/contact?cargo=chem",
    cta: "Ask the chemicals desk",
  },
  {
    lbl: "Period & COA",
    name: "Time charters, COAs",
    desc: "Multi-voyage programmes and period tonnage.",
    href: "/contact?term=tc",
    cta: "Discuss period cover",
  },
];

const BULK_CLASSES = ["Capesize", "Panamax / Kamsarmax", "Supramax / Ultramax", "Handysize"];

const HOMEPAGE_BROKERS = BROKERS.slice(0, 5);
const HOMEPAGE_REPORTS = REPORTS.slice(0, 3);

function ReportCover({ color, accent }: { color: string; accent: string }) {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="300" fill={color} />
      <g stroke="rgba(241,236,220,0.06)" strokeWidth="0.4">
        <line x1="0" y1="60" x2="400" y2="60" />
        <line x1="0" y1="120" x2="400" y2="120" />
        <line x1="0" y1="180" x2="400" y2="180" />
        <line x1="0" y1="240" x2="400" y2="240" />
      </g>
      <path
        d="M 30 220 L 75 200 L 120 210 L 165 175 L 210 165 L 255 185 L 300 145 L 345 125 L 380 100"
        stroke={accent}
        strokeWidth="1.5"
        fill="none"
        opacity="0.85"
      />
      <circle cx="380" cy="100" r="3" fill={accent} />
    </svg>
  );
}

export default function HomePage() {
  const memberships = verifiedMemberships();

  return (
    <>
      <JsonLd data={[webPageLd({ title: TITLE, description: DESCRIPTION, path: "/" })]} />
      <Nav active="home" />
      <main id="main">
        <HomeHero />
        <Ticker />

        {/* Coverage */}
        <section className="counters" aria-label="Coverage at a glance">
          <div className="counters-grid container">
            {COVERAGE.map((c) => (
              <div className="counter" key={c.lbl}>
                <div className="lbl">{c.lbl}</div>
                <div className="val">
                  {c.val}
                  {c.unit && <span style={{ fontSize: "0.6em" }}> {c.unit}</span>}
                </div>
                <div className="note">{c.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section className="sec" id="services" aria-labelledby="services-h">
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Services</span>
              <h2 id="services-h" className="display h2">
                Tanker chartering at the core.
                <br />
                Dry bulk and S&amp;P alongside.
              </h2>
            </div>
            <div className="services-grid">
              <article className="svc-tankers">
                <div className="svc-head">
                  <svg
                    width="26"
                    height="14"
                    viewBox="0 0 60 18"
                    fill="currentColor"
                    style={{ color: "var(--accent-amber)" }}
                    aria-hidden="true"
                  >
                    <path d="M2 12 L8 8 L52 8 L58 12 L52 14 L8 14 Z" />
                    <rect x="44" y="4" width="8" height="4" />
                  </svg>
                  <h3 className="svc-title">Tankers</h3>
                </div>
                <p className="svc-line">
                  Crude, clean and chemicals — and the routes that connect them.
                </p>
                <div className="tanker-tiles">
                  {TANKER_TILES.map((t) => (
                    <Link key={t.lbl} href={t.href} className="tanker-tile">
                      <svg
                        className="vsl-icon"
                        viewBox="0 0 60 18"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M2 12 L8 8 L52 8 L58 12 L52 14 L8 14 Z" />
                        <rect x="46" y="4" width="6" height="4" />
                      </svg>
                      <span className="lbl">{t.lbl}</span>
                      <span className="name">{t.name}</span>
                      <span className="desc">{t.desc}</span>
                      <span className="explore">
                        {t.cta} <span aria-hidden="true">→</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </article>

              <article className="svc-bulk">
                <h3 className="svc-title">Dry Bulk</h3>
                <p className="svc-line">Iron ore to grains, port-to-port.</p>
                {BULK_CLASSES.map((name) => (
                  <Link href="/dry-bulk" key={name} className="bulk-row">
                    <svg
                      className="vsl-icon"
                      viewBox="0 0 50 16"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M2 11 L8 7 L42 7 L48 11 L42 14 L8 14 Z" />
                      <rect x="36" y="3" width="6" height="4" />
                    </svg>
                    <span className="name">{name}</span>
                    <span className="arr" aria-hidden="true">
                      →
                    </span>
                  </Link>
                ))}
              </article>

              <div className="svc-stack">
                <Link href="/sale-purchase" className="svc-card">
                  <span className="svc-title">Sale &amp; Purchase</span>
                  <span className="svc-line">Newbuilding · Second-hand · Recycling</span>
                  <p>Tanker and bulker S&amp;P with comps-based valuation ranges.</p>
                </Link>
                <Link href="/research" className="svc-card">
                  <span className="svc-title">Research</span>
                  <span className="svc-line">Outlooks · Route guides · Regulation</span>
                  <p>Desk views with the numbers and assumptions spelled out.</p>
                </Link>
                <Link href="/voyage-estimator" className="svc-card">
                  <span className="svc-title">Voyage estimator</span>
                  <span className="svc-line">TCE · Freight · Bunkers · EU ETS</span>
                  <p>Run the numbers before you fix, with a TCE sensitivity grid.</p>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <BosphorusSection />

        {/* Brokers preview */}
        <section className="sec" id="brokers-preview" aria-labelledby="brokers-h">
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Our people</span>
              <h2 id="brokers-h" className="display h2">
                Speak to the broker who handles your cargo.
              </h2>
              <p>Each desk answers its own phone. No relationship-manager layer in between.</p>
            </div>
            <div className="brokers-row">
              {HOMEPAGE_BROKERS.map((b) => {
                const office = OFFICES[DESK_TO_OFFICE[b.desk]];
                return (
                  <article className="broker-card" key={b.name}>
                    <div
                      className="broker-avatar"
                      style={{ background: b.color }}
                      aria-hidden="true"
                    >
                      {b.initials}
                    </div>
                    <h3 className="broker-name">
                      <Link href={`/brokers/${brokerSlug(b)}`}>{b.name}</Link>
                    </h3>
                    <p className="broker-title">
                      {b.title} · {b.desk}
                    </p>
                    <div className="broker-tags">
                      {b.tags.map((t) => (
                        <span key={t} className="broker-tag">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="broker-icons">
                      <TrackedAnchor
                        channel="phone"
                        href={telUrl(office.phone)}
                        aria-label={`Call the ${b.desk} desk for ${b.name}`}
                      >
                        <Phone className="h-4 w-4" aria-hidden="true" />
                      </TrackedAnchor>
                      <TrackedAnchor
                        channel="whatsapp"
                        href={whatsappUrl(`Hi LEVANTER desk — I'd like to speak to ${b.name}.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`WhatsApp the desk for ${b.name}`}
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      </TrackedAnchor>
                      <TrackedAnchor
                        channel="email"
                        href={mailUrl(`Attn: ${b.name}`)}
                        aria-label={`Email the desk for ${b.name}`}
                      >
                        <Mail className="h-4 w-4" aria-hidden="true" />
                      </TrackedAnchor>
                    </div>
                    <Link href={`/brokers/${brokerSlug(b)}`} className="broker-profile">
                      View profile <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      <span className="sr-only">: {b.name}</span>
                    </Link>
                  </article>
                );
              })}
            </div>
            <div className="brokers-cta">
              <Button asChild variant="outline">
                <Link href="/brokers">
                  View all brokers <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Research preview */}
        <section className="sec" style={{ paddingTop: 0 }} aria-labelledby="research-h">
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Research</span>
              <h2 id="research-h" className="display h2">
                Desk views, with the numbers shown.
              </h2>
            </div>
            <div className="research-grid">
              {HOMEPAGE_REPORTS.map((r) => (
                <Link key={r.title} className="report-card" href={`/research/${reportSlug(r)}`}>
                  <div className="report-cover" aria-hidden="true">
                    <ReportCover color={r.coverColor} accent={r.coverAccent} />
                    <span className="lbl">{r.label}</span>
                    <span className="heading">{r.title.split(":")[0]}</span>
                  </div>
                  <div className="report-body">
                    <div className="meta">
                      <span className="cat">{r.catLabel}</span> · {r.date}
                    </div>
                    <h3>{r.title}</h3>
                    <p>{r.desc}</p>
                    <span className="read flex items-center gap-1">
                      Read · {r.read} min <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="brokers-cta">
              <Button asChild variant="outline">
                <Link href="/research">
                  All research <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Memberships — only rendered once verified (see MEMBERSHIPS in lib/site.ts) */}
        {memberships.length > 0 && (
          <section className="sec" style={{ paddingTop: 0 }} aria-labelledby="memberships-h">
            <div className="container">
              <div className="trust-head">
                <h2 id="memberships-h" className="eyebrow slate">
                  Memberships &amp; accreditations
                </h2>
              </div>
              <div className="badges">
                {memberships.map((m) => (
                  <div className="badge" key={m.org}>
                    <Award className="mark" aria-hidden="true" />
                    <div className="org">{m.org}</div>
                    <div className="status">{m.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="final-cta" aria-labelledby="final-cta-h">
          <span className="eyebrow">Ready to move?</span>
          <h2 id="final-cta-h" className="display h2">
            Ready to charter?
          </h2>
          <p>
            Send us your CP terms or just describe what you&apos;re moving. A broker replies within
            60 minutes during business hours.
          </p>
          <div className="cta-row">
            <Button asChild>
              <Link href="/contact">
                Charter inquiry <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="bone" className="btn-bone">
              <Link href="/voyage-estimator">
                Open voyage estimator <FileText className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <p className="final-cta-alt">
            Or call {siteConfig.phone} · <a href={mailUrl()}>{siteConfig.email}</a>
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
