import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Phone,
  Mail,
  Linkedin,
  MessageCircle,
  Anchor,
  Globe2,
  FileText,
  Compass,
  Award,
  Building2,
  ShipWheel,
} from "lucide-react";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { JsonLd } from "./components/JsonLd";
import { Button } from "@/components/ui/button";
import { HomeHero } from "./_home/HomeHero";
import { Ticker } from "./_home/Ticker";
import { BosphorusSection } from "./_home/BosphorusSection";
import { BROKERS } from "@/lib/data/brokers";
import { REPORTS } from "@/lib/data/research";
import { buildPageMetadata, professionalServiceLd, webPageLd } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "LEVANTER — Premium Maritime Brokerage from the Bosphorus",
  description:
    "Crude, clean, chemicals, and dry bulk chartering at the strait that 3% of the world's oil flow passes through. Direct broker access, live TCE, and Bosphorus desk depth.",
  path: "/",
  keywords: [
    "premium tanker brokerage",
    "Bosphorus shipbroker",
    "VLCC charter",
    "Suezmax",
    "Aframax",
    "Black Sea tanker",
    "Worldscale TCE",
    "voyage estimator",
    "EU ETS shipping",
  ],
  absoluteTitle: true,
});

const COUNTERS = [
  { lbl: "Years combined experience", val: "80+" },
  { lbl: "Global offices", val: "4" },
  { lbl: "Broker coverage", val: "24/7" },
  { lbl: "First reply SLA", val: "60", unit: "min" },
];

const TANKER_TILES = [
  {
    lbl: "Crude",
    name: "VLCC · Suezmax · Aframax",
    desc: "Long-haul crude trades, AG–East, WAF–UKC, CPC, Black Sea.",
  },
  {
    lbl: "Clean",
    name: "LR2 · LR1 · MR · Handy",
    desc: "Refined products from Med, AG, USG and the Far East.",
  },
  {
    lbl: "Chemicals & Specialised",
    name: "IMO 2/3, coated, stainless",
    desc: "Purpose-built parcels. Strict specs, deeper benches.",
  },
  {
    lbl: "Projects & TC",
    name: "Long-haul, time charters",
    desc: "Multi-year programmes, COAs, dedicated tonnage.",
  },
];

const BULK_CLASSES = ["Capesize", "Panamax / Kamsarmax", "Supramax / Ultramax", "Handysize"];

