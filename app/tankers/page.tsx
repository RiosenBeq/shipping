import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { JsonLd } from "../components/JsonLd";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { ContactCta } from "../components/ContactCta";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { buildPageMetadata, breadcrumbsLd, faqLd, serviceLd, webPageLd } from "@/lib/seo";
import { BROKERS, brokerSlug } from "@/lib/data/brokers";
import { REPORTS, reportSlug } from "@/lib/data/research";
import { OFFICES, OFFICE_ORDER, weekdayCoverageHours } from "@/lib/data/offices";
import { siteConfig, telUrl } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Tanker Chartering — Crude & Clean, VLCC to MR",
  description:
    "Spot, time charter and COA chartering for VLCC, Suezmax, Aframax/LR2, LR1 and MR tankers across MEG, WAF, Black Sea/CPC, USG and Med lanes. Talk to the desk.",
  path: "/tankers",
  keywords: [
    "tanker chartering",
    "VLCC chartering",
    "Suezmax broker",
    "Aframax chartering",
    "clean tanker chartering",
    "MR tanker",
    "TD3C",
    "TD20",
    "TD6 Black Sea Med",
    "CPC",
  ],
});

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Tankers", path: "/tankers" },
];

const VESSEL_CLASSES = [
  {
    slug: "vlcc",
    name: "VLCC",
    desc: "VERY LARGE CRUDE CARRIER · 270–320,000 DWT",
    specs: [
      ["Cargo", "~2 m bbl"],
      ["Length OA", "330 m"],
      ["Draft", "22.5 m"],
      ["Speed (laden)", "13.5 kt"],
    ],
    routes: ["TD3C MEG–CHN", "TD15 WAF–EAST", "TD22 USG–CHN"],
    cta: "VLCC chartering",
    svg: (
      <svg
        className="vsl mb-5 text-accent-brass"
        width="80"
        height="22"
        viewBox="0 0 100 22"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M2 14 Q 6 8 16 8 L 86 8 Q 94 8 98 14 L 92 18 L 8 18 Z" />
        <rect x="78" y="3" width="14" height="5" />
        <rect x="82" y="-1" width="6" height="4" />
      </svg>
    ),
  },
  {
    slug: "suezmax",
    name: "Suezmax",
    desc: "130–160,000 DWT · LIGHT-CRUDE WORKHORSE",
    specs: [
      ["Cargo", "~1 m bbl"],
      ["Length OA", "275 m"],
      ["Draft", "≈17 m"],
      ["Speed (laden)", "14 kt"],
    ],
    routes: ["TD20 WAF–UKC", "TD6 BLK–MED", "TD23 MEG–MED"],
    cta: "Suezmax chartering",
    svg: (
      <svg
        className="vsl mb-5 text-accent-brass"
        width="80"
        height="22"
        viewBox="0 0 100 22"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M4 14 Q 8 9 18 9 L 80 9 Q 88 9 92 14 L 86 18 L 10 18 Z" />
        <rect x="74" y="4" width="12" height="5" />
      </svg>
    ),
  },
  {
    slug: "aframax",
    name: "Aframax / LR2",
    desc: "80–115,000 DWT · SHORT-HAUL · BLACK SEA & MED",
    specs: [
      ["Cargo", "~700 k bbl"],
      ["Length OA", "250 m"],
      ["Draft", "14.5 m"],
      ["Speed (laden)", "14.5 kt"],
    ],
    routes: ["TD7 NSEA–CONT", "TD8 KUW–SPORE", "TD19 X-MED"],
    cta: "Aframax / LR2 chartering",
    svg: (
      <svg
        className="vsl mb-5 text-accent-brass"
        width="80"
        height="22"
        viewBox="0 0 100 22"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M6 14 Q 10 10 20 10 L 76 10 Q 84 10 88 14 L 82 18 L 12 18 Z" />
        <rect x="70" y="5" width="10" height="5" />
      </svg>
    ),
  },
];

const CLEAN_CLASSES = [
  {
    slug: "lr1",
    name: "LR1",
    desc: "55–80,000 DWT · CLEAN PRODUCTS",
    note: "Naphtha, gasoil and jet — MEG to the Far East and MEG to UKC.",
    routes: ["TC5 MEG–JPN", "TC8 MEG–UKC"],
  },
  {
    slug: "mr",
    name: "MR",
    desc: "40–55,000 DWT · CLEAN PRODUCTS",
    note: "The Atlantic and US Gulf workhorse — TC2, TC14, TC17.",
    routes: ["TC2 CONT–USAC", "TC14 USG–CONT", "TC17 MEG–EAFR"],
  },
];

