import type {
  CallKey,
  CallMode,
  ClassSlug,
  EtsScope,
  FreightBasis,
  Fuel,
  LegKey,
  PortRegion,
  ShipKind,
} from "./constants";

/* ====================== Reference data (content/freight.json, as the page uses it) ====================== */

/** A dated reference value: what it is and the day it was last checked. */
export type Dated = { value: number; asOf: string };

export type ShipPreset = {
  slug: ClassSlug;
  label: string;
  kind: ShipKind;
  dwt: number;
  /** Cargo capacity: tonnes for tankers, cbm for gas carriers. */
  capacity: number;
  /** Length overall, m: under 200 m the Turkish Straits' daylight-only rule does not apply. */
  loa: number;
  /** Gross tonnage: under 5,000 GT a ship is outside the EU ETS. */
  gt: number;
  speedLaden: number;
  speedBallast: number;
  /** t/day at sea laden, at sea in ballast, in port working cargo, idle (waiting, at anchor). */
  consLaden: number;
  consBallast: number;
  consPort: number;
  consIdle: number;
  fuel: Fuel;
  /** Port and passage costs are entered for an Aframax-size ship; this scales them. */
  sizeFactor: number;
  /** Default port days per call, and the cargo rate (t/h) for the rate mode. */
  portDays: number;
  cargoRate: number;
  /** Example demurrage rate, $/day. */
  demurrage: number;
  /** Default cargo, tonnes. */
  cargo: number;
  /** Gas cargo key (content/lpg-cargoes.json) for gas carriers. */
  grade?: string;
  /** Example freight, $/t. */
  freight: number;
  /** The class's typical lane: open position, load port, discharge port. */
  open: string;
  load: string;
  discharge: string;
};

export type FreightPort = {
  id: string;
  name: string;
  /** ISO 3166-1 alpha-2. */
  country: string;
  region: PortRegion;
  lat: number;
  lon: number;
  /** In the EU/EEA (EU ETS: 50% of voyages in or out, 100% between EU ports and at berth). */
  eu: boolean;
  /** 0.10% S fuel required at berth (ECA ports, EU ports, Türkiye): port fuel is MGO. */
  mgoAtBerth: boolean;
  /** Port costs (DA) for an Aframax-size call, USD. */
  cost: number;
  note?: string;
};

export type FreightPassage = {
  id: string;
  name: string;
  /** Aframax-size costs, USD (scaled by the class's size factor). */
  costLaden: number;
  costBallast: number;
  /** Expected waiting and transit delay, days. */
  days: number;
  /** The same for ships under 200 m LOA, where size matters (the Turkish Straits). */
  daysSmall?: number;
  note?: string;
};

export type FreightDistance = {
  from: string;
  to: string;
  nm: number;
  via?: string;
  /** Passage ids in the order sailed from `from` to `to`. */
  passages: string[];
  /** Share of the distance inside SOx Emission Control Areas, %. */
  eca: number;
};

export type GasCargo = {
  key: string;
  label: string;
  /** t/m³ at atmospheric boiling point (refrigerated carriage). */
  density: number;
  /** t/m³ at 15 °C (fully pressurised carriage). */
  densityAmbient?: number;
};

export type FreightData = {
  /** Shown to visitors next to the reference prices, e.g. "Example values, not live market prices." */
  notice: string;
  /** A reference price older than this is flagged as possibly stale. */
  staleAfterDays: number;
  fuels: Record<Fuel, Dated>;
  eua: Dated;
  eurUsd: Dated;
  /** Share of the year's emissions surrendered (100% from 2026). */
  phaseIn: number;
  defaults: {
    cls: ClassSlug;
    weatherMargin: number;
    addressCommission: number;
    brokerage: number;
    extraHours: number;
    fillLimit: number;
    /** Fully pressurised ships (cargo at ambient temperature), %. */
    fillLimitPressurised: number;
    etsScope: EtsScope;
  };
  classes: ShipPreset[];
  ports: FreightPort[];
  passages: FreightPassage[];
  distances: FreightDistance[];
  /** Gas cargo densities (content/lpg-cargoes.json), t/m³. */
  cargoes: GasCargo[];
};

/* ====================== One calculation, fully resolved ====================== */