const TRUST_BADGES = [
  { Icon: Globe2, org: "Baltic Exchange", status: "Application in progress" },
  { Icon: ShipWheel, org: "ICS", status: "Member (FICS)" },
  { Icon: Building2, org: "BIMCO", status: "Application in progress" },
  { Icon: Anchor, org: "INTERTANKO", status: "Associate Member" },
  { Icon: Compass, org: "Worldscale", status: "Subscriber" },
  { Icon: Award, org: "FONASBA", status: "Application in progress" },
];

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
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: "LEVANTER — Premium Maritime Brokerage",
            description:
              "Crude, clean, chemicals, and dry bulk chartering at the strait that 3% of the world's oil flow passes through.",
            path: "/",
          }),
          professionalServiceLd({
            name: "LEVANTER Tanker & Bulk Chartering",
            description:
              "Spot voyages, COAs, time charters, S&P, and research across crude, clean, chemicals, and dry bulk.",
            serviceType: "Ship brokerage",
            path: "/",
          }),
        ]}
      />
      <Nav active="home" />
      <main>
        <HomeHero />
        <Ticker />

        {/* Counters */}
        <section className="counters">
          <div className="counters-grid container">
            {COUNTERS.map((c) => (
              <div className="counter" key={c.lbl}>
                <div className="lbl">{c.lbl}</div>
                <div className="val">
                  {c.val}
                  {c.unit && <span style={{ fontSize: "0.6em" }}> {c.unit}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section className="sec" id="services">
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Services</span>
              <h2 className="display h2">
                Built around tanker depth.
                <br />
                Backed by a full dry bulk desk.
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
                  <span className="svc-title">Tankers</span>
                </div>
                <p className="svc-line">
                  Crude, clean, chemicals — and the routes that connect them.
                </p>
                <div className="tanker-tiles">
                  {TANKER_TILES.map((t) => (
                    <Link key={t.lbl} href="/tankers" className="tanker-tile">
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
                      <span className="explore">Explore →</span>
                    </Link>
                  ))}
                </div>
              </article>

              <article className="svc-bulk">
                <span className="svc-title">Dry Bulk</span>
                <h3 className="svc-line">Iron ore to grains, port-to-port.</h3>
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
                    <span className="arr">→</span>
                  </Link>
                ))}
              </article>

              <div className="svc-stack">
                <Link href="/sale-purchase" className="svc-card">
                  <span className="svc-title">Sale &amp; Purchase</span>
                  <h3 className="svc-line">Newbuilding · Second-hand · Demolition</h3>
                  <p>Tanker and bulker S&amp;P, valuations, and disposal advisory.</p>
                </Link>
                <Link href="/research" className="svc-card">
                  <span className="svc-title">Research</span>
                  <h3 className="svc-line">Weekly · Quarterly · Custom</h3>
                  <p>Desk-grade analysis. Numbers and views, not narratives.</p>
                </Link>
                <Link href="/voyage-estimator" className="svc-card">
                  <span className="svc-title">Working tools</span>
                  <h3 className="svc-line">TCE · Distance · ETS</h3>
                  <p>Run the numbers before you fix. Live calculator with sensitivity tables.</p>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <BosphorusSection />

        {/* Brokers preview */}
        <section className="sec" id="brokers-preview">
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Our People</span>
              <h2 className="display h2">Direct access. Real brokers.</h2>
              <p>No forms, no gatekeepers. Speak to the desk that handles your cargo.</p>
            </div>
            <div className="brokers-row">
              {HOMEPAGE_BROKERS.map((b) => (
                <article className="broker-card" key={b.name}>
                  <div className="broker-avatar" style={{ background: b.color }}>
                    {b.initials}
                  </div>
                  <h3 className="broker-name">{b.name}</h3>
                  <p className="broker-title">{b.title}</p>
                  <div className="broker-tags">
                    {b.tags.map((t) => (
                      <span key={t} className="broker-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="broker-icons">
                    <a href="#" aria-label={`Phone ${b.name}`}>
                      <Phone className="h-4 w-4" />
                    </a>
                    <a href="#" aria-label={`WhatsApp ${b.name}`}>
                      <MessageCircle className="h-4 w-4" />
                    </a>
                    <a href="#" aria-label={`Email ${b.name}`}>
                      <Mail className="h-4 w-4" />
                    </a>
                    <a href="#" aria-label={`LinkedIn ${b.name}`}>
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </div>
                  <Link href="/brokers" className="broker-profile">
                    View profile <ArrowRight className="h-3 w-3" />
                  </Link>
                </article>
              ))}
            </div>
            <div className="brokers-cta">
              <Button asChild variant="outline">
                <Link href="/brokers">
                  View all brokers <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Research preview */}
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Research</span>
              <h2 className="display h2">Sharp views. On the desk by Monday.</h2>
            </div>
            <div className="research-grid">
              {HOMEPAGE_REPORTS.map((r) => (
                <Link key={r.title} className="report-card" href="/research">
                  <div className="report-cover">
                    <ReportCover color={r.coverColor} accent={r.coverAccent} />
                    <span className="lbl">{r.label}</span>
                    <h4 className="heading">{r.title.split(":")[0]}</h4>
                  </div>
                  <div className="report-body">
                    <div className="meta">
                      <span className="cat">{r.catLabel}</span> · {r.date}
                    </div>
                    <h3>{r.title}</h3>
                    <p>{r.desc}</p>
                    <span className="read flex items-center gap-1">
                      Read · {r.read} min <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="brokers-cta">
              <Button asChild variant="outline">
                <Link href="/research">
                  All research <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Trust badges */}
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="trust-head">
              <span className="eyebrow slate">Memberships &amp; Accreditations</span>
            </div>
            <div className="badges">
              {TRUST_BADGES.map(({ Icon, org, status }) => (
                <div className="badge" key={org}>
                  <Icon className="mark" />
                  <div className="org">{org}</div>
                  <div className="status">{status}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="final-cta">
          <span className="eyebrow">Ready to move?</span>
          <h2 className="display h2">Ready to charter?</h2>
          <p>
            Send us your CP terms or just describe what you&apos;re moving. A broker replies within
            60 minutes during business hours.
          </p>
          <div className="cta-row">
            <Button asChild>
              <Link href="/contact">
                Charter inquiry <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="bone" className="btn-bone">
              <Link href="/voyage-estimator">
                Open voyage estimator <FileText className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
