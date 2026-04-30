const RATES = [
  { code: "TD3C", route: "MEG → CHN", ws: "72.5", delta: "+2.1%", up: true },
  { code: "TD20", route: "WAF → UKC", ws: "95.0", delta: "−1.4%", up: false },
  { code: "TD6", route: "BLK → MED", ws: "128", delta: "+3.2%", up: true },
  { code: "TC2", route: "CONT → USAC", ws: "146", delta: "+0.4%", up: true },
  { code: "TC14", route: "USG → UKC", ws: "118", delta: "−0.8%", up: false },
  { code: "TD22", route: "USG → CHN", ws: "62.0", delta: "+1.1%", up: true },
  { code: "TD7", route: "NSEA → CONT", ws: "112", delta: "−0.8%", up: false },
  { code: "TD15", route: "WAF → EAST", ws: "68.0", delta: "+0.6%", up: true },
];

export function Ticker() {
  return (
    <div className="ticker" aria-label="Live freight rates">
      <div className="ticker-pill" aria-hidden="true">
        <span className="dot"></span>
        <span>Live</span>
      </div>
      <div className="ticker-track">
        {[...RATES, ...RATES].map((r, i) => (
          <span className="ticker-item" key={i}>
            <span className="code">{r.code}</span>
            <span>·</span>
            <span>{r.route}</span>
            <span className="ws">WS {r.ws}</span>
            <span className={`delta ${r.up ? "up" : "down"}`}>{r.delta}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