/** Baltic Exchange benchmark route definitions (route, lane, class basis, cargo size). */
const BENCHMARK_ROUTES = [
  { code: "TD3C", lane: "MEG → China", cls: "VLCC", size: "270,000 mt" },
  { code: "TD15", lane: "West Africa → China", cls: "VLCC", size: "260,000 mt" },
  { code: "TD22", lane: "US Gulf → China", cls: "VLCC", size: "270,000 mt" },
  { code: "TD20", lane: "West Africa → Continent", cls: "Suezmax", size: "130,000 mt" },
  { code: "TD6", lane: "Black Sea → Med", cls: "Suezmax", size: "135,000 mt" },
  { code: "TD23", lane: "MEG → Med (via Suez)", cls: "Suezmax", size: "140,000 mt" },
  { code: "TD7", lane: "North Sea → Continent", cls: "Aframax", size: "80,000 mt" },
  { code: "TD19", lane: "Cross-Med", cls: "Aframax", size: "80,000 mt" },
  { code: "TC2", lane: "Continent → US Atlantic coast", cls: "MR", size: "37,000 mt" },
  { code: "TC14", lane: "US Gulf → Continent", cls: "MR", size: "38,000 mt" },
];

const CRUDE_DESK = BROKERS.filter((b) => b.sectors.includes("crude") && !b.sectors.includes("sp"));

const CRUDE_READS = [
  "suezmax-tightness-sustains-as-cpc-volumes-rebound",
  "td3c-demystified-meg-to-china-end-to-end",
  "waf-east-the-slow-re-rating",
]
  .map((slug) => REPORTS.find((r) => reportSlug(r) === slug))
  .filter((r): r is (typeof REPORTS)[number] => Boolean(r));

const routeCount = new Set(
  [...VESSEL_CLASSES.flatMap((v) => v.routes), ...CLEAN_CLASSES.flatMap((c) => c.routes)].map(
    (r) => r.split(" ")[0]
  )
).size;
const coverageHours = weekdayCoverageHours(OFFICE_ORDER.map((s) => OFFICES[s]));

const FAQ = [
  {
    q: "What's the difference between a voyage charter, a time charter and a COA?",
    a: "A voyage (spot) charter moves one cargo from A to B for freight per tonne or a lump sum. A time charter hires the ship for a period at a daily rate, with the charterer paying voyage costs such as bunkers and port dues. A contract of affreightment (COA) commits the owner to lift a series of cargoes on agreed terms over a set period.",
  },
  {
    q: "Which tanker size fits my cargo?",
    a: "As a rule of thumb: VLCC for about 2 million barrels of crude, Suezmax for about 1 million, Aframax / LR2 for around 600–750 thousand barrels, and LR1 or MR for clean product parcels. Port draft and berth limits, cargo grade and the charter-party terms narrow it down — the desk checks those before quoting.",
  },
  {
    q: "Do you screen for sanctions and handle price-cap attestation?",
    a: "Yes. Counterparties and vessels are screened against OFAC, UK OFSI and EU consolidated lists before a freight idea goes back to the charterer, and cap-eligible cargoes go through a documented G7 price-cap attestation chain.",
  },
  {
    q: "How quickly will I hear back?",
    a: "A broker replies within 60 minutes during business hours. Include the cargo, load and discharge areas, laycan and stem to get a sharper first idea.",
  },
];

