/**
 * Scrolling strip of the benchmark tanker routes the desk works on. It names the
 * Baltic route definitions only — no freight levels, because static numbers on a
 * ticker read as live market data.
 */
const ROUTES = [
  { code: "TD3C", route: "MEG → China", size: "VLCC · 270,000 mt" },
  { code: "TD20", route: "WAF → UKC", size: "Suezmax · 130,000 mt" },
  { code: "TD6", route: "Black Sea → Med", size: "Suezmax · 135,000 mt" },
  { code: "TD15", route: "WAF → China", size: "VLCC · 260,000 mt" },
  { code: "TD7", route: "North Sea → Continent", size: "Aframax · 80,000 mt" },
  { code: "TD22", route: "USG → China", size: "VLCC · 270,000 mt" },
  { code: "TC2", route: "Continent → USAC", size: "MR · 37,000 mt" },
  { code: "TC14", route: "USG → Continent", size: "MR · 38,000 mt" },
];

function Items({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="ticker-list" aria-hidden={hidden || undefined}>
      {ROUTES.map((r) => (
        <li className="ticker-item" key={r.code}>
          <span className="code">{r.code}</span>
          <span aria-hidden="true">·</span>
          <span>{r.route}</span>
          <span className="ws">{r.size}</span>
        </li>
      ))}
    </ul>
  );
}

export function Ticker() {
  return (
    <section className="ticker" aria-label="Benchmark tanker routes">
      <div className="ticker-pill">
        <span className="dot" aria-hidden="true"></span>
        <span>Benchmark routes</span>
      </div>
      <div className="ticker-viewport">
        <div className="ticker-track">
          <Items />
          <Items hidden />
        </div>
      </div>
    </section>
  );
}
