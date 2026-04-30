export type VesselClass = "aframax" | "suezmax" | "vlcc" | "lr2" | "mr";

export const VESSEL_LABELS: Record<VesselClass, string> = {
  aframax: "Aframax — 105,000 dwt",
  suezmax: "Suezmax — 158,000 dwt",
  vlcc: "VLCC — 300,000 dwt",
  lr2: "LR2 — 115,000 dwt (clean)",
  mr: "MR — 50,000 dwt (clean)",
};

export const VESSEL_DEFAULTS: Record<
  VesselClass,
  { cargo: number; cons: number; brokerage: number }
> = {
  aframax: { cargo: 80000, cons: 32, brokerage: 0.0125 },
  suezmax: { cargo: 135000, cons: 42, brokerage: 0.0125 },
  vlcc: { cargo: 280000, cons: 75, brokerage: 0.0125 },
  lr2: { cargo: 90000, cons: 36, brokerage: 0.0125 },
  mr: { cargo: 38000, cons: 24, brokerage: 0.0125 },
};

export type RouteKey =
  | "bsea-med"
  | "med-ukc"
  | "ag-china"
  | "ag-ukc"
  | "wafr-uscg"
  | "caribs-fareast";

export type RouteData = {
  label: string;
  nm: number;
  load: string;
  disch: string;
  canal: number;
  ets: number;
  loadXY: [number, number];
  dischXY: [number, number];
  via?: string;
};

export const ROUTE_DATA: Record<RouteKey, RouteData> = {
  "bsea-med": {
    label: "Black Sea — Mediterranean",
    nm: 2400,
    load: "Novorossiysk",
    disch: "Augusta",
    canal: 28500,
    ets: 0,
    loadXY: [825, 205],
    dischXY: [755, 260],
    via: "Bosphorus · Dardanelles",
  },
  "med-ukc": {
    label: "Mediterranean — UKC",
    nm: 2800,
    load: "Augusta",
    disch: "Rotterdam",
    canal: 0,
    ets: 140000,
    loadXY: [755, 260],
    dischXY: [745, 180],
    via: "Gibraltar",
  },
  "ag-china": {
    label: "Arabian Gulf — China",
    nm: 6300,
    load: "Ras Tanura",
    disch: "Ningbo",
    canal: 0,
    ets: 0,
    loadXY: [850, 305],
    dischXY: [1290, 365],
    via: "Strait of Malacca",
  },
  "ag-ukc": {
    label: "Arabian Gulf — UKC (via Suez)",
    nm: 11200,
    load: "Ras Tanura",
    disch: "Rotterdam",
    canal: 525000,
    ets: 280000,
    loadXY: [850, 305],
    dischXY: [745, 180],
    via: "Hormuz · Suez",
  },
  "wafr-uscg": {
    label: "West Africa — USGC",
    nm: 6800,
    load: "Bonny",
    disch: "Houston",
    canal: 0,
    ets: 0,
    loadXY: [750, 420],
    dischXY: [200, 340],
  },
  "caribs-fareast": {
    label: "Caribs — Far East",
    nm: 9400,
    load: "Pointe-à-Pierre",
    disch: "Singapore",
    canal: 485000,
    ets: 0,
    loadXY: [260, 360],
    dischXY: [1180, 420],
    via: "Panama · Malacca",
  },
};

export type DistanceRow = {
  load: string;
  disch: string;
  nm: number;
  title: string;
  detail: string;
  steaming: string;
  canal: string;
  burn: string;
};

