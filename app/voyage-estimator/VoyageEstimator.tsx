"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { InputPanel, CharterType } from "./components/InputPanel";
import { SummaryStrip } from "./components/SummaryStrip";
import { VoyageTimeline } from "./components/VoyageTimeline";
import { RouteMap } from "./components/RouteMap";
import { RevenueCosts } from "./components/RevenueCosts";
import { SensitivityTable } from "./components/SensitivityTable";
import { DistancesView } from "./components/DistancesView";
import { TariffsView } from "./components/TariffsView";
import { ReferenceView } from "./components/ReferenceView";
import { Inputs, buildSensitivity, computeResults } from "./lib/calc";
import { ROUTE_DATA, RouteKey, VESSEL_DEFAULTS, VESSEL_LABELS, VesselClass } from "./lib/data";
import {
  EstimatorState,
  decodeState,
  encodeState,
  loadStateFromStorage,
  saveStateToStorage,
} from "./lib/state";

type ViewName = "estimator" | "distances" | "tariffs" | "reference";

const DEFAULT_INPUTS: Inputs = {
  vesselClass: "suezmax",
  speed: 12.5,
  consumption: 42,
  distance: 6300,
  portDays: 4,
  cargo: 135000,
  ws: 68,
  flat: 15.2,
  demurrage: 38000,
  hsfo: 478,
  vlsfo: 612,
  portCosts: 285000,
  canalFees: 0,
  etsCost: 0,
};
const DEFAULT_ROUTE: RouteKey = "ag-china";
const DEFAULT_CHARTER: CharterType = "voyage";
const DEFAULT_STATE: EstimatorState = {
  inputs: DEFAULT_INPUTS,
  route: DEFAULT_ROUTE,
  charter: DEFAULT_CHARTER,
};
const VIEW_KEYS: ViewName[] = ["estimator", "distances", "tariffs", "reference"];
const VIEW_LABELS: Record<ViewName, string> = {
  estimator: "Calculator",
  distances: "Distance Tables",
  tariffs: "Port Tariffs",
  reference: "Reference",
};

