/**
 * Reference tab — replaces the live-data Bunker Prices tab with static
 * educational content. No API needed.
 */

const GLOSSARY: { term: string; def: string }[] = [
  {
    term: "WS (Worldscale)",
    def: "Standard freight index — 100 = the published 'flat rate' (USD/mt) for that lane. WS 75 means 75% of flat. Recalibrated annually.",
  },
  {
    term: "TCE (Time-Charter Equivalent)",
    def: "Daily earnings of a voyage on a time-charter basis. (Voyage revenue − voyage costs) ÷ total voyage days.",
  },
  {
    term: "COA (Contract of Affreightment)",
    def: "Multi-shipment contract committing the owner to lift a series of cargoes at agreed terms over a defined period.",
  },
  {
    term: "Demurrage",
    def: "Daily compensation paid by the charterer to the owner for time used at port beyond the agreed laytime.",
  },
  {
    term: "Laycan",
    def: "Window during which the vessel must arrive and tender notice of readiness. Outside the window, the charterer can reject.",
  },
  {
    term: "Laden / Ballast",
    def: "Loaded with cargo / sailing empty between loads. Ballast legs eat into TCE because they earn no freight.",
  },
  {
    term: "DA (Disbursement Account)",
    def: "Itemised port costs for one call: dues, pilotage, towage, mooring, agency, statutory fees.",
  },
  {
    term: "Hi-5 spread",
    def: "VLSFO − HSFO price differential. Wider spread improves scrubber payback economics.",
  },
  {
    term: "VLSFO / HSFO / MGO / LSMGO",
    def: "Bunker grades. VLSFO ≤ 0.5%S, HSFO 3.5%S (scrubber-fitted only), MGO distillate, LSMGO low-sulphur distillate.",
  },
  {
    term: "EU ETS",
    def: "EU Emissions Trading System. Vessels surrender EUAs (1 per t CO₂) for emissions on EEA-touching voyages. Phase-in: 40% (2024) → 70% (2025) → 100% (2026).",
  },
  {
    term: "Worldscale lanes (TD/TC)",
    def: "TD = dirty (crude). TC = clean (products). e.g. TD3C MEG→China, TD20 WAF→UKC, TC2 CONT→USAC, TC14 USG→UKC.",
  },
  {
    term: "Suez / Panama / Bosphorus",
    def: "Major chokepoints. Suez (laden Suezmax ≈ $525k), Panama Neopanamax (≈ $485k), Bosphorus + Dardanelles (≈ $28.5k flat).",
  },
];

const VESSEL_SPECS: {
  klass: string;
  dwt: string;
  cargo: string;
  speed: string;
  cons: string;
  routes: string;
}[] = [
  {
    klass: "VLCC",
    dwt: "270–320 k",
    cargo: "~2 m bbl crude",
    speed: "13.5 kn",
    cons: "75 mt/d",
    routes: "TD3C, TD15, TD22",
  },
  {
    klass: "Suezmax",
    dwt: "130–160 k",
    cargo: "1 m bbl crude",
    speed: "14 kn",
    cons: "42 mt/d",
    routes: "TD20, TD6, TD23",
  },
  {
    klass: "Aframax / LR2",
    dwt: "80–115 k",
    cargo: "700 k bbl crude / clean",
    speed: "14.5 kn",
    cons: "32–36 mt/d",
    routes: "TD7, TD8, TD19",
  },
  {
    klass: "LR1",
    dwt: "55–80 k",
    cargo: "Clean products",
    speed: "14 kn",
    cons: "28 mt/d",
    routes: "TC5, TC8",
  },
  {
    klass: "MR",
    dwt: "40–55 k",
    cargo: "Clean products / chems",
    speed: "14 kn",
    cons: "24 mt/d",
    routes: "TC2, TC14, TC17",
  },
  {
    klass: "Handysize",
    dwt: "25–40 k",
    cargo: "Niche / coated",
    speed: "13 kn",
    cons: "20 mt/d",
    routes: "Coastal, intra-Med",
  },
];

const ETS_SCHEDULE: { year: string; share: string; note: string }[] = [
  {
    year: "2024",
    share: "40%",
    note: "Phase-in year 1. Half of intra-EEA voyages + 50% of EEA-to-3rd-country voyages exempt from surrender.",
  },
  {
    year: "2025",
    share: "70%",
    note: "Phase-in year 2. Surrender obligation rises; charterers and owners commonly split via a CP allocation clause.",
  },
  {
    year: "2026",
    share: "100%",
    note: "Full phase-in. CH₄ and N₂O included from 2026. EUAs typically procured through a third-party trader.",
  },
];

export function ReferenceView() {
  return (
    <section style={{ padding: "48px 0" }}>
      <div className="container">
        <h2 className="results-h" style={{ marginBottom: 8, borderBottom: 0, paddingBottom: 0 }}>
          Reference
          <span className="meta">Indicative · educational · no live data</span>
        </h2>
        <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 32px", maxWidth: "60ch" }}>
          A quick desk reference for the terms, vessel classes, and regulatory milestones used by
          the calculator. Numbers are indicative — confirm the live picture with the broker desk
          before fixing.
        </p>

        {/* Glossary */}
        <div className="section-block">
          <h3
            className="results-h"
            style={{ marginBottom: 12, borderBottom: 0, paddingBottom: 0, fontSize: 18 }}
          >
            Chartering glossary
          </h3>
          <div className="ref-grid">
            {GLOSSARY.map((g) => (
              <article key={g.term} className="ref-card">
                <div className="ref-term">{g.term}</div>
                <p className="ref-def">{g.def}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Vessel specs */}
        <div className="section-block">
          <h3
            className="results-h"
            style={{ marginBottom: 12, borderBottom: 0, paddingBottom: 0, fontSize: 18 }}
          >
            Vessel class quick reference
          </h3>
          <table className="dist-table">
            <thead>
              <tr>
                <th>Class</th>
                <th className="num">DWT</th>
                <th>Typical cargo</th>
                <th className="num">Laden speed</th>
                <th className="num">Consumption</th>
                <th>Lanes</th>
              </tr>
            </thead>
            <tbody>
              {VESSEL_SPECS.map((v) => (
                <tr key={v.klass}>
                  <td className="route">
                    <strong>{v.klass}</strong>
                  </td>
                  <td className="num">{v.dwt}</td>
                  <td>{v.cargo}</td>
                  <td className="num">{v.speed}</td>
                  <td className="num">{v.cons}</td>
                  <td>{v.routes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="note">
            Real consumption depends on hull condition, weather routing, and laden vs ballast
            posture. The calculator&apos;s default consumption auto-fills from these averages but
            you can override it per vessel.
          </div>
        </div>

        {/* EU ETS */}
        <div className="section-block">
          <h3
            className="results-h"
            style={{ marginBottom: 12, borderBottom: 0, paddingBottom: 0, fontSize: 18 }}
          >
            EU ETS phase-in schedule
          </h3>
          <table className="dist-table">
            <thead>
              <tr>
                <th>Year</th>
                <th className="num">Surrender share</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {ETS_SCHEDULE.map((r) => (
                <tr key={r.year}>
                  <td className="route">
                    <strong>{r.year}</strong>
                  </td>
                  <td className="num">{r.share}</td>
                  <td>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="note">
            EU ETS scope: 100% of intra-EEA voyages + 50% of EEA-to-3rd-country voyages. Use the
            calculator&apos;s &ldquo;EU ETS allowance cost&rdquo; field to model the EUA procurement
            cost in USD; the field flows directly into Total costs and TCE.
          </div>
        </div>
      </div>
    </section>
  );
}