export default function TankersPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: "Tanker Chartering — LEVANTER",
            description:
              "Crude and clean tanker chartering: VLCC, Suezmax, Aframax/LR2, LR1 and MR across MEG, WAF, Black Sea/CPC, USG and Med lanes.",
            path: "/tankers",
          }),
          breadcrumbsLd(CRUMBS),
          serviceLd({
            name: "LEVANTER Tanker Desk",
            description:
              "Spot voyages, COAs and time charters for crude (VLCC, Suezmax, Aframax) and clean (LR2, LR1, MR) tankers.",
            serviceType: "Tanker chartering",
            path: "/tankers",
          }),
          faqLd(FAQ),
        ]}
      />
      <Nav active="tankers" />
      <main id="main">
        {/* Hero band */}
        <section className="hero-band">
          <svg
            className="hero-band-bg"
            viewBox="0 0 1600 400"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="cg" cx="0.85" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#B8893A" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#B8893A" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="1600" height="400" fill="url(#cg)" />
            <line
              x1="0"
              y1="240"
              x2="1600"
              y2="240"
              stroke="#F1ECDC"
              strokeWidth="0.5"
              opacity="0.2"
            />
            <g fill="#020B14">
              <path d="M 220 260 Q 240 252 320 252 L 1100 252 Q 1170 252 1190 260 L 1170 280 L 240 280 Z" />
              <rect x="1040" y="232" width="70" height="20" />
              <rect x="1056" y="220" width="40" height="12" />
            </g>
            <g stroke="#F1ECDC" strokeWidth="0.5" opacity="0.1">
              <line x1="40" y1="310" x2="200" y2="310" />
              <line x1="280" y1="340" x2="500" y2="340" />
              <line x1="900" y1="320" x2="1100" y2="320" />
            </g>
          </svg>
          <div className="container">
            <Breadcrumbs crumbs={CRUMBS} />
            <span className="eyebrow">Tanker chartering</span>
            <h1 className="display h1">Crude and clean tanker chartering, VLCC to MR.</h1>
            <p className="lead">
              Spot voyages, COAs and time charters across the MEG, West Africa, the Black Sea / CPC,
              the US Gulf and the Med — booked by brokers who work these lanes every day.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/contact?cargo=crude">
                  Charter inquiry <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              {CRUDE_READS[0] && (
                <Button asChild variant="bone">
                  <Link href={`/research/${reportSlug(CRUDE_READS[0])}`}>
                    Latest crude outlook <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              )}
            </div>

            <div className="hero-stats">
              <div className="stat">
                <div className="lbl">Crude classes</div>
                <div className="val display">3</div>
                <div className="delta">VLCC · Suezmax · Aframax</div>
              </div>
              <div className="stat">
                <div className="lbl">Clean classes</div>
                <div className="val display">3</div>
                <div className="delta">LR2 · LR1 · MR</div>
              </div>
              <div className="stat">
                <div className="lbl">Benchmark routes</div>
                <div className="val display">{routeCount}</div>
                <div className="delta">Baltic TD / TC definitions</div>
              </div>
              <div className="stat">
                <div className="lbl">Weekday coverage</div>
                <div className="val display">
                  {coverageHours} <span className="text-[0.5em]">h</span>
                </div>
                <div className="delta">Istanbul · London · SG · HOU</div>
              </div>
            </div>
          </div>
        </section>

        {/* Vessel classes */}
        <section className="section" aria-labelledby="classes-h">
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Classes covered</span>
              <h2 id="classes-h" className="display h2">
                Three crude sizes. One philosophy: charter where the trade is.
              </h2>
              <p>
                Indicative ranges only — real fixtures depend on age, ice class, vetting and
                charterer requirements.
              </p>
            </div>

            <div className="class-grid">
              {VESSEL_CLASSES.map((v) => (
                <article key={v.name} className="class-cell">
                  {v.svg}
                  <h3 className="nm">{v.name}</h3>
                  <div className="dwt">{v.desc}</div>
                  <ul>
                    {v.specs.map(([k, val]) => (
                      <li key={k}>
                        <span>{k}</span>
                        <span>{val}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="routes">
                    {v.routes.map((r) => (
                      <span key={r} className="route-tag">
                        {r}
                      </span>
                    ))}
                  </div>
                  <Link href={`/tankers/${v.slug}`} className="cta">
                    {v.cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>

            {/* Clean tanker classes */}
            <div className="sec-head" id="clean" style={{ marginTop: 48, scrollMarginTop: 96 }}>
              <span className="eyebrow">Also covered</span>
              <h2
                className="display"
                style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.015em", margin: 0 }}
              >
                Clean products tonnage.
              </h2>
            </div>
            <div className="class-grid" style={{ marginTop: 18 }}>
              {CLEAN_CLASSES.map((c) => (
                <article key={c.slug} className="class-cell">
                  <h3 className="nm">{c.name}</h3>
                  <div className="dwt">{c.desc}</div>
                  <p
                    style={{
                      color: "var(--muted)",
                      fontSize: 14,
                      lineHeight: 1.6,
                      margin: "8px 0 14px",
                    }}
                  >
                    {c.note}
                  </p>
                  <div className="routes">
                    {c.routes.map((r) => (
                      <span key={r} className="route-tag">
                        {r}
                      </span>
                    ))}
                  </div>
                  <Link href={`/tankers/${c.slug}`} className="cta">
                    {c.name} chartering <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Benchmark routes */}
        <section className="section" aria-labelledby="routes-h">
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Benchmark routes</span>
              <h2 id="routes-h" className="display h2">
                The lanes the desk works every day.
              </h2>
              <p>
                Baltic Exchange route definitions. For current freight levels ask the desk, or model
                a voyage in the <Link href="/voyage-estimator">voyage estimator</Link>.
              </p>
            </div>
            <div className="routes-grid">
              <div className="routes-table overflow-x-auto">
                <table>
                  <caption className="sr-only">Benchmark tanker routes and cargo sizes</caption>
                  <thead>
                    <tr>
                      <th scope="col">Route</th>
                      <th scope="col">Class</th>
                      <th scope="col">Cargo basis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BENCHMARK_ROUTES.map((r) => (
                      <tr key={r.code}>
                        <th scope="row" style={{ textAlign: "left", fontWeight: 400 }}>
                          <strong>{r.code}</strong> {r.lane}
                        </th>
                        <td>{r.cls}</td>
                        <td className="ws">{r.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-4">
                <div className="callout">
                  <span className="eyebrow">Bosphorus angle</span>
                  <h3>CPC and Black Sea crude, through the Turkish Straits</h3>
                  <p>
                    Black Sea barrels reach the Med through the Bosphorus and Dardanelles. Transit
                    queues, daylight rules and per-net-ton straits dues (US$6.70/NT from July 2026)
                    go into every TD6 estimate we run.
                  </p>
                  <Link href="/offices/istanbul" className="link">
                    Meet the Istanbul desk →
                  </Link>
                </div>
                <div className="callout">
                  <span className="eyebrow">Sanctions discipline</span>
                  <h3>Compliance built into every fixture</h3>
                  <p>
                    OFAC, UK OFSI and EU consolidated screening on every counterparty and vessel.
                    Price-cap attestation is handled at the desk.
                  </p>
                  <Link
                    href="/research/g7-price-cap-attestation-the-desk-level-workflow"
                    className="link"
                  >
                    How we handle price-cap attestation →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Desk strip */}
        <section className="desk" aria-labelledby="desk-h">
          <div className="container">
            <span className="eyebrow" style={{ color: "var(--accent-amber)" }}>
              Crude desk
            </span>
            <h2 id="desk-h" className="display h2">
              Crude brokers. One number to call.
            </h2>
            <p>
              You speak to the broker who handles your cargo, not a relationship manager. Desk line:{" "}
              <a
                href={telUrl()}
                style={{
                  color: "var(--accent-brass-lt)",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                {siteConfig.phone}
              </a>
            </p>
            <ul className="desk-team">
              {CRUDE_DESK.map((m) => (
                <li className="desk-card" key={m.name}>
                  <div className="avatar" style={{ background: m.color }} aria-hidden="true">
                    {m.initials}
                  </div>
                  <div>
                    <Link className="nm" href={`/brokers/${brokerSlug(m)}`}>
                      {m.name}
                    </Link>
                    <div className="ti">
                      {m.title} · {m.desk}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Insights */}
        <section className="section" aria-labelledby="reads-h">
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Recent crude views</span>
              <h2 id="reads-h" className="display h2">
                From the desk, not the press release.
              </h2>
            </div>
            <div className="insights">
              {CRUDE_READS.map((r) => (
                <article key={r.title} className="insight">
                  <div className="meta">
                    <span className="tag">{r.catLabel}</span> · {r.date}
                  </div>
                  <h3>
                    <Link href={`/research/${reportSlug(r)}`}>{r.title}</Link>
                  </h3>
                  <p>{r.desc}</p>
                  <span className="read">{r.read} min read</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section" style={{ paddingTop: 0 }} aria-labelledby="faq-h">
          <div className="container" style={{ maxWidth: 820 }}>
            <div className="sec-head">
              <span className="eyebrow">FAQ</span>
              <h2 id="faq-h" className="display h2">
                Tanker chartering questions.
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {FAQ.map((f) => (
                <article key={f.q} className="panel">
                  <h3
                    style={{
                      fontFamily: "var(--font-display),serif",
                      fontWeight: 500,
                      fontSize: 18,
                      letterSpacing: "-0.01em",
                      margin: "0 0 8px",
                    }}
                  >
                    {f.q}
                  </h3>
                  <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.65, margin: 0 }}>
                    {f.a}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <ContactCta
          headline="A crude or clean cargo to move?"
          body="Send the cargo, load and discharge areas, laycan and stem. A tanker broker replies within 60 minutes during business hours."
          context="tanker inquiry"
          inquiryHref="/contact?cargo=crude"
        />
      </main>
      <Footer />
    </>
  );
}
