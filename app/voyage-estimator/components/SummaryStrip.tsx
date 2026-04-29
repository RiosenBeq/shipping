import { Results, fmt } from "../lib/calc";

export function SummaryStrip({ results }: { results: Results }) {
  return (
    <div className="summary-strip">
      <div className="kpi tce">
        <div className="kpi-label">TCE / day</div>
        <div className="kpi-value">${fmt(results.tce)}</div>
        <div className="kpi-delta up">▲ vs market avg $32,100</div>
      </div>
      <div className="kpi">
        <div className="kpi-label">Voyage P&amp;L</div>
        <div className="kpi-value">
          ${(results.pl / 1e6).toFixed(2)}
          <span className="kpi-unit">M</span>
        </div>
        <div className="kpi-delta up">+12.4% vs benchmark</div>
      </div>
      <div className="kpi">
        <div className="kpi-label">Total revenue</div>
        <div className="kpi-value">
          ${(results.totalRev / 1e6).toFixed(2)}
          <span className="kpi-unit">M</span>
        </div>
      </div>
      <div className="kpi">
        <div className="kpi-label">Voyage days</div>
        <div className="kpi-value">
          {results.totalDays.toFixed(1)}
          <span className="kpi-unit">d</span>
        </div>
      </div>
    </div>
  );
}
