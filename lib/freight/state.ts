/**
 * Calculator state = the ship class + only what the user changed (overrides). Every other
 * figure comes from the reference data (content/freight.json): the class preset, the
 * distance table, the ports, the passages, the dated prices. `resolve()` merges the two
 * into the inputs of `estimate()` and tells the form what each default is.
 *
 * Overrides that belong to something follow it: a new port clears the distances, passages
 * and port-call figures that were entered for the old one; a new class clears the ship's
 * particulars and the figures that scale with size (port and passage costs, port days,
 * demurrage rate). Route, freight terms, commissions, prices and the ETS settings stay.
 */
import { estimate } from "./calc";
import {
  CALLS,
  CANAL_LIMITS,
  CLASS_SLUGS,
  LEGS,
  OTHER_PORT,
  kindOf,
  type CallKey,
  type CallMode,
  type ClassSlug,
  type EtsScope,
  type FreightBasis,
  type Fuel,
  type LegKey,
  type PortRole,
  type ShipKind,
} from "./constants";
import { routesBetween, type Route } from "./routes";
import type {
  FreightData,
  FreightPassage,
  FreightPort,
  GasCargo,
  PortFacts,
  ShipPreset,
  VoyageInput,
} from "./types";

/* ====================== Numeric fields ====================== */

type NumSpec = {
  min: number;
  max: number;
  /** Cleared when the ship class changes (ship particulars, size-scaled costs). */
  ship?: boolean;
  /** Belongs to a leg or a port call: cleared when that leg's ports / that port change. */
  leg?: LegKey;
  call?: CallKey;
};

/**
 * Every number the user can change, by its URL key (≤ 3 characters; see url.ts).
 * Bounds reject typos (a 0 too many) without second-guessing real voyages.
 */
export const NUM = {
  // ship particulars
  dw: { min: 500, max: 600_000, ship: true },
  cp: { min: 100, max: 600_000, ship: true },
  sl: { min: 1, max: 30, ship: true },
  sb: { min: 1, max: 30, ship: true },
  kl: { min: 0, max: 400, ship: true },
  kb: { min: 0, max: 400, ship: true },
  kp: { min: 0, max: 200, ship: true },
  ki: { min: 0, max: 200, ship: true },
  // legs: distance (nm) and ECA share (%)
  nb: { min: 0, max: 30_000, leg: "ballast" },
  nl: { min: 0, max: 30_000, leg: "laden" },
  nr: { min: 0, max: 30_000, leg: "ret" },
  eb: { min: 0, max: 100, leg: "ballast" },
  el: { min: 0, max: 100, leg: "laden" },
  er: { min: 0, max: 100, leg: "ret" },
  // cargo
  q: { min: 0, max: 1_000_000, ship: true },
  fl: { min: 50, max: 100 },
  // port calls: days, rate t/h, allowance hours, waiting days, port costs $
  tl: { min: 0, max: 60, ship: true, call: "load" },
  td: { min: 0, max: 60, ship: true, call: "discharge" },
  rl: { min: 0, max: 100_000, ship: true, call: "load" },
  rd: { min: 0, max: 100_000, ship: true, call: "discharge" },
  hl: { min: 0, max: 240, call: "load" },
  hd: { min: 0, max: 240, call: "discharge" },
  wl: { min: 0, max: 120, call: "load" },
  wd: { min: 0, max: 120, call: "discharge" },
  cl: { min: 0, max: 10_000_000, ship: true, call: "load" },
  cd: { min: 0, max: 10_000_000, ship: true, call: "discharge" },
  // demurrage: $/day and expected days
  dr: { min: 0, max: 1_000_000, ship: true },
  dd: { min: 0, max: 120 },
  // freight: $/t, lump sum, WS points, flat rate $/t, target TCE $/day
  fr: { min: 0, max: 10_000 },
  ls: { min: 0, max: 1_000_000_000 },
  ws: { min: 0, max: 2_000 },
  ft: { min: 0, max: 1_000 },
  tt: { min: 0, max: 1_000_000 },
  // commissions, %
  ac: { min: 0, max: 20 },
  bk: { min: 0, max: 20 },
  // bunker prices $/t
  pv: { min: 0, max: 10_000 },
  pm: { min: 0, max: 10_000 },
  ph: { min: 0, max: 10_000 },
  // weather margin %, ETS phase-in %, EUA €/t, EUR/USD, other costs $
  wm: { min: 0, max: 50 },
  ep: { min: 0, max: 100 },
  ea: { min: 0, max: 1_000 },
  fx: { min: 0.1, max: 5 },
  oc: { min: 0, max: 100_000_000 },
} as const satisfies Record<string, NumSpec>;

