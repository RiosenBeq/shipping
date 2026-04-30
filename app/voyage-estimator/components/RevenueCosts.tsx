import { Inputs, Results, fmt } from "../lib/calc";

type Props = {
  inputs: Inputs;
  results: Results;
};

export function RevenueCosts({ inputs, results }: Props) {
  return (
    <div className="section-block">
      <h2 className="results-h">
        Revenue &amp; Costs
        <span className="meta">USD · per voyage</span>
      </h2>
      <div className="result-grid" style={{ marginBottom: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">
              <span style={{ color: "var(--state-positive)" }}>+</span> Revenue
            </span>
            <span className="panel-meta">per voyage</span>
          </div>
          <div className="line-row">
            <span className="label">
              Freight (WS basis)
              <small>
                WS {inputs.ws} × ${inputs.flat} × {fmt(inputs.cargo)}mt
              </small>
            </span>
            <span className="value">${fmt(results.freight)}</span>
          </div>
          <div className="line-row">
            <span className="label">
              Demurrage (est.) <small>0.5d</small>
            </span>
            <span className="value">${fmt(results.demRev)}</span>
          </div>
          <div className="line-row total">
            <span className="label">Total revenue</span>
            <span className="value">${fmt(results.totalRev)}</span>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">
              <span style={{ color: "var(--accent-coral)" }}>−</span> Costs
            </span>
            <span className="panel-meta">voyage opex</span>
          </div>
          <div className="line-row">
            <span className="label">
              Bunkers — laden
              <small>
                {fmt(results.burnLaden)} mt × ${inputs.vlsfo}
              </small>
            </span>
            <span className="value">${fmt(results.cBunkLaden)}</span>
          </div>
          <div className="line-row">
            <span className="label">
              Bunkers — port
              <small>
                {inputs.portDays}d × 5mt × ${inputs.vlsfo}
              </small>
            </span>
            <span className="value">${fmt(results.cBunkPort)}</span>
          </div>
          <div className="line-row">
            <span className="label">
              Port costs <small>load + disch</small>
            </span>
            <span className="value">${fmt(inputs.portCosts)}</span>
          </div>
          <div className="line-row">
            <span className="label">Canal / SECA fees</span>
            <span className="value">${fmt(inputs.canalFees)}</span>
          </div>
          <div className="line-row">
            <span className="label">EU ETS allowances</span>
            <span className="value">${fmt(inputs.etsCost)}</span>
          </div>
          <div className="line-row">
            <span className="label">
              Brokerage <small>{(results.brokerage * 100).toFixed(2)}%</small>
            </span>
            <span className="value">${fmt(results.cBrok)}</span>
          </div>
          <div className="line-row total">
            <span className="label">Total costs</span>
            <span className="value">${fmt(results.totalCosts)}</span>
          </div>
        </div>
      </div>
      <div className="note">
        Bunker prices reflect today&apos;s average across origin/transit ports. EU ETS allowances
        apply to legs touching EU ports — toggle the field to model.
      </div>
    </div>
  );
}
