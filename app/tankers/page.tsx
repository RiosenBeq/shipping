import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { JsonLd } from "../components/JsonLd";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { buildPageMetadata, breadcrumbsLd, professionalServiceLd, webPageLd } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Crude Tankers — VLCC · Suezmax · Aframax",
  description:
    "VLCC, Suezmax, Aframax — every long-haul lane that matters. Spot voyages, COAs, and time charters across MEG, WAF, Black Sea, CPC, and BTC.",
  path: "/tankers",
  keywords: [
    "VLCC chartering",
    "Suezmax broker",
    "Aframax tanker",
    "TD3C MEG China",
    "TD20 WAF UKC",
    "TD6 Black Sea Med",
    "CPC programme",
    "crude tanker desk",
  ],
});

const VESSEL_CLASSES = [
  {
    name: "VLCC",
    desc: "VERY LARGE CRUDE CARRIER · 270–320,000 DWT",
    specs: [
      ["Cargo", "~2 m bbl"],
      ["Length OA", "330 m"],
      ["Draft", "22.5 m"],
      ["Speed (laden)", "13.5 kt"],
    ],
    routes: ["TD3C MEG-CHN", "TD15 WAF-EAST", "TD22 USG-CHN"],
    cta: "Get a VLCC quote",
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
    name: "Suezmax",
    desc: "130–160,000 DWT · LIGHT-CRUDE WORKHORSE",
    specs: [
      ["Cargo", "1 m bbl"],
      ["Length OA", "275 m"],
      ["Draft", "17 m"],
      ["Speed (laden)", "14 kt"],
    ],
    routes: ["TD20 WAF-UKC", "TD6 BLK-MED", "TD23 MEG-MED"],
    cta: "Get a Suezmax quote",
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
    name: "Aframax / LR2",
    desc: "80–115,000 DWT · SHORT-HAUL · BLACK SEA & MED",
    specs: [
      ["Cargo", "700 k bbl"],
      ["Length OA", "250 m"],
      ["Draft", "14.5 m"],
      ["Speed (laden)", "14.5 kt"],
    ],
    routes: ["TD7 NSEA-CONT", "TD8 KUW-SPORE", "TD19 CMED-MED"],
    cta: "Get an Afra quote",
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

const ROUTES = [
  { code: "TD3C", route: "MEG → China", ws: "72.5", tce: "$48,200", delta: "▲ 2.1%", up: true },
  { code: "TD20", route: "WAF → UKC", ws: "95.0", tce: "$51,800", delta: "▼ 1.4%", up: false },
  { code: "TD6", route: "Black Sea → Med", ws: "128", tce: "$44,100", delta: "▲ 3.2%", up: true },
  { code: "TD15", route: "WAF → East", ws: "68.0", tce: "$39,400", delta: "▲ 0.6%", up: true },
  { code: "TD7", route: "NSEA → CONT", ws: "112", tce: "$32,900", delta: "▼ 0.8%", up: false },
  { code: "TD22", route: "USG → China", ws: "62.0", tce: "$36,100", delta: "▲ 1.1%", up: true },
  { code: "TD23", route: "MEG → Med", ws: "88.5", tce: "$41,700", delta: "▲ 1.8%", up: true },
];

const TEAM = [
  { initials: "MA", name: "Mehmet Aydın", title: "Senior Crude · VLCC", color: "#B8893A" },
  { initials: "SH", name: "Søren Hansen", title: "Suezmax · WAF", color: "#D4A04A" },
  { initials: "EK", name: "Elif Kaya", title: "Aframax · Black Sea", color: "#4A5E6E" },
  { initials: "WZ", name: "Wei Zhang", title: "Asia · VLCC", color: "#0A1F33" },
];

const INSIGHTS = [
  {
    tag: "Weekly Outlook",
    date: "28 APR 2026",
    title: "Suezmax tightness sustains as CPC volumes rebound",
    desc: "Black Sea exports tracking Q1 highs while Atlantic Basin tonnage thins. Where the squeeze holds.",
    read: "7 min",
  },
  {
    tag: "Route Guide",
    date: "APRIL 2026",
    title: "TD3C demystified: MEG–China, end-to-end",
    desc: "Loading windows, transit math, demurrage triggers, and the four laycan patterns charterers actually run.",
    read: "11 min",
  },
  {
    tag: "Desk note",
    date: "21 APR 2026",
    title: "WAF–East: the slow re-rating",
    desc: "Asian buying for crude diet has shifted. What that means for VLCC ballast economics through Q2.",
    read: "5 min",
  },
];

export default function TankersPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: "Crude Tankers — LEVANTER",
            description:
              "VLCC, Suezmax, Aframax chartering across the long-haul crude lanes — MEG, WAF, Black Sea, CPC.",
            path: "/tankers",
          }),
          breadcrumbsLd([
            { name: "Home", path: "/" },
            { name: "Tankers", path: "/tankers" },
          ]),
          professionalServiceLd({
            name: "LEVANTER Crude Tanker Desk",
            description:
              "Spot voyages, COAs, and time charters for VLCC, Suezmax, and Aframax tankers.",
            serviceType: "Crude tanker brokerage",
            path: "/tankers",
          }),
        ]}
      />
      <Nav active="tankers" />
      <main>
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
            <div className="crumbs">
              <Link href="/">LEVANTER</Link>
              <span>/</span>
              <span>Tankers</span>
              <span>/</span>
              Crude
            </div>
            <span className="eyebrow">Crude Tankers</span>
            <h1 className="display h1">
              VLCC, Suezmax, Aframax — every long-haul lane that matters.
            </h1>
            <p className="lead">
              Spot voyages, COAs, and time charters across MEG, WAF, Black Sea, CPC, and BTC. The
              desk that books where the trade actually moves.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <a href="#inquiry">
                  Charter inquiry <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="bone">
                <Link href="/research">
                  Latest crude outlook <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="hero-stats">
              <div className="stat">
                <div className="lbl">Active VLCC fixtures (Apr)</div>
                <div className="val display">38</div>
                <div className="delta">▲ vs Mar +12%</div>
              </div>
              <div className="stat">
                <div className="lbl">Suezmax COAs running</div>
                <div className="val display">6</div>
                <div className="delta">3 in CPC programme</div>
              </div>
              <div className="stat">
                <div className="lbl">Avg first reply</div>
                <div className="val display">
                  42 <span className="text-[0.5em]">min</span>
                </div>
                <div className="delta">SLA 60 min</div>
              </div>
              <div className="stat">
                <div className="lbl">Desks covering</div>
                <div className="val display">24/7</div>
                <div className="delta">Istanbul · London · SG · HOU</div>
              </div>
            </div>
          </div>
        </section>

        {/* Vessel classes */}
        <section className="section">
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Classes covered</span>
              <h2 className="display h2">
                Three sizes. One philosophy: charter where the trade is.
              </h2>
              <p>
                Indicative ranges only — real fixtures depend on age, ice class, vetting, charterer
                requirements.
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
                  <a href="#inquiry" className="cta">
                    {v.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Indicative route board */}
        <section className="section">
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Indicative route board</span>
              <h2 className="display h2">Where the desk is fixing this week.</h2>
              <p>
                Snapshot from recent fixtures — confirm with the desk before pricing. Numbers move
                fast.
              </p>
            </div>
            <div className="routes-grid">
              <div className="routes-table overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Route</th>
                      <th>WS</th>
                      <th>TCE / day</th>
                      <th>5-day</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROUTES.map((r) => (
                      <tr key={r.code}>
                        <td>
                          <strong>{r.code}</strong> {r.route}
                        </td>
                        <td className="ws">{r.ws}</td>
                        <td className="tce">{r.tce}</td>
                        <td className={`delta ${r.up ? "up" : "down"} flex items-center gap-1`}>
                          {r.up ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {r.delta.replace(/[▲▼]\s*/, "")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <aside className="flex flex-col gap-4">
                <div className="callout">
                  <span className="eyebrow">Bosphorus angle</span>
                  <h4>CPC programme tightness, Black Sea–Med weight</h4>
                  <p>
                    ~38% of our 2026 Suezmax YTD fixtures touch CPC or Novorossiysk. Where Atlantic
                    Basin tonnage is short, we have the relationships.
                  </p>
                  <a href="#" className="link">
                    See Black Sea desk →
                  </a>
                </div>
                <div className="callout">
                  <span className="eyebrow">Sanctions discipline</span>
                  <h4>Compliance built into every fix</h4>
                  <p>
                    OFAC, UK OFSI, EU consolidated screening on every counterparty and vessel. Price
                    cap and G7 attestation handled at the desk.
                  </p>
                  <a href="#" className="link">
                    Compliance approach →
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Desk strip */}
        <section className="desk">
          <div className="container">
            <span className="eyebrow" style={{ color: "var(--accent-amber)" }}>
              Crude desk
            </span>
            <h2 className="display h2">Five brokers. One number to call.</h2>
            <p>You speak to the broker who handles your cargo. Not a relationship manager.</p>
            <div className="desk-team">
              {TEAM.map((m) => (
                <div className="desk-card" key={m.initials}>
                  <div className="avatar" style={{ background: m.color }}>
                    {m.initials}
                  </div>
                  <div>
                    <div className="nm">{m.name}</div>
                    <div className="ti">{m.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Insights */}
        <section className="section">
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Recent crude views</span>
              <h2 className="display h2">From the desk, not the press release.</h2>
            </div>
            <div className="insights">
              {INSIGHTS.map((i) => (
                <article key={i.title} className="insight">
                  <div className="meta">
                    <span className="tag">{i.tag}</span> · {i.date}
                  </div>
                  <h4>{i.title}</h4>
                  <p>{i.desc}</p>
                  <Link href="/research" className="read">
                    Read · {i.read} →
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