/** What the ETS and fuel rules need to know about a port. */
export type PortFacts = { name: string; eu: boolean; mgoAtBerth: boolean };

export type PassageInput = { id: string; name: string; on: boolean; cost: number; days: number };

export type LegInput = {
  on: boolean;
  /** Distance, nm; undefined when it still has to be entered. */
  nm: number | undefined;
  /** Share of the leg inside ECAs, %. */
  eca: number;
  passages: PassageInput[];
  from: PortFacts;
  to: PortFacts;
};

export type CallInput = {
  mode: CallMode;
  days: number;
  /** t/h and allowance hours for the rate mode. */
  rate: number;
  extraHours: number;
  waiting: number;
  cost: number;
  port: PortFacts;
};

export type VoyageInput = {
  ship: {
    kind: ShipKind;
    dwt: number;
    capacity: number;
    speedLaden: number;
    speedBallast: number;
    consLaden: number;
    consBallast: number;
    consPort: number;
    consIdle: number;
    fuel: Fuel;
  };
  cargo: {
    quantity: number;
    unit: "t" | "cbm";
    /** t/m³ (gas carriers); converts cbm to tonnes and checks the tank capacity. */
    density?: number;
    gradeLabel?: string;
    /** Filling limit for gas carriers, %. */
    fillLimit: number;
  };
  legs: Record<LegKey, LegInput>;
  calls: Record<CallKey, CallInput>;
  demurrage: { rate: number; days: number };
  freight: {
    basis: FreightBasis;
    /** $/t */
    rate: number;
    lump: number;
    ws: number;
    /** Worldscale flat rate, $/t, entered by the user (never shipped). */
    flat: number | undefined;
    /** Reverse mode: the TCE the freight has to earn, $/day. */
    targetTce: number;
  };
  commissions: { address: number; brokerage: number };
  prices: Record<Fuel, number>;
  /** % added to sea time for weather and routing. */
  weatherMargin: number;
  ets: { scope: EtsScope; phaseIn: number; euaEur: number; eurUsd: number };
  otherCosts: number;
};

export type FuelTonnes = Record<Fuel, number>;

/** Where the time, the fuel and the emissions of the voyage go. */
export type VoyagePart = {
  key: LegKey | CallKey;
  days: number;
  /** Days at sea (legs) or working cargo (calls). */
  activeDays: number;
  /** Waiting, passage delay or demurrage days. */
  idleDays: number;
  fuel: FuelTonnes;
  co2: number;
  /** Share of this part's CO₂ inside the EU ETS (before the phase-in). */
  etsShare: number;
};

export type VoyageResult = {
  /** Every input needed is present and valid. */
  complete: boolean;
  /** What is missing or invalid (blocks the result). */
  issues: string[];
  /** Plausibility warnings (intake, capacity); the result still stands. */
  warnings: string[];
  quantityT: number;
  /** Gas carriers: tank volume the cargo needs at the filling limit, cbm. */
  cbmNeeded: number | null;
  days: {
    ballast: number;
    laden: number;
    ret: number;
    sea: number;
    port: number;
    waiting: number;
    passages: number;
    demurrage: number;
    total: number;
  };
  parts: VoyagePart[];
  fuel: { tonnes: FuelTonnes; total: number; cost: Record<Fuel, number>; totalCost: number };
  co2: { total: number; inScope: number; surrendered: number; euaUsd: number; etsCost: number };
  money: {
    grossFreight: number;
    demurrage: number;
    grossRevenue: number;
    addressCommission: number;
    brokerage: number;
    netFreight: number;
    netRevenue: number;
    costs: {
      bunkers: number;
      portLoad: number;
      portDischarge: number;
      passages: number;
      passageLines: { id: string; name: string; leg: LegKey; cost: number }[];
      ets: number;
      other: number;
      total: number;
    };
    result: number;
    tce: number | null;
    /** Freight per tonne and in Worldscale points (when a flat rate is given). */
    perTonne: number | null;
    ws: number | null;
  };
  breakeven: { lump: number; perTonne: number | null; ws: number | null };
};

export type SensitivityGrid = {
  /** Multipliers on the freight (columns) and on all bunker prices (rows). */
  freight: readonly number[];
  bunker: readonly number[];
  /** TCE $/day, rows = bunker, columns = freight; null when the voyage has no duration. */
  tce: (number | null)[][];
};
