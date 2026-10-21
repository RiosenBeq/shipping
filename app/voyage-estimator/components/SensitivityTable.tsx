import { SensitivityRow, WS_LEVELS, fmt } from "../lib/calc";

export function SensitivityTable({ rows }: { rows: SensitivityRow[] }) {
  return (
    <div className="section-block sens-panel">
      <h2 className="results-h">
        TCE Sensitivity
        <span className="meta">$/day across freight × bunker</span>
      </h2>
      <div
        className="panel overflow-x-auto"
        style={{ padding: 0 }}
        role="region"
        aria-label="TCE sensitivity table"
        tabIndex={0}
      >
        <table className="sens-table">
          <caption className="sr-only">
            TCE in US dollars per day for each Worldscale level (columns) and VLSFO price (rows)
          </caption>
          <thead>
            <tr>
              <th scope="col">Worldscale →</th>
              {WS_LEVELS.map((ws) => (
                <th key={ws} scope="col">
                  WS {ws}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.delta} className={row.isCenter ? "center-row" : ""}>
                <th scope="row">
                  VLSFO ${row.vlsfo}{" "}
                  <small style={{ color: "var(--muted)", fontSize: 10 }}>
                    ({row.delta >= 0 ? "+" : ""}
                    {row.delta})
                  </small>
                </th>
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
