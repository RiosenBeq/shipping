import { BUNKER_HUBS, SPREAD_ROWS } from "../lib/data";

const sign = (n: number) => (n >= 0 ? `+${n.toFixed(n % 1 === 0 ? 0 : 2)}` : n.toFixed(n % 1 === 0 ? 0 : 2));
const heatClass = (n: number | null) => {
  if (n === null) return "";
  if (n > 0) return "heat-high";
  if (n < -10) return "heat-low";
  return "heat-mid";
};

export function BunkersView() {
  return (
    <section style={{ padding: "48px 0" }}>
      <div className="container">
        <h2 className="results-h" style={{ marginBottom: 8, borderBottom: 0, paddingBottom: 0 }}>
          Bunker prices
          <span className="meta">
            <span className="live-pill">
              <span className="dot"></span>Live · 14:32 UTC
            </span>
          </span>
        </h2>
        <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 24px", maxWidth: "60ch" }}>
          Indicative spot prices across major bunkering hubs. Updated every 15 minutes from
          independent surveyor data.
        </p>

        <div className="bunkers" style={{ marginBottom: 32 }}>
          {BUNKER_HUBS.map((h) => (
            <div className="bunker" key={h.port}>
              <div className="port">{h.port}</div>
              {(["hsfo", "vlsfo", "mgo", "lsmgo"] as const).map((g) => {
                const grade = h[g];
                const label = g === "hsfo" ? "HSFO 380" : g.toUpperCase();
                return (
                  <div className="grade" key={g}>
                    <span>{label}</span>
                    <span>
                      <strong>${grade.px}</strong>{" "}
                      <span className={`delta${grade.delta < 0 ? " dn" : ""}`}>
                        {grade.delta >= 0 ? `+${grade.delta.toFixed(2)}` : `−${Math.abs(grade.delta).toFixed(2)}`}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <h2
          className="results-h"
          style={{ margin: "48px 0 8px", borderBottom: 0, paddingBottom: 0 }}
        >
          Spread &amp; differentials
          <span className="meta">USD/mt · vs Singapore</span>
        </h2>
        <table className="dist-table">
          <thead>
            <tr>
              <th>Hub</th>
              <th className="num">VLSFO</th>
              <th className="num">vs SIN</th>
              <th className="num">HSFO</th>
              <th className="num">vs SIN</th>
              <th className="num">Hi-5 spread</th>
            </tr>
          </thead>
          <tbody>
            {SPREAD_ROWS.map((r) => (
              <tr key={r.hub}>
                <td className="route">{r.hub}</td>
                <td className="num">{r.vlsfo}</td>
                <td className={`num ${heatClass(r.vlsfoDelta)}`}>
                  {r.vlsfoDelta === null ? "—" : sign(r.vlsfoDelta)}
                </td>
                <td className="num">{r.hsfo}</td>
                <td className={`num ${heatClass(r.hsfoDelta)}`}>
                  {r.hsfoDelta === null ? "—" : sign(r.hsfoDelta)}
                </td>
                <td className="num">{r.hi5}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="note">
          Hi-5 spread = VLSFO premium over HSFO (compliance vs scrubber economics). Wider spread
          improves scrubber payback.
        </div>
      </div>
    </section>
  );
}
