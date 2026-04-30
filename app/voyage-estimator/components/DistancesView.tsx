"use client";

import { DISTANCE_ROWS, DistanceRow } from "../lib/data";

type Props = {
  activeNm: number;
  onPick: (row: DistanceRow) => void;
};

export function DistancesView({ activeNm, onPick }: Props) {
  return (
    <section style={{ padding: "48px 0" }}>
      <div className="container">
        <h2 className="results-h" style={{ marginBottom: 8, borderBottom: 0, paddingBottom: 0 }}>
          Major lane distances
          <span className="meta">nm · great-circle · canal-routed where applicable</span>
        </h2>
        <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 24px", maxWidth: "60ch" }}>
          Click any row to load it into the calculator. Distances reflect typical loaded passage;
          ballast adds 2–6% depending on lane.
        </p>
        <table className="dist-table">
          <thead>
            <tr>
              <th>Route</th>
              <th className="num">Distance (nm)</th>
              <th className="num">Steaming (12.5kn)</th>
              <th className="num">Canal/Strait</th>
              <th className="num">Bunker burn</th>
            </tr>
          </thead>
          <tbody>
            {DISTANCE_ROWS.map((r) => (
              <tr
                key={`${r.load}-${r.disch}`}
                className={`clickable${r.nm === activeNm ? "is-active" : ""}`}
                onClick={() => onPick(r)}
              >
                <td className="route">
                  {r.title}
                  <small>{r.detail}</small>
                </td>
                <td className="num">{r.nm.toLocaleString("en-US")}</td>
                <td className="num">{r.steaming}</td>
                <td className="num">{r.canal}</td>
                <td className="num">{r.burn}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="note">
          Bunker burn calculated at 42 mt/d for Suezmax @ 12.5 kn — use the calculator to model your
          specific vessel and speed.
        </div>
      </div>
    </section>
  );
}