export type NumKey = keyof typeof NUM;
export const NUM_KEYS = Object.keys(NUM) as NumKey[];

/** A number is acceptable for a field (finite and within its bounds). */
export function inBounds(key: NumKey, value: number): boolean {
  const spec: NumSpec = NUM[key];
  return Number.isFinite(value) && value >= spec.min && value <= spec.max;
}

export const LEG_NUM: Record<LegKey, { nm: NumKey; eca: NumKey }> = {
  ballast: { nm: "nb", eca: "eb" },
  laden: { nm: "nl", eca: "el" },
  ret: { nm: "nr", eca: "er" },
};

export const CALL_NUM: Record<
  CallKey,
  { days: NumKey; rate: NumKey; extra: NumKey; waiting: NumKey; cost: NumKey }
> = {
  load: { days: "tl", rate: "rl", extra: "hl", waiting: "wl", cost: "cl" },
  discharge: { days: "td", rate: "rd", extra: "hd", waiting: "wd", cost: "cd" },
};

export const PRICE_NUM: Record<Fuel, NumKey> = { vlsfo: "pv", hsfo: "ph", mgo: "pm" };

/* ====================== State ====================== */

export type PassageOverride = { on?: boolean; cost?: number; days?: number };
/** A port typed in by hand: its name and what the ETS and fuel rules need. */
export type OtherPort = { name?: string; eu?: boolean; mgo?: boolean };

export type CalcState = {
  cls: ClassSlug;
  num: Partial<Record<NumKey, number>>;
  /** Port id, or OTHER_PORT ("x") for a port typed in by hand. */
  ports: Partial<Record<PortRole, string>>;
  others: Partial<Record<PortRole, OtherPort>>;
  /** Route alternative per leg (index into the tabled routes, shortest first). */
  alt: Partial<Record<LegKey, number>>;
  ballastOn?: boolean;
  returnOn?: boolean;
  basis?: FreightBasis;
  unit?: "t" | "cbm";
  grade?: string;
  callMode: Partial<Record<CallKey, CallMode>>;
  fuel?: Fuel;
  etsScope?: EtsScope;
  pass: Partial<Record<LegKey, Record<string, PassageOverride>>>;
};

export function emptyState(cls: ClassSlug): CalcState {
  return { cls, num: {}, ports: {}, others: {}, alt: {}, callMode: {}, pass: {} };
}

/* ====================== Resolving defaults ====================== */

export type FieldView = { value: number | undefined; def: number | undefined };

export type ResolvedPort = {
  role: PortRole;
  /** Port id or OTHER_PORT. */
  choice: string;
  port: FreightPort | null;
  facts: PortFacts;
  /** Follows the class's lane (not chosen by the user). */
  isDefault: boolean;
};

export type ResolvedPassage = {
  passage: FreightPassage;
  on: boolean;
  defOn: boolean;
  cost: number;
  defCost: number;
  days: number;
  defDays: number;
};

export type ResolvedLeg = {
  key: LegKey;
  on: boolean;
  from: ResolvedPort;
  to: ResolvedPort;
  /** Tabled routes between the two ports (empty: enter the distance). */
  routes: Route[];
  alt: number;
  route: Route | null;
  /** Both ends are the same port (no sea passage). */
  samePort: boolean;
  passages: ResolvedPassage[];
  /** Canals this ship cannot use on this leg (CANAL_LIMITS), by passage id. */
  blocked: string[];
};

export type Resolved = {
  preset: ShipPreset;
  kind: ShipKind;
  num: Record<NumKey, FieldView>;
  ports: Record<PortRole, ResolvedPort>;
  legs: Record<LegKey, ResolvedLeg>;
  basis: FreightBasis;
  unit: "t" | "cbm";
  cargo: GasCargo | null;
  callMode: Record<CallKey, CallMode>;
  fuel: Fuel;
  etsScope: EtsScope;
  /** Route choices the ship cannot sail (a canal it does not fit). */
  warnings: string[];
  input: VoyageInput;
};