export const DISTANCE_ROWS: DistanceRow[] = [
  {
    load: "Ras Tanura",
    disch: "Ningbo",
    nm: 6300,
    title: "Arabian Gulf — China",
    detail: "Ras Tanura → Ningbo",
    steaming: "21.0 d",
    canal: "Hormuz · Malacca",
    burn: "882 mt",
  },
  {
    load: "Ras Tanura",
    disch: "Rotterdam",
    nm: 11200,
    title: "Arabian Gulf — UKC",
    detail: "Ras Tanura → Rotterdam · via Suez",
    steaming: "37.3 d",
    canal: "Hormuz · Suez",
    burn: "1,568 mt",
  },
  {
    load: "Ras Tanura",
    disch: "Houston",
    nm: 11800,
    title: "Arabian Gulf — USGC",
    detail: "Ras Tanura → Houston · via Cape",
    steaming: "39.3 d",
    canal: "Hormuz · Cape",
    burn: "1,652 mt",
  },
  {
    load: "Bonny",
    disch: "Houston",
    nm: 6800,
    title: "West Africa — USGC",
    detail: "Bonny → Houston",
    steaming: "22.7 d",
    canal: "—",
    burn: "952 mt",
  },
  {
    load: "Bonny",
    disch: "Ningbo",
    nm: 9800,
    title: "West Africa — China",
    detail: "Bonny → Ningbo · via Cape",
    steaming: "32.7 d",
    canal: "Cape · Malacca",
    burn: "1,372 mt",
  },
  {
    load: "Novorossiysk",
    disch: "Augusta",
    nm: 2400,
    title: "Black Sea — Med",
    detail: "Novorossiysk → Augusta · via Bosphorus",
    steaming: "8.0 d",
    canal: "Bosphorus · Dardanelles",
    burn: "336 mt",
  },
  {
    load: "Pointe-à-Pierre",
    disch: "Singapore",
    nm: 9400,
    title: "Caribs — Far East",
    detail: "Pointe-à-Pierre → Singapore · via Panama",
    steaming: "31.3 d",
    canal: "Panama · Malacca",
    burn: "1,316 mt",
  },
  {
    load: "Sikka",
    disch: "Yokohama",
    nm: 6200,
    title: "India — Japan",
    detail: "Sikka → Yokohama",
    steaming: "20.7 d",
    canal: "Malacca",
    burn: "868 mt",
  },
  {
    load: "Mongstad",
    disch: "Houston",
    nm: 4800,
    title: "North Sea — USGC",
    detail: "Mongstad → Houston",
    steaming: "16.0 d",
    canal: "—",
    burn: "672 mt",
  },
  {
    load: "Primorsk",
    disch: "Ningbo",
    nm: 11600,
    title: "Baltic — China",
    detail: "Primorsk → Ningbo · via Suez",
    steaming: "38.7 d",
    canal: "Suez · Malacca",
    burn: "1,624 mt",
  },
];

export type TariffRow = {
  port: string;
  country: string;
  dues: number;
  pilotage: number;
  towage: number;
  total: number;
};

export const TARIFF_ROWS: TariffRow[] = [
  {
    port: "Ras Tanura",
    country: "Saudi Arabia",
    dues: 28400,
    pilotage: 14200,
    towage: 9800,
    total: 62400,
  },
  { port: "Ningbo", country: "China", dues: 42800, pilotage: 18600, towage: 14200, total: 92500 },
  {
    port: "Rotterdam",
    country: "Netherlands",
    dues: 38200,
    pilotage: 22400,
    towage: 16800,
    total: 96200,
  },
  {
    port: "Houston (LOOP)",
    country: "USA",
    dues: 32600,
    pilotage: 19800,
    towage: 15400,
    total: 84800,
  },
  {
    port: "Singapore",
    country: "Singapore",
    dues: 36400,
    pilotage: 16200,
    towage: 12800,
    total: 78400,
  },
  { port: "Bonny", country: "Nigeria", dues: 44800, pilotage: 21400, towage: 18200, total: 104200 },
  { port: "Augusta", country: "Italy", dues: 26200, pilotage: 14800, towage: 11200, total: 62800 },
  {
    port: "Novorossiysk",
    country: "Russia",
    dues: 29400,
    pilotage: 12600,
    towage: 9400,
    total: 58200,
  },
  { port: "Yokohama", country: "Japan", dues: 38800, pilotage: 17400, towage: 13800, total: 83400 },
  {
    port: "Mongstad",
    country: "Norway",
    dues: 32400,
    pilotage: 18200,
    towage: 14600,
    total: 78200,
  },
];

export type CanalRow = {
  waterway: string;
  laden: string;
  ballast: string;
  transit: string;
};

export const CANAL_ROWS: CanalRow[] = [
  { waterway: "Suez Canal", laden: "525,000", ballast: "365,000", transit: "14–16 hr" },
  {
    waterway: "Panama Canal (Neopanamax)",
    laden: "485,000",
    ballast: "320,000",
    transit: "8–10 hr",
  },
  { waterway: "Bosphorus + Dardanelles", laden: "28,500", ballast: "28,500", transit: "10–14 hr" },
  { waterway: "Strait of Malacca", laden: "—", ballast: "—", transit: "12 hr" },
  { waterway: "Strait of Hormuz", laden: "—", ballast: "—", transit: "3 hr" },
];