export function VoyageEstimator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);
  const [route, setRoute] = useState<RouteKey>(DEFAULT_ROUTE);
  const [charter, setCharter] = useState<CharterType>(DEFAULT_CHARTER);
  const [view, setView] = useState<ViewName>("estimator");
  const [shareNotice, setShareNotice] = useState<"idle" | "copied" | "error">("idle");
  // Skip the first save-to-storage so we don't overwrite a hydrated URL state.
  const hydrated = useRef(false);

  // On mount: restore state from URL (priority) or localStorage; honor view hash.
  useEffect(() => {
    const hash = window.location.hash.slice(1) as ViewName;
    if (VIEW_KEYS.includes(hash)) setView(hash);

    const search = window.location.search.slice(1);
    if (search) {
      const parsed = decodeState(search, DEFAULT_STATE);
      setInputs(parsed.inputs);
      setRoute(parsed.route);
      setCharter(parsed.charter);
    } else {
      const stored = loadStateFromStorage(DEFAULT_STATE);
      if (stored) {
        setInputs(stored.inputs);
        setRoute(stored.route);
        setCharter(stored.charter);
      }
    }
    // Mark hydration complete on the next tick so subsequent state writes persist.
    queueMicrotask(() => {
      hydrated.current = true;
    });
  }, []);

  // Persist state to localStorage whenever it changes (post-hydration only).
  useEffect(() => {
    if (!hydrated.current || typeof window === "undefined") return;
    saveStateToStorage({ inputs, route, charter });
  }, [inputs, route, charter]);

  // Sync view to URL hash.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.replaceState) {
      const search = window.location.search;
      window.history.replaceState(null, "", `${window.location.pathname}${search}#${view}`);
    }
  }, [view]);

  const results = useMemo(() => computeResults(inputs), [inputs]);
  const sensitivity = useMemo(() => buildSensitivity(inputs), [inputs]);
  const routeData = ROUTE_DATA[route];

  const onInputChange = <K extends keyof Inputs>(key: K, value: Inputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const onVesselClassChange = (cls: VesselClass) => {
    const d = VESSEL_DEFAULTS[cls];
    setInputs((prev) => ({ ...prev, vesselClass: cls, cargo: d.cargo, consumption: d.cons }));
  };

  const onRouteChange = (k: RouteKey) => {
    const r = ROUTE_DATA[k];
    setRoute(k);
    setInputs((prev) => ({ ...prev, distance: r.nm, canalFees: r.canal, etsCost: r.ets }));
  };

  const onReset = () => {
    setInputs(DEFAULT_INPUTS);
    setRoute(DEFAULT_ROUTE);
    setCharter(DEFAULT_CHARTER);
    if (typeof window !== "undefined" && window.history.replaceState) {
      window.history.replaceState(null, "", `${window.location.pathname}#${view}`);
    }
  };

  // Browser-native print → user picks "Save as PDF" in the print dialog.
  const onExport = () => {
    if (typeof window !== "undefined") window.print();
  };

  // Build a shareable URL from current state and copy it to the clipboard.
  const onShare = async () => {
    if (typeof window === "undefined") return;
    const qs = encodeState({ inputs, route, charter });
    const url = `${window.location.origin}${window.location.pathname}?${qs}#${view}`;
    if (window.history.replaceState) {
      window.history.replaceState(null, "", `?${qs}#${view}`);
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareNotice("copied");
    } catch {
      setShareNotice("error");
    }
    window.setTimeout(() => setShareNotice("idle"), 2400);
  };

  const switchView = (next: ViewName) => {
    setView(next);
    if (typeof window !== "undefined") {
      const subnav = document.querySelector(".subnav") as HTMLElement | null;
      if (subnav) {
        window.scrollTo({ top: subnav.offsetTop - 60, behavior: "smooth" });
      }
    }
  };

  const onPickDistance = (row: { load: string; disch: string; nm: number }) => {
    // Match to a known route key when possible — otherwise just adjust distance
    const match = (Object.keys(ROUTE_DATA) as RouteKey[]).find(
      (k) => ROUTE_DATA[k].load === row.load && ROUTE_DATA[k].disch === row.disch
    );
    if (match) {
      onRouteChange(match);
    } else {
      setInputs((prev) => ({ ...prev, distance: row.nm }));
    }
    setView("estimator");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* PAGE HEADER */}
      <section className="ph">
        <div className="container">
          <div className="crumbs">
            <Link href="/">Home</Link>
            <span>/</span>
            <a href="#">Tools</a>
            <span>/</span> Voyage Estimator
          </div>
          <span className="eyebrow">Voyage Estimator</span>
          <h1 className="display h1">Run the numbers before you fix.</h1>
          <p>
            Indicative TCE, freight, and P&amp;L modelling across all major tanker lanes. You set
            the bunker, WS, and port costs; the calculator does the rest. Share or save your
            scenario in one click.
          </p>
        </div>
      </section>

      {/* SUB-NAV */}
      <nav className="subnav" aria-label="Voyage tools">
        <div className="subnav-inner">
          {VIEW_KEYS.map((k) => (
            <a
              key={k}
              href={`#${k}`}
              className={view === k ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                switchView(k);
              }}
            >
              {VIEW_LABELS[k]}
            </a>
          ))}
        </div>
      </nav>

      {/* ESTIMATOR VIEW */}
      <div className={`view${view === "estimator" ? "active" : ""}`}>
        <section className="estimator">
          <InputPanel
            inputs={inputs}
            route={route}
            charter={charter}
            onInputChange={onInputChange}
            onVesselClassChange={onVesselClassChange}
            onRouteChange={onRouteChange}
            onCharterChange={setCharter}
            onReset={onReset}
            onExport={onExport}
            onShare={onShare}
            shareNotice={shareNotice}
          />
          <div className="results">
            <SummaryStrip results={results} />
            <VoyageTimeline
              route={routeData}
              distance={inputs.distance}
              speed={inputs.speed}
              results={results}
              vesselLabel={VESSEL_LABELS[inputs.vesselClass]}
            />
            <RouteMap route={routeData} distance={inputs.distance} results={results} />
            <RevenueCosts inputs={inputs} results={results} />
            <SensitivityTable rows={sensitivity} />
          </div>
        </section>
      </div>

      {/* DISTANCES */}
      <div className={`view${view === "distances" ? "active" : ""}`}>
        <DistancesView activeNm={inputs.distance} onPick={onPickDistance} />
      </div>

      {/* TARIFFS */}
      <div className={`view${view === "tariffs" ? "active" : ""}`}>
        <TariffsView />
      </div>

      {/* REFERENCE */}
      <div className={`view${view === "reference" ? "active" : ""}`}>
        <ReferenceView />
      </div>

      {/* CTA STRIP */}
      <section className="cta-strip">
        <div>
          <h3>Want a specific scenario modelled?</h3>
          <p>
            Send your CP terms and we&apos;ll return a full estimator pack with sensitivity tables
            and bunker hedging options inside 60 minutes.
          </p>
        </div>
        <a href="#contact" className="btn btn-primary">
          Send to a broker
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </a>
      </section>
    </>
  );
}
