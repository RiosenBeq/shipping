/**
 * The voyage estimate: pure functions, no I/O (tested in calc.test.ts).
 *
 *   sea days (leg)   = nm ÷ (speed × 24) × (1 + weather margin)
 *   port days (call) = days as entered, or quantity ÷ rate (t/h) ÷ 24 + allowance hours ÷ 24
 *   idle days        = waiting at each port + passage delays + expected demurrage (at discharge)
 *   fuel             = consumption of each mode × its days; MGO for the ECA share at sea and
 *                      at berths that require 0.10% S, the main fuel elsewhere
 *   CO₂              = fuel × emission factor (VLSFO 3.151, HSFO 3.114, MGO 3.206 t/t)
 *   EU ETS           = CO₂ × EU share × phase-in × EUA (€) × EUR/USD
 *   net revenue      = (gross freight + demurrage) × (1 − address commission − brokerage)
 *   voyage result    = net revenue − bunkers − port costs − passages − ETS − other costs
 *   TCE              = voyage result ÷ total days
 *   breakeven        = the freight at which TCE = 0;  reverse mode: the freight for a target TCE
 */
import { CO2_FACTOR, FUELS, SENSITIVITY_STEPS, type Fuel, type LegKey } from "./constants";
import type {
  CallInput,
  FuelTonnes,
  LegInput,
  PortFacts,
  SensitivityGrid,
  VoyageInput,
  VoyagePart,
  VoyageResult,
} from "./types";

const zero = (): FuelTonnes => ({ vlsfo: 0, hsfo: 0, mgo: 0 });

const co2Of = (f: FuelTonnes) => FUELS.reduce((s, k) => s + f[k] * CO2_FACTOR[k], 0);

/** EU ETS share of a voyage between two ports: 100% inside the EU, 50% in or out, else 0. */
export function euShare(from: PortFacts, to: PortFacts): number {
  if (from.eu && to.eu) return 1;
  if (from.eu || to.eu) return 0.5;
  return 0;
}

/**
 * Fuel burnt at sea (and while delayed on a leg) split between the main fuel and MGO:
 * a VLSFO ship burns MGO for the ECA share; an HSFO ship with a scrubber stays on HSFO
 * (the scrubber is the ECA compliance); an MGO ship burns MGO throughout.
 */
function splitSea(tonnes: number, ecaShare: number, main: Fuel): FuelTonnes {
  const f = zero();
  if (main === "vlsfo") {
    f.mgo += tonnes * ecaShare;
    f.vlsfo += tonnes * (1 - ecaShare);
  } else {
    f[main] += tonnes;
  }
  return f;
}

/** Port fuel: MGO where 0.10% S is required at berth, the main fuel elsewhere. */
function splitPort(tonnes: number, port: PortFacts, main: Fuel): FuelTonnes {
  const f = zero();
  f[port.mgoAtBerth ? "mgo" : main] += tonnes;
  return f;
}

/** Working days of a port call. */
export function callWorkingDays(call: CallInput, quantityT: number): number {
  if (call.mode === "rate") {
    if (!(call.rate > 0)) return call.extraHours / 24;
    return quantityT / call.rate / 24 + call.extraHours / 24;
  }
  return call.days;
}

/** Sea days of a leg at a given speed and weather margin (%). */
export function seaDays(nm: number, speedKn: number, weatherMargin: number): number {
  if (!(nm > 0) || !(speedKn > 0)) return 0;
  return (nm / (speedKn * 24)) * (1 + weatherMargin / 100);
}

const LEG_NAMES: Record<LegKey, string> = {
  ballast: "ballast distance (open position → load port)",
  laden: "laden distance (load → discharge port)",
  ret: "return ballast distance",
};

/** Turn the cargo quantity into tonnes (cbm × density for gas carriers). */
export function quantityInTonnes(cargo: VoyageInput["cargo"]): number {
  if (cargo.unit === "t") return cargo.quantity;
  return cargo.density ? cargo.quantity * cargo.density : 0;
}