/** Round to a step (money to $100, cbm to 10). */
const roundTo = (n: number, step: number) => Math.round(n / step) * step;

export function presetFor(data: FreightData, cls: ClassSlug): ShipPreset {
  return (
    data.classes.find((c) => c.slug === cls) ??
    data.classes.find((c) => c.slug === data.defaults.cls) ??
    data.classes[0]
  );
}

/** Which port each role points at: the user's choice, else the class's lane. */
export function portChoices(data: FreightData, s: CalcState): Record<PortRole, string> {
  const preset = presetFor(data, s.cls);
  const known = new Set(data.ports.map((p) => p.id));
  const pick = (role: PortRole, fallback: string) => {
    const v = s.ports[role];
    if (v === OTHER_PORT || (v && known.has(v))) return v;
    return fallback;
  };
  const first = data.ports[0]?.id ?? OTHER_PORT;
  const load = pick("load", known.has(preset.load) ? preset.load : first);
  return {
    open: pick("open", known.has(preset.open) ? preset.open : load),
    load,
    discharge: pick("discharge", known.has(preset.discharge) ? preset.discharge : first),
    // Return ballast goes back to the load port unless told otherwise.
    ret: pick("ret", load),
  };
}

function otherFacts(s: CalcState, role: PortRole): OtherPort {
  // A return to the load port inherits the load port's typed-in details.
  if (role === "ret" && s.ports.ret === undefined) return s.others.load ?? {};
  return s.others[role] ?? {};
}

