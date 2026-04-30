import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Anchor,
  TrendingUp,
  AlertCircle,
  Container,
  Wheat,
  Globe2,
} from "lucide-react";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { JsonLd } from "../components/JsonLd";
import { Button } from "@/components/ui/button";
import {
  buildPageMetadata,
  breadcrumbsLd,
  faqLd,
  professionalServiceLd,
  webPageLd,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Dry Bulk — Capesize · Panamax · Supramax · Handysize",
  description:
    "Iron ore to grains, port-to-port. Capesize, Panamax, Supramax, and Handysize chartering with the LEVANTER dry bulk desk in Istanbul, London, and Singapore.",
  path: "/dry-bulk",
  keywords: [
    "Capesize broker",
    "Panamax broker",
    "Supramax broker",
    "iron ore chartering",
    "grain chartering",
    "BDI snapshot",
    "C5 W Australia Qingdao",
    "C3 Tubarão Qingdao",
    "P3A NoPac Japan",
    "S1B Indo ECI",
  ],
});

const CLASSES = [
  {
    name: "Capesize",
    spec: "180,000 dwt+",
    cargo: "Iron ore, coal",
    typical: "~180–210 k dwt; gearless",
    routes: [
      { code: "C5", lane: "W. Australia → Qingdao" },
      { code: "C3", lane: "Tubarão → Qingdao" },
      { code: "C7", lane: "Bolivar → Rotterdam" },
    ],
    Icon: Container,
  },
  {
    name: "Panamax / Kamsarmax",
    spec: "75–85,000 dwt",
    cargo: "Grains, coal, bauxite",
    typical: "Beam ≤ 32.31 m for old Panama locks; Kamsarmax LOA ≤ 229 m",
    routes: [
      { code: "P3A", lane: "NoPac → Japan / S. Korea" },
      { code: "P6", lane: "USEC → ARA" },
      { code: "P8", lane: "ECSA → Far East" },
    ],
    Icon: Wheat,
  },
  {
    name: "Supramax / Ultramax",
    spec: "55–65,000 dwt",
    cargo: "Grains, minor bulks, fertilisers",
    typical: "Geared (4 × 30 t cranes); flexible draft",
    routes: [
      { code: "S1B", lane: "Indonesia → East Coast India" },
      { code: "S4A", lane: "USG → Continent" },
      { code: "S10", lane: "S. China → Singapore" },
    ],
    Icon: Anchor,
  },
  {
    name: "Handysize",
    spec: "30–40,000 dwt",
    cargo: "Niche & coastal cargoes",
    typical: "Geared; serves smaller / draft-restricted ports",
    routes: [
      { code: "HS", lane: "Black Sea → ARA" },
      { code: "HS", lane: "USG → S. America" },
      { code: "HS", lane: "Continent → W. Africa" },
    ],
    Icon: Globe2,
  },
];

const BDI_INDEX = [
  { code: "BDI", name: "Baltic Dry Index", value: "1,612", delta: "+1.8%", up: true },
  { code: "BCI", name: "Baltic Capesize Index", value: "2,385", delta: "+3.2%", up: true },
  { code: "BPI", name: "Baltic Panamax Index", value: "1,420", delta: "−0.6%", up: false },
  { code: "BSI", name: "Baltic Supramax Index", value: "1,168", delta: "+0.4%", up: true },
];