export function estimate(input: VoyageInput): VoyageResult {
  const issues: string[] = [];
  const warnings: string[] = [];
  const { ship, cargo, legs, calls } = input;
  const wm = input.weatherMargin;

  /* ---- what is missing ---- */
  if (!(cargo.quantity > 0)) issues.push("Enter the cargo quantity.");
  if (cargo.unit === "cbm" && !cargo.density)
    issues.push("Pick the cargo grade to convert cbm to tonnes.");
  for (const k of ["ballast", "laden", "ret"] as const) {
    const leg = legs[k];
    if ((k === "laden" || leg.on) && leg.nm === undefined)
      issues.push(`Enter the ${LEG_NAMES[k]}.`);
  }
  if (!(ship.speedLaden > 0) || !(ship.speedBallast > 0))
    issues.push("Speeds must be more than 0 knots.");
  for (const k of ["load", "discharge"] as const) {
    if (calls[k].mode === "rate" && !(calls[k].rate > 0))
      issues.push(`Enter the ${k === "load" ? "loading" : "discharge"} rate (t/h).`);
  }
  const { basis, flat } = input.freight;
  if (basis === "ws" && !(flat !== undefined && flat > 0))
    issues.push(
      "Enter the Worldscale flat rate for this route ($/t) — it comes from your Worldscale schedule."
    );
  const c = (input.commissions.address + input.commissions.brokerage) / 100;
  if (!(c < 1)) issues.push("Commissions must add up to less than 100%.");
  const keep = c < 1 ? 1 - c : 1;

  /* ---- cargo and intake ---- */
  const quantityT = quantityInTonnes(cargo);
  let cbmNeeded: number | null = null;
  if (ship.kind === "gas" && cargo.density && quantityT > 0) {
    cbmNeeded = quantityT / cargo.density / (cargo.fillLimit / 100);
    if (cbmNeeded > ship.capacity) {
      warnings.push(
        `This cargo needs about ${Math.round(cbmNeeded).toLocaleString("en-US")} cbm at ${cargo.fillLimit}% filling; the ship has ${ship.capacity.toLocaleString("en-US")} cbm. Reduce the quantity or pick a larger ship.`
      );
    }
  }
  if (ship.kind === "tanker" && quantityT > ship.capacity) {
    warnings.push(
      `${Math.round(quantityT).toLocaleString("en-US")} t is more than this ship’s cargo capacity of ${ship.capacity.toLocaleString("en-US")} t. Check the intake: draft, bunkers and constants count against the deadweight.`
    );
  }
  if (quantityT > ship.dwt) {
    warnings.push(
      `${Math.round(quantityT).toLocaleString("en-US")} t is more than the ship’s deadweight (${ship.dwt.toLocaleString("en-US")} t).`
    );
  }

  /* ---- legs ---- */
  const parts: VoyagePart[] = [];
  const passageLines: VoyageResult["money"]["costs"]["passageLines"] = [];
  const legDays: Record<LegKey, number> = { ballast: 0, laden: 0, ret: 0 };
  let passageDaysTotal = 0;
  const etsScoped = (share: number) =>
    input.ets.scope === "auto" ? share : Number(input.ets.scope) / 100;

  for (const k of ["ballast", "laden", "ret"] as const) {
    const leg: LegInput = legs[k];
    if (k !== "laden" && !leg.on) continue;
    const speed = k === "laden" ? ship.speedLaden : ship.speedBallast;
    const cons = k === "laden" ? ship.consLaden : ship.consBallast;
    const sea = seaDays(leg.nm ?? 0, speed, wm);
    const on = leg.passages.filter((p) => p.on);
    const delay = on.reduce((s, p) => s + p.days, 0);
    for (const p of on) passageLines.push({ id: p.id, name: p.name, leg: k, cost: p.cost });
    const eca = Math.min(1, Math.max(0, leg.eca / 100));
    const fuel = splitSea(sea * cons + delay * ship.consIdle, eca, ship.fuel);
    legDays[k] = sea;
    passageDaysTotal += delay;
    parts.push({
      key: k,
      days: sea + delay,
      activeDays: sea,
      idleDays: delay,
      fuel,
      co2: co2Of(fuel),
      etsShare: etsScoped(euShare(leg.from, leg.to)),
    });
  }

  /* ---- port calls ---- */
  const demDays = Math.max(0, input.demurrage.days);
  let portDays = 0;
  let waitingDays = 0;
  for (const k of ["load", "discharge"] as const) {
    const call = calls[k];
    const working = callWorkingDays(call, quantityT);
    const idle = call.waiting + (k === "discharge" ? demDays : 0);
    portDays += working;
    waitingDays += call.waiting;
    const fuel = splitPort(working * ship.consPort + idle * ship.consIdle, call.port, ship.fuel);
    parts.push({
      key: k,
      days: working + idle,
      activeDays: working,
      idleDays: idle,
      fuel,
      co2: co2Of(fuel),
      etsShare: etsScoped(call.port.eu ? 1 : 0),
    });
  }

  const sea = legDays.ballast + legDays.laden + legDays.ret;
  const total = sea + portDays + waitingDays + passageDaysTotal + demDays;

  /* ---- fuel, CO₂ and the EU ETS ---- */
  const tonnes = zero();
  for (const p of parts) for (const f of FUELS) tonnes[f] += p.fuel[f];
  const cost = { vlsfo: 0, hsfo: 0, mgo: 0 } as Record<Fuel, number>;
  for (const f of FUELS) cost[f] = tonnes[f] * input.prices[f];
  const bunkers = FUELS.reduce((s, f) => s + cost[f], 0);
  const co2Total = parts.reduce((s, p) => s + p.co2, 0);
  const inScope = parts.reduce((s, p) => s + p.co2 * p.etsShare, 0);
  const surrendered = inScope * (input.ets.phaseIn / 100);
  const euaUsd = input.ets.euaEur * input.ets.eurUsd;
  const etsCost = surrendered * euaUsd;

  /* ---- money ---- */
  const passages = passageLines.reduce((s, p) => s + p.cost, 0);
  const portLoad = calls.load.cost;
  const portDischarge = calls.discharge.cost;
  const other = input.otherCosts;
  const voyageCosts = bunkers + portLoad + portDischarge + passages + etsCost + other;
  const D = input.demurrage.rate * demDays;

  const F =
    basis === "lump"
      ? input.freight.lump
      : basis === "ws"
        ? (input.freight.ws / 100) * (flat ?? 0) * quantityT
        : basis === "tce"
          ? (input.freight.targetTce * total + voyageCosts) / keep - D
          : input.freight.rate * quantityT;

  const gross = F + D;
  const addressCommission = (gross * input.commissions.address) / 100;
  const brokerage = (gross * input.commissions.brokerage) / 100;
  const netRevenue = gross * keep;
  const result = netRevenue - voyageCosts;
  const perTonne = quantityT > 0 ? F / quantityT : null;
  const wsOf = (perT: number | null) =>
    perT !== null && flat !== undefined && flat > 0 ? (perT / flat) * 100 : null;
  const breakevenLump = voyageCosts / keep - D;
  const breakevenPerT = quantityT > 0 ? breakevenLump / quantityT : null;

  return {
    complete: issues.length === 0,
    issues,
    warnings,
    quantityT,
    cbmNeeded,
    days: {
      ballast: legDays.ballast,
      laden: legDays.laden,
      ret: legDays.ret,
      sea,
      port: portDays,
      waiting: waitingDays,
      passages: passageDaysTotal,
      demurrage: demDays,
      total,
    },
    parts,
    fuel: { tonnes, total: FUELS.reduce((s, f) => s + tonnes[f], 0), cost, totalCost: bunkers },
    co2: { total: co2Total, inScope, surrendered, euaUsd, etsCost },
    money: {
      grossFreight: F,
      demurrage: D,
      grossRevenue: gross,
      addressCommission,
      brokerage,
      netFreight: F * keep,
      netRevenue,
      costs: {
        bunkers,
        portLoad,
        portDischarge,
        passages,
        passageLines,
        ets: etsCost,
        other,
        total: voyageCosts,
      },
      result,
      tce: total > 0 ? result / total : null,
      perTonne,
      ws: wsOf(perTonne),
    },
    breakeven: { lump: breakevenLump, perTonne: breakevenPerT, ws: wsOf(breakevenPerT) },
  };
}

/**
 * TCE for freight ±10/20% (columns) × all bunker prices ±10/20% (rows). In reverse mode the
 * base freight is the required freight, so the centre cell is the target TCE. Time, EU ETS,
 * port and passage costs stay as they are.
 */
export function sensitivity(
  input: VoyageInput,
  r: VoyageResult,
  steps: readonly number[] = SENSITIVITY_STEPS
): SensitivityGrid {
  const keep = 1 - (input.commissions.address + input.commissions.brokerage) / 100;
  const days = r.days.total;
  const otherCosts = r.money.costs.total - r.money.costs.bunkers;
  const tce = steps.map((b) =>
    steps.map((f) => {
      if (!(days > 0)) return null;
      const revenue = (r.money.grossFreight * (1 + f) + r.money.demurrage) * keep;
      return (revenue - r.money.costs.bunkers * (1 + b) - otherCosts) / days;
    })
  );
  return { freight: steps.map((f) => 1 + f), bunker: steps.map((b) => 1 + b), tce };
}