export function resolve(data: FreightData, s: CalcState): Resolved {
  const preset = presetFor(data, s.cls);
  const kind = kindOf(preset.slug);
  const portById = new Map(data.ports.map((p) => [p.id, p]));
  const passageById = new Map(data.passages.map((p) => [p.id, p]));
  const choices = portChoices(data, s);

  const ports = {} as Record<PortRole, ResolvedPort>;
  for (const role of ["open", "load", "discharge", "ret"] as const) {
    const choice = choices[role];
    const port = choice === OTHER_PORT ? null : (portById.get(choice) ?? null);
    const other = otherFacts(s, role);
    ports[role] = {
      role,
      choice,
      port,
      facts: port
        ? { name: port.name, eu: port.eu, mgoAtBerth: port.mgoAtBerth }
        : {
            name: other.name?.trim() || "Other port",
            eu: Boolean(other.eu),
            mgoAtBerth: Boolean(other.mgo),
          },
      isDefault: s.ports[role] === undefined,
    };
  }

  /* ---- numbers: defaults, then the user's values ---- */
  const def: Partial<Record<NumKey, number | undefined>> = {};
  const value = (k: NumKey): number | undefined => (k in s.num ? s.num[k] : def[k]);

  def.dw = preset.dwt;
  def.cp = preset.capacity;
  def.sl = preset.speedLaden;
  def.sb = preset.speedBallast;
  def.kl = preset.consLaden;
  def.kb = preset.consBallast;
  def.kp = preset.consPort;
  def.ki = preset.consIdle;

  /* ---- legs ---- */
  const legEnds: Record<LegKey, [PortRole, PortRole]> = {
    ballast: ["open", "load"],
    laden: ["load", "discharge"],
    ret: ["discharge", "ret"],
  };
  const legs = {} as Record<LegKey, ResolvedLeg>;
  for (const key of LEGS) {
    const [a, b] = legEnds[key];
    const from = ports[a];
    const to = ports[b];
    const known = from.port !== null && to.port !== null;
    const samePort = known && from.choice === to.choice;
    const routes = known && !samePort ? routesBetween(data, from.choice, to.choice) : [];
    const blocked = CANAL_LIMITS[preset.slug]?.[key === "laden" ? "laden" : "ballast"] ?? [];
    const sailable = (i: number) => !routes[i].passages.some((p) => blocked.includes(p));
    // The default is the shortest route this ship can sail; a choice is kept as made.
    const firstSailable = routes.findIndex((_, i) => sailable(i));
    const alt =
      s.alt[key] !== undefined
        ? Math.min(Math.max(0, Math.trunc(s.alt[key]!)), Math.max(0, routes.length - 1))
        : Math.max(0, firstSailable);
    const route = routes[alt] ?? null;
    def[LEG_NUM[key].nm] = samePort ? 0 : route?.nm;
    def[LEG_NUM[key].eca] = route?.eca ?? 0;
    // The route's passages, or (a distance entered by hand) every passage, switched off.
    const ids = route ? route.passages : samePort ? [] : data.passages.map((p) => p.id);
    const overrides = s.pass[key] ?? {};
    const passages: ResolvedPassage[] = [];
    for (const id of ids) {
      const passage = passageById.get(id);
      if (!passage) continue;
      const o = overrides[id] ?? {};
      const defOn = route !== null;
      const defCost = roundTo(
        (key === "laden" ? passage.costLaden : passage.costBallast) * preset.sizeFactor,
        100
      );
      passages.push({
        passage,
        on: o.on ?? defOn,
        defOn,
        cost: o.cost ?? defCost,
        defCost,
        days: o.days ?? passage.days,
        defDays: passage.days,
      });
    }
    legs[key] = {
      key,
      on:
        key === "laden" ? true : key === "ballast" ? (s.ballastOn ?? true) : (s.returnOn ?? false),
      from,
      to,
      routes,
      alt,
      route,
      samePort,
      passages,
      blocked,
    };
  }
  const passageName = (id: string) => passageById.get(id)?.name ?? id;
  const warnings: string[] = [];
  for (const key of LEGS) {
    const leg = legs[key];
    if (!leg.on || !leg.route) continue;
    for (const id of leg.route.passages.filter((p) => leg.blocked.includes(p))) {
      warnings.push(
        `${key === "laden" ? "A laden" : "In ballast, a"} ${preset.label} cannot use the ${passageName(id)}: pick another route for the ${key === "ret" ? "return" : key} leg.`
      );
    }
  }

  /* ---- cargo ---- */
  const cargo =
    kind === "gas"
      ? (data.cargoes.find((c) => c.key === s.grade) ??
        data.cargoes.find((c) => c.key === preset.grade) ??
        data.cargoes[0] ??
        null)
      : null;
  const unit = kind === "gas" && cargo && s.unit === "cbm" ? "cbm" : "t";
  def.q = unit === "cbm" && cargo ? roundTo(preset.cargo / cargo.density, 10) : preset.cargo;
  def.fl = data.defaults.fillLimit;

  /* ---- port calls ---- */
  const callMode = {} as Record<CallKey, CallMode>;
  for (const k of CALLS) {
    const n = CALL_NUM[k];
    const port = ports[k].port;
    callMode[k] = s.callMode[k] ?? "days";
    def[n.days] = preset.portDays;
    def[n.rate] = preset.cargoRate;
    def[n.extra] = data.defaults.extraHours;
    def[n.waiting] = 0;
    def[n.cost] = port ? roundTo(port.cost * preset.sizeFactor, 100) : 0;
  }

  def.dr = preset.demurrage;
  def.dd = 0;

  /* ---- freight, commissions, prices, ETS ---- */
  const basis = s.basis ?? "rate";
  def.fr = preset.freight;
  def.ft = undefined;
  def.ac = data.defaults.addressCommission;
  def.bk = data.defaults.brokerage;
  def.pv = data.fuels.vlsfo.value;
  def.pm = data.fuels.mgo.value;
  def.ph = data.fuels.hsfo.value;
  def.wm = data.defaults.weatherMargin;
  def.ep = data.phaseIn;
  def.ea = data.eua.value;
  def.fx = data.eurUsd.value;
  def.oc = 0;

  const density = cargo?.density;
  const quantity = value("q") ?? 0;
  const quantityT = unit === "cbm" ? quantity * (density ?? 0) : quantity;
  const flat = value("ft");
  def.ls = Math.round((value("fr") ?? 0) * quantityT);
  def.ws = flat && flat > 0 ? roundTo(((value("fr") ?? 0) / flat) * 100, 0.25) : 100;

  const fuel = s.fuel ?? preset.fuel;
  const etsScope = s.etsScope ?? data.defaults.etsScope;
  const n = (k: NumKey) => value(k) ?? 0;

  const build = (b: FreightBasis, targetTce: number): VoyageInput => ({
    ship: {
      kind,
      dwt: n("dw"),
      capacity: n("cp"),
      speedLaden: n("sl"),
      speedBallast: n("sb"),
      consLaden: n("kl"),
      consBallast: n("kb"),
      consPort: n("kp"),
      consIdle: n("ki"),
      fuel,
    },
    cargo: {
      quantity,
      unit,
      density,
      gradeLabel: cargo?.label,
      fillLimit: n("fl"),
    },
    legs: Object.fromEntries(
      LEGS.map((k) => {
        const leg = legs[k];
        return [
          k,
          {
            on: leg.on,
            nm: value(LEG_NUM[k].nm),
            eca: n(LEG_NUM[k].eca),
            passages: leg.passages.map((p) => ({
              id: p.passage.id,
              name: p.passage.name,
              on: p.on,
              cost: p.cost,
              days: p.days,
            })),
            from: leg.from.facts,
            to: leg.to.facts,
          },
        ];
      })
    ) as VoyageInput["legs"],
    calls: Object.fromEntries(
      CALLS.map((k) => [
        k,
        {
          mode: callMode[k],
          days: n(CALL_NUM[k].days),
          rate: n(CALL_NUM[k].rate),
          extraHours: n(CALL_NUM[k].extra),
          waiting: n(CALL_NUM[k].waiting),
          cost: n(CALL_NUM[k].cost),
          port: ports[k].facts,
        },
      ])
    ) as VoyageInput["calls"],
    demurrage: { rate: n("dr"), days: n("dd") },
    freight: {
      basis: b,
      rate: n("fr"),
      lump: n("ls"),
      ws: n("ws"),
      flat,
      targetTce,
    },
    commissions: { address: n("ac"), brokerage: n("bk") },
    prices: { vlsfo: n("pv"), hsfo: n("ph"), mgo: n("pm") },
    weatherMargin: n("wm"),
    ets: { scope: etsScope, phaseIn: n("ep"), euaEur: n("ea"), eurUsd: n("fx") },
    otherCosts: n("oc"),
  });

  // Reverse mode starts from the TCE the $/t freight earns, so switching modes changes nothing.
  const atRate = estimate(build("rate", 0));
  def.tt = atRate.money.tce !== null ? Math.max(0, roundTo(atRate.money.tce, 100)) : 0;
  const input = build(basis, n("tt"));

  const num = {} as Record<NumKey, FieldView>;
  for (const k of Object.keys(NUM) as NumKey[]) num[k] = { value: value(k), def: def[k] };

  return {
    preset,
    kind,
    num,
    ports,
    legs,
    basis,
    unit,
    cargo,
    callMode,
    fuel,
    etsScope,
    warnings,
    input,
  };
}