const FAQ = [
  {
    q: "What dry bulk services does LEVANTER cover?",
    a: "Spot voyages and time charters across Capesize, Panamax/Kamsarmax, Supramax/Ultramax, and Handysize. We also run COAs (multi-shipment programmes) for repeat iron ore, coal, grain, and minor-bulk lifts.",
  },
  {
    q: "Where is the desk located?",
    a: "Istanbul (HQ for Black Sea / Med / CPC corridor), London (Atlantic Basin and S&P), and Singapore (Asia desk: NoPac, Indo, ECI). Houston is tanker-led but covers grain via the Atlantic relays.",
  },
  {
    q: "Can you handle a single voyage or only programmes?",
    a: "Both. Single spot voyages are routine; we also structure 6 / 12 / 24 month time charters and multi-year COAs for steel mills, utilities, and trading houses.",
  },
  {
    q: "How current is the BDI snapshot on this page?",
    a: "Indicative — the figures above are illustrative of typical Q2 2026 levels. For live BDI, BCI, BPI, BSI numbers, the desk provides daily reads on request.",
  },
  {
    q: "What about cargo on geared vs gearless tonnage?",
    a: "Capesize and modern Kamsarmax are typically gearless and require shore cranes. Supramax/Ultramax and Handysize ship geared, which is essential for ports without shore equipment — we match cargo and class accordingly.",
  },
];

