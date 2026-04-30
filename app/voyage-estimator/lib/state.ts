import type { Inputs } from "./calc";
import type { RouteKey, VesselClass } from "./data";

const STORAGE_KEY = "lvt-voyage-state-v1";

export type EstimatorState = {
  inputs: Inputs;
  route: RouteKey;
  charter: "voyage" | "tc" | "coa";
};

const NUMBER_KEYS: (keyof Inputs)[] = [
  "speed",
  "consumption",
  "distance",
  "portDays",
  "cargo",
  "ws",
  "flat",
  "demurrage",
  "hsfo",
  "vlsfo",
  "portCosts",
  "canalFees",
  "etsCost",
];

const VESSEL_VALUES: VesselClass[] = ["aframax", "suezmax", "vlcc", "lr2", "mr"];
const ROUTE_VALUES: RouteKey[] = [
  "bsea-med",
  "med-ukc",
  "ag-china",
  "ag-ukc",
  "wafr-uscg",
  "caribs-fareast",
];
const CHARTER_VALUES: EstimatorState["charter"][] = ["voyage", "tc", "coa"];

/**
 * Serialise estimator state to a stable, share-friendly query string fragment
 * (no leading "?"). Only short keys; only finite numbers.
 */
export function encodeState(state: EstimatorState): string {
  const params = new URLSearchParams();
  params.set("v", state.inputs.vesselClass);
  params.set("r", state.route);
  params.set("c", state.charter);
  for (const key of NUMBER_KEYS) {
    const value = state.inputs[key];
    if (Number.isFinite(value)) params.set(shortKey(key), String(value));
  }
  return params.toString();
}

/**
 * Decode a query string back into an EstimatorState patch. Unknown keys are
 * ignored; invalid values fall back to the provided defaults so the page
 * always renders.
 */
export function decodeState(
  qs: string,
  defaults: EstimatorState
): EstimatorState {
  const params = new URLSearchParams(qs);

  const vesselClassRaw = params.get("v") as VesselClass | null;
  const vesselClass: VesselClass = vesselClassRaw && VESSEL_VALUES.includes(vesselClassRaw)
    ? vesselClassRaw
    : defaults.inputs.vesselClass;

  const routeRaw = params.get("r") as RouteKey | null;
  const route: RouteKey = routeRaw && ROUTE_VALUES.includes(routeRaw)
    ? routeRaw
    : defaults.route;

  const charterRaw = params.get("c") as EstimatorState["charter"] | null;
  const charter = charterRaw && CHARTER_VALUES.includes(charterRaw)
    ? charterRaw
    : defaults.charter;

  const inputs: Inputs = { ...defaults.inputs, vesselClass };
  for (const key of NUMBER_KEYS) {
    const raw = params.get(shortKey(key));
    if (raw !== null) {
      const n = Number(raw);
      if (Number.isFinite(n)) (inputs[key] as number) = n;
    }
  }
  return { inputs, route, charter };
}

const SHORT: Record<keyof Inputs, string> = {
  vesselClass: "v",
  speed: "sp",
  consumption: "co",
  distance: "d",
  portDays: "pd",
  cargo: "cg",
  ws: "ws",
  flat: "fl",
  demurrage: "dm",
  hsfo: "hf",
  vlsfo: "vl",
  portCosts: "pc",
  canalFees: "cf",
  etsCost: "et",
};

function shortKey(key: keyof Inputs): string {
  return SHORT[key];
}

/**
 * Persist the estimator state to localStorage. No-op if storage is unavailable.
 */
export function saveStateToStorage(state: EstimatorState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function loadStateFromStorage(defaults: EstimatorState): EstimatorState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EstimatorState;
    // Validate the shape against defaults and the known enums.
    if (!parsed?.inputs || !parsed.route || !parsed.charter) return null;
    return decodeState(encodeState(parsed), defaults);
  } catch {
    return null;
  }
}

export function clearStorage() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
