import { CANAL_ROWS, TARIFF_ROWS } from "../lib/data";

const fmtNum = (n: number) => n.toLocaleString("en-US");

export function TariffsView() {
  return (
    <section style={{ padding: "48px 0" }}>
      <div className="container">
        <h2 className="results-h" style={{ marginBottom: 8, borderBottom: 0, paddingBottom: 0 }}>
          Port tariffs &amp; agency costs
          <span className="meta">USD · indicative · Suezmax 158k dwt</span>
        </h2>
        <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 24px", maxWidth: "60ch" }}>
          Disbursement account estimates for a clean call (loading or discharge, 36-48h on berth).
          Includes port dues, pilotage, towage, mooring, agency, and statutory fees.
        </p>
        <table className="dist-table">
          <thead>
            <tr>
              <th>Port</th>
              <th>Country</th>
              <th className="num">Port dues</th>
              <th className="num">Pilotage</th>
              <th className="num">Towage</th>
              <th className="num">Total DA</th>
            </tr>
          </thead>
          <tbody>
            {TARIFF_ROWS.map((r) => (
              <tr key={r.port}>
                <td className="route">{r.port}</td>
                <td>{r.country}</td>
                <td className="num">{fmtNum(r.dues)}</td>
                <td className="num">{fmtNum(r.pilotage)}</td>
                <td className="num">{fmtNum(r.towage)}</td>
                <td className="num">
                  <strong>{fmtNum(r.total)}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2
          className="results-h"
          style={{ margin: "48px 0 8px", borderBottom: 0, paddingBottom: 0 }}
        >
          Canal &amp; strait dues
          <span className="meta">USD · Suezmax basis</span>
        </h2>
        <table className="dist-table">
          <thead>
            <tr>
              <th>Waterway</th>
              <th className="num">Laden transit</th>
              <th className="num">Ballast transit</th>
              <th className="num">Avg transit time</th>
            </tr>
          </thead>
          <tbody>
            {CANAL_ROWS.map((r) => (
              <tr key={r.waterway}>
                <td className="route">{r.waterway}</td>
                <td className="num">{r.laden}</td>
                <td className="num">{r.ballast}</td>
                <td className="num">{r.transit}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="note">
          Tariffs updated weekly. Always confirm with port agent before fixture — local conditions,
          draft restrictions, and special cargoes can vary the DA significantly.
        </div>
      </div>
    </section>
  );
}
