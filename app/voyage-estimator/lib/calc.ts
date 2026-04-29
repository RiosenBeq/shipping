import { VESSEL_DEFAULTS, VesselClass } from "./data";

export type Inputs = {
  vesselClass: VesselClass;
  speed: number;
  consumption: number;
  distance: number;
  portDays: number;
  cargo: number;
  ws: number;
  flat: number;
  demurrage: number;
  hsfo: number;
  vlsfo: number;
  portCosts: number;
  canalFees: number;
  etsCost: number;
};

export type Results = {
  seaDays: number;
  totalDays: number;
  burnLaden: number;
  burnPort: number;
  totalBurn: number;
  freight: number;
  demRev: number;
  totalRev: number;
  cBunkLaden: number;
  cBunkPort: number;
  cBrok: number;
  totalCosts: number;
  pl: number;
  tce: number;
  co2: number;
  brokerage: number;
};

export function computeResults(i: Inputs): Results {
  const brokerage = VESSEL_DEFAULTS[i.vesselClass]?.brokerage ?? 0.0125;

  const seaDays = i.distance / (i.speed * 24);
  const totalDays = seaDays + i.portDays + 0.5; // +contingency

  const burnLaden = i.consumption * seaDays;
  const burnPort = 5 * i.portDays; // 5 mt/d auxiliary
  const totalBurn = burnLaden + burnPort;

  const freight = (i.ws / 100) * i.flat * i.cargo;
  const demRev = i.demurrage * 0.5; // 0.5d expected demurrage
  const totalRev = freight + demRev;

  const cBunkLaden = burnLaden * i.vlsfo;
  const cBunkPort = burnPort * i.vlsfo;
  const cBrok = freight * brokerage;
  const totalCosts = cBunkLaden + cBunkPort + i.portCosts + i.canalFees + i.etsCost + cBrok;

  const pl = totalRev - totalCosts;
  const tce = pl / totalDays;

  const co2 = totalBurn * 3.114;

  return {
    seaDays,
    totalDays,
    burnLaden,
    burnPort,
    totalBurn,
    freight,
    demRev,
    totalRev,
    cBunkLaden,
    cBunkPort,
    cBrok,
    totalCosts,
    pl,
    tce,
    co2,
    brokerage,
  };
}

export type SensitivityCell = {
  tce: number;
  cls: "heat-low" | "heat-mid" | "heat-high";
};

export type SensitivityRow = {
  vlsfo: number;
  delta: number;
  isCenter: boolean;
  cells: SensitivityCell[];
};

export const WS_LEVELS = [56, 62, 68, 74, 80] as const;
const BUNKER_DELTAS = [-90, -45, 0, 45, 90] as const;

export function buildSensitivity(i: Inputs): SensitivityRow[] {
  const seaDays = i.distance / (i.speed * 24);
  const totalDays = seaDays + i.portDays + 0.5;
  const burnLaden = i.consumption * seaDays;
  const burnPort = 5 * i.portDays;
  const brokerage = VESSEL_DEFAULTS[i.vesselClass]?.brokerage ?? 0.0125;

  return BUNKER_DELTAS.map((delta) => {
    const vlsfo = i.vlsfo + delta;
    const cells: SensitivityCell[] = WS_LEVELS.map((ws) => {
      const freight = (ws / 100) * i.flat * i.cargo;
      const demRev = i.demurrage * 0.5;
      const totalRev = freight + demRev;
      const cBunk = (burnLaden + burnPort) * vlsfo;
      const cBrok = freight * brokerage;
      const totalCosts = cBunk + i.portCosts + i.canalFees + i.etsCost + cBrok;
      const tce = (totalRev - totalCosts) / totalDays;
      const cls: SensitivityCell["cls"] =
        tce > 35000 ? "heat-high" : tce < 15000 ? "heat-low" : "heat-mid";
      return { tce, cls };
    });
    return { vlsfo, delta, isCenter: delta === 0, cells };
  });
}

export const fmt = (n: number, d = 0) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: d, minimumFractionDigits: d }).format(n);