export default function DryBulkPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: "Dry Bulk Chartering — LEVANTER",
            description:
              "Capesize, Panamax, Supramax, Handysize chartering across iron ore, coal, grain, and minor bulks.",
            path: "/dry-bulk",
          }),
          breadcrumbsLd([
            { name: "Home", path: "/" },
            { name: "Dry Bulk", path: "/dry-bulk" },
          ]),
          professionalServiceLd({
            name: "LEVANTER Dry Bulk Desk",
            description:
              "Capesize, Panamax, Supramax, and Handysize port-to-port chartering, COAs, and S&P advisory across iron ore, coal, grains, and minor bulks.",
            serviceType: "Dry bulk brokerage",
            path: "/dry-bulk",
          }),
          faqLd(FAQ),
        ]}
      />
      <Nav />
      <main>
        <section className="ph">
          <div className="container">
            <div className="crumbs">
              <Link href="/">LEVANTER</Link>
              <span>/</span> Dry Bulk
            </div>
            <span className="eyebrow">Dry Bulk</span>
            <h1 className="display h1">Iron ore to grains, port-to-port.</h1>
            <p>
              From Capesize iron ore programmes out of Australia and Brazil to Handy parcels in the
              Black Sea — we charter where the trade actually moves. Direct desk access from
              Istanbul, London, and Singapore.
            </p>
            <div className="flex flex-wrap gap-3" style={{ marginTop: 24 }}>
              <Button asChild>
                <Link href="/contact">
                  Send a bulk inquiry <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/brokers">Find a bulk broker</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Indicative BDI snapshot */}
        <section className="section" style={{ paddingTop: 64, paddingBottom: 48 }}>
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Indicative · last desk read</span>
              <h2 className="display h2">Where the BDI sits today.</h2>
              <p>
                Snapshot of the Baltic Exchange family. Confirm with the desk for live numbers
                before fixing.
              </p>
            </div>
            <div className="summary-strip">
              {BDI_INDEX.map((i) => (
                <div className="kpi" key={i.code}>
                  <div className="kpi-label">
                    {i.code} · {i.name}
                  </div>
                  <div className="kpi-value">{i.value}</div>
                  <div className={`kpi-delta ${i.up ? "up" : "down"}`}>{i.delta}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vessel classes deep */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Classes covered</span>
              <h2 className="display h2">Four sizes. Every major lane.</h2>
              <p>
                We match cargo, port restrictions, and lay-day window to the right class. Geared
                tonnage where cranes are needed, gearless where ports have shore equipment.
              </p>
            </div>
            <div className="class-grid">
              {CLASSES.map(({ Icon, ...c }) => (
                <article key={c.name} className="class-cell">
                  <Icon className="vsl mb-5 h-8 w-8 text-accent-brass" />
                  <h3 className="nm">{c.name}</h3>
                  <div className="dwt">
                    {c.spec.toUpperCase()} · {c.cargo.toUpperCase()}
                  </div>
                  <p
                    style={{
                      color: "var(--muted)",
                      fontSize: 13,
                      lineHeight: 1.55,
                      margin: "0 0 14px",
                    }}
                  >
                    {c.typical}
                  </p>
                  <div className="routes">
                    {c.routes.map((r) => (
                      <span key={`${c.name}-${r.code}-${r.lane}`} className="route-tag">
                        <strong>{r.code}</strong> {r.lane}
                      </span>
                    ))}
                  </div>
                  <Link href="/contact" className="cta">
                    Quote {c.name} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Market context */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Market context</span>
              <h2 className="display h2">What the dry desk is watching in 2026.</h2>
            </div>
            <div className="result-grid" style={{ marginBottom: 0 }}>
              <article className="panel">
                <div className="panel-head">
                  <span className="panel-title">
                    <TrendingUp className="inline h-3.5 w-3.5" /> Demand
                  </span>
                  <span className="panel-meta">Q2 2026</span>
                </div>
                <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.65, margin: 0 }}>
                  Chinese steel restocking is the single biggest driver for Capesize. Brazilian iron
                  ore exports through Tubarão remain the swing variable — every additional 5 m t of
                  monthly shipments tightens C3 and ripples through C5. On the grain side, NoPac
                  soybean season and ECSA corn flows set the Panamax tone; weather and harvest
                  yields move the curve more than fleet supply does on a quarter view.
                </p>
              </article>
              <article className="panel">
                <div className="panel-head">
                  <span className="panel-title">
                    <AlertCircle className="inline h-3.5 w-3.5" /> Supply
                  </span>
                  <span className="panel-meta">Fleet view</span>
                </div>
                <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.65, margin: 0 }}>
                  Order book remains thin compared to the 2008–2014 peak: Capesize and Kamsarmax
                  newbuilding slots out to 2028 are largely committed, scrapping is near multi-year
                  lows, and the IMO carbon-intensity rules (CII / EEXI) are pushing older vintage
                  tonnage off the prime fixtures. Net effect: any demand uptick has limited supply
                  cushion to absorb it.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* COA + service shape */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Service shape</span>
              <h2 className="display h2">Spot, time charter, COA.</h2>
              <p>
                Single voyages for opportunistic lifts, time charters for committed tonnage, and
                multi-year COAs for steel mills, utilities, and trading houses.
              </p>
            </div>
            <div className="class-grid">
              <article className="class-cell">
                <h3 className="nm">Single voyage (spot)</h3>
                <div className="dwt">PORT-TO-PORT · ONE LIFT</div>
                <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.55 }}>
                  The simplest contract: owner agrees to lift one cargo from A to B. Freight is per
                  ton. Demurrage and laytime are CP-defined. Ideal for one-off cargoes and price
                  discovery in a moving market.
                </p>
                <Link href="/contact" className="cta">
                  Spot inquiry <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </article>
              <article className="class-cell">
                <h3 className="nm">Time charter (TC)</h3>
                <div className="dwt">3 / 6 / 12 / 24 MONTHS</div>
                <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.55 }}>
                  Charterer takes commercial control of the vessel for a fixed period and pays a
                  daily hire. Useful for trading houses with a cargo programme, miners with shipping
                  exposure, and end-users hedging spot volatility.
                </p>
                <Link href="/contact" className="cta">
                  Talk TC terms <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </article>
              <article className="class-cell">
                <h3 className="nm">COA (Contract of Affreightment)</h3>
                <div className="dwt">MULTI-LIFT PROGRAMME</div>
                <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.55 }}>
                  Owner commits to ship a series of cargoes on agreed terms over a defined period.
                  Index-linked or fixed pricing. The desk runs a number of CPC, NoPac, and ECSA-Far
                  East COAs.
                </p>
                <Link href="/contact" className="cta">
                  Structure a COA <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container" style={{ maxWidth: 820 }}>
            <div className="sec-head">
              <span className="eyebrow">FAQ</span>
              <h2 className="display h2">Common questions.</h2>
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

        <section className="cta-strip">
          <div>
            <h3>A specific cargo in mind?</h3>
            <p>
              Send the load, discharge, lay-can, and stem — the bulk desk replies within the hour
              during business windows.
            </p>
          </div>
          <Button asChild>
            <Link href="/contact">
              Send a bulk inquiry <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </section>
      </main>
      <Footer />
    </>
  );
}
