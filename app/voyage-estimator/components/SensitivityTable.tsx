import { SensitivityRow, WS_LEVELS, fmt } from "../lib/calc";

export function SensitivityTable({ rows }: { rows: SensitivityRow[] }) {
  return (
    <div className="section-block sens-panel">
      <h2 className="results-h">
        TCE Sensitivity
        <span className="meta">$/day across freight × bunker</span>
      </h2>
      <div className="panel" style={{ padding: 0 }}>
        <table className="sens-table">
          <thead>
            <tr>
              <th>Worldscale →</th>
              {WS_LEVELS.map((ws) => (
                <th key={ws}>WS {ws}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.delta} className={row.isCenter ? "center-row" : ""}>
                <td>
                  VLSFO ${row.vlsfo}{" "}
                  <small style={{ color: "var(--ink-fog)", fontSize: 10 }}>
                    ({row.delta >= 0 ? "+" : ""}
                    {row.delta})
                  </small>
                </td>
                {row.cells.map((c, i) => (
                  <td key={i} className={c.cls}>
                    ${fmt(c.tce)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
