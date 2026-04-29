"use client";

import { Inputs } from "../lib/calc";
import { ROUTE_DATA, RouteKey, VESSEL_LABELS, VesselClass } from "../lib/data";

type CharterType = "voyage" | "tc" | "coa";

type Props = {
  inputs: Inputs;
  route: RouteKey;
  charter: CharterType;
  onInputChange: <K extends keyof Inputs>(key: K, value: Inputs[K]) => void;
  onVesselClassChange: (cls: VesselClass) => void;
  onRouteChange: (route: RouteKey) => void;
  onCharterChange: (c: CharterType) => void;
  onReset: () => void;
  onExport: () => void;
};

export function InputPanel({
  inputs,
  route,
  charter,
  onInputChange,
  onVesselClassChange,
  onRouteChange,
  onCharterChange,
  onReset,
  onExport,
}: Props) {
  const num = (key: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value === "" ? 0 : Number(e.target.value);
    onInputChange(key, v as Inputs[typeof key]);
  };

  return (
    <aside className="calc-panel">
      <h2>Voyage inputs</h2>
      <p className="sub">All fields update results live.</p>

      <div className="calc-group">
        <div className="calc-group-title">Vessel</div>
        <div className="calc-row full">
          <div className="field">
            <label htmlFor="vesselClass">Class</label>
            <select
              id="vesselClass"
              value={inputs.vesselClass}
              onChange={(e) => onVesselClassChange(e.target.value as VesselClass)}
            >
              {(Object.keys(VESSEL_LABELS) as VesselClass[]).map((k) => (
                <option key={k} value={k}>
                  {VESSEL_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="calc-row">
          <div className="field">
            <label htmlFor="speed">Speed (kn)</label>
            <input
              type="number"
              id="speed"
              value={inputs.speed}
              step="0.5"
              min="8"
              max="16"
              onChange={num("speed")}
            />
          </div>
          <div className="field">
            <label htmlFor="consumption">Cons HFO/MGO (mt/d)</label>
            <input
              type="number"
              id="consumption"
              value={inputs.consumption}
              step="1"
              min="20"
              max="120"
              onChange={num("consumption")}
            />
          </div>
        </div>
      </div>

      <div className="calc-group">
        <div className="calc-group-title">Route</div>
        <div className="calc-row full">
          <div className="field">
            <label htmlFor="route">Lane</label>
            <select id="route" value={route} onChange={(e) => onRouteChange(e.target.value as RouteKey)}>
              {(Object.keys(ROUTE_DATA) as RouteKey[]).map((k) => (
                <option key={k} value={k}>
                  {ROUTE_DATA[k].label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="calc-row">
          <div className="field">
            <label htmlFor="distance">Distance (nm)</label>
            <input type="number" id="distance" value={inputs.distance} onChange={num("distance")} />
          </div>
          <div className="field">
            <label htmlFor="portDays">Port days</label>
            <input
              type="number"
              id="portDays"
              value={inputs.portDays}
              step="0.5"
              min="0"
              onChange={num("portDays")}
            />
          </div>
        </div>
      </div>

      <div className="calc-group">
        <div className="calc-group-title">Cargo &amp; Freight</div>
        <div className="calc-row">
          <div className="field">
            <label htmlFor="cargo">Cargo (mt)</label>
            <input type="number" id="cargo" value={inputs.cargo} step="1000" onChange={num("cargo")} />
          </div>
          <div className="field">
            <label htmlFor="ws">Freight (Worldscale)</label>
            <input
              type="number"
              id="ws"
              value={inputs.ws}
              step="1"
              min="20"
              max="200"
              onChange={num("ws")}
            />
          </div>
        </div>
        <div className="calc-row">
          <div className="field">
            <label htmlFor="flat">Flat rate (USD/mt)</label>
            <input type="number" id="flat" value={inputs.flat} step="0.10" onChange={num("flat")} />
          </div>
          <div className="field">
            <label htmlFor="demurrage">Demurrage ($/d)</label>
            <input
              type="number"
              id="demurrage"
              value={inputs.demurrage}
              step="1000"
              onChange={num("demurrage")}
            />
          </div>
        </div>
      </div>

      <div className="calc-group">
        <div className="calc-group-title">Costs &amp; Bunkers</div>
        <div className="calc-row">
          <div className="field">
            <label htmlFor="hsfo">HSFO ($/mt)</label>
            <input type="number" id="hsfo" value={inputs.hsfo} step="1" onChange={num("hsfo")} />
          </div>
          <div className="field">
            <label htmlFor="vlsfo">VLSFO ($/mt)</label>
            <input type="number" id="vlsfo" value={inputs.vlsfo} step="1" onChange={num("vlsfo")} />
          </div>
        </div>
        <div className="calc-row">
          <div className="field">
            <label htmlFor="portCosts">Port costs (USD)</label>
            <input
              type="number"
              id="portCosts"
              value={inputs.portCosts}
              step="5000"
              onChange={num("portCosts")}
            />
          </div>
          <div className="field">
            <label htmlFor="canalFees">Canal/SECA fees (USD)</label>
            <input
              type="number"
              id="canalFees"
              value={inputs.canalFees}
              step="5000"
              onChange={num("canalFees")}
            />
          </div>
        </div>
        <div className="calc-row full">
          <div className="field">
            <label htmlFor="etsCost">EU ETS allowance cost (USD)</label>
            <input
              type="number"
              id="etsCost"
              value={inputs.etsCost}
              step="5000"
              onChange={num("etsCost")}
            />
          </div>
        </div>
      </div>

      <div className="calc-group">
        <div className="calc-group-title">Charter terms</div>
        <div className="calc-row full">
          <div className="field">
            <label>Charter type</label>
            <div className="seg" role="tablist">
              {(["voyage", "tc", "coa"] as CharterType[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  className={charter === c ? "active" : ""}
                  onClick={() => onCharterChange(c)}
                >
                  {c === "voyage" ? "Voyage" : c === "tc" ? "Time charter" : "COA"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="calc-actions">
        <button className="calc-btn calc-btn-ghost" onClick={onReset}>
          Reset
        </button>
        <button className="calc-btn calc-btn-primary" onClick={onExport}>
          Export PDF
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

export type { CharterType };