/* ====================== Changes ====================== */

const without = <T extends object>(obj: T, keys: (keyof T)[]): T => {
  const out = { ...obj };
  for (const k of keys) delete out[k];
  return out;
};

/** Clear what belonged to legs and port calls whose ports moved between two states. */
function clearMoved(data: FreightData, before: CalcState, after: CalcState): CalcState {
  const a = portChoices(data, before);
  const b = portChoices(data, after);
  const moved = (r: PortRole) => a[r] !== b[r];
  const legMoved: Record<LegKey, boolean> = {
    ballast: moved("open") || moved("load"),
    laden: moved("load") || moved("discharge"),
    ret: moved("discharge") || moved("ret"),
  };
  const callMoved: Record<CallKey, boolean> = {
    load: moved("load"),
    discharge: moved("discharge"),
  };
  const drop = NUM_KEYS.filter((k) => {
    const spec: NumSpec = NUM[k];
    return (spec.leg && legMoved[spec.leg]) || (spec.call && callMoved[spec.call]);
  });
  const legs = LEGS.filter((k) => legMoved[k]);
  return {
    ...after,
    num: without(after.num, drop),
    alt: without(after.alt, legs),
    pass: without(after.pass, legs),
  };
}

export function setNum(s: CalcState, key: NumKey, v: number | undefined): CalcState {
  if (v === undefined) return { ...s, num: without(s.num, [key]) };
  if (!inBounds(key, v)) return s;
  return { ...s, num: { ...s.num, [key]: v } };
}

export function setClass(data: FreightData, s: CalcState, cls: ClassSlug): CalcState {
  if (!(CLASS_SLUGS as readonly string[]).includes(cls) || cls === s.cls) return s;
  const shipKeys = NUM_KEYS.filter((k) => (NUM[k] as NumSpec).ship);
  const pass: CalcState["pass"] = {};
  for (const k of LEGS) {
    const o = s.pass[k];
    if (!o) continue;
    pass[k] = Object.fromEntries(
      Object.entries(o).map(([id, p]) => [id, without(p, ["cost"])])
    ) as Record<string, PassageOverride>;
  }
  const next: CalcState = {
    ...s,
    cls,
    num: without(s.num, shipKeys),
    grade: undefined,
    unit: undefined,
    fuel: undefined,
    pass,
  };
  return clearMoved(data, s, next);
}

export function setPort(
  data: FreightData,
  s: CalcState,
  role: PortRole,
  choice: string
): CalcState {
  const next: CalcState = { ...s, ports: { ...s.ports, [role]: choice } };
  return clearMoved(data, s, next);
}

/**
 * Name and flags of a port typed in by hand (the figures entered for it stay). Kept
 * canonical — no empty name, flags only when set — so a link reads back to the same state.
 */
export function setOther(s: CalcState, role: PortRole, patch: OtherPort): CalcState {
  const merged = { ...s.others[role], ...patch };
  const clean: OtherPort = {};
  if (merged.name?.trim()) clean.name = merged.name;
  if (merged.eu) clean.eu = true;
  if (merged.mgo) clean.mgo = true;
  const others = { ...s.others };
  if (Object.keys(clean).length) others[role] = clean;
  else delete others[role];
  return { ...s, others };
}

export function setAlt(s: CalcState, leg: LegKey, alt: number): CalcState {
  const n = LEG_NUM[leg];
  return {
    ...s,
    alt: { ...s.alt, [leg]: alt },
    num: without(s.num, [n.nm, n.eca]),
    pass: without(s.pass, [leg]),
  };
}

export function setPassage(
  s: CalcState,
  leg: LegKey,
  id: string,
  patch: PassageOverride
): CalcState {
  const legPass = { ...s.pass[leg] };
  const merged = { ...legPass[id], ...patch };
  for (const k of Object.keys(merged) as (keyof PassageOverride)[]) {
    if (merged[k] === undefined) delete merged[k];
  }
  if (Object.keys(merged).length) legPass[id] = merged;
  else delete legPass[id];
  return { ...s, pass: { ...s.pass, [leg]: legPass } };
}

/**
 * Switch the cargo unit and carry the quantity across (t ↔ cbm at the grade's density), so
 * the switch changes how the cargo is entered, not the cargo.
 */
export function setUnit(r: Resolved, s: CalcState, unit: "t" | "cbm"): CalcState {
  if (unit === r.unit || !r.cargo) return { ...s, unit };
  const q = r.num.q.value;
  const next: CalcState = { ...s, unit };
  if (q === undefined || !(q > 0)) return { ...next, num: without(s.num, ["q"]) };
  const converted = unit === "cbm" ? q / r.cargo.density : q * r.cargo.density;
  return { ...next, num: { ...s.num, q: Math.round(converted) } };
}

/**
 * Switch the freight basis and carry the freight across (the same gross freight in the new
 * terms), like a broker re-quoting the same number.
 */
export function setBasis(
  r: Resolved,
  s: CalcState,
  basis: FreightBasis,
  current: { gross: number; quantityT: number; tce: number | null }
): CalcState {
  if (basis === r.basis) return s;
  const num = { ...s.num };
  const { gross, quantityT, tce } = current;
  const flat = r.num.ft.value;
  if (basis === "rate" && quantityT > 0) num.fr = Math.round((gross / quantityT) * 100) / 100;
  if (basis === "lump") num.ls = Math.round(gross);
  if (basis === "ws" && quantityT > 0 && flat && flat > 0)
    num.ws = Math.round((gross / quantityT / flat) * 100 * 4) / 4;
  if (basis === "tce" && tce !== null) num.tt = Math.max(0, Math.round(tce / 100) * 100);
  for (const k of ["fr", "ls", "ws", "tt"] as const) {
    if (num[k] !== undefined && !inBounds(k, num[k]!)) delete num[k];
  }
  return { ...s, basis, num };
}
