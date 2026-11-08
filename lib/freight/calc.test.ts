import { describe, expect, it } from "vitest";
import { callWorkingDays, estimate, euShare, seaDays, sensitivity } from "./calc";
import type { VoyageInput } from "./types";

const NON_EU = { name: "Open", eu: false, mgoAtBerth: false };
const LOAD = { name: "Load", eu: false, mgoAtBerth: false };
const EU_DISCH = { name: "Discharge", eu: true, mgoAtBerth: true };

/**
 * A voyage worked by hand (every figure below is checked in the tests):
 *
 *  ballast 1,800 nm at 15 kn, +5% weather  = 1800 / 360 × 1.05      =  5.25 d
 *  laden   2,880 nm at 12 kn, +5% weather  = 2880 / 288 × 1.05      = 10.50 d
 *  Straits delay on the laden leg                                   =  1.00 d
 *  load: 2 d working + 1 d waiting                                  =  3.00 d
 *  discharge: 80,000 t ÷ 4,000 t/h ÷ 24 + 12 h ÷ 24 = 0.8333 + 0.5   =  1.3333 d
 *  expected demurrage 0.5 d (at discharge)                          =  0.50 d
 *  total                                                            = 21.5833 d
 *
 *  fuel  ballast 5.25 × 24 = 126 VLSFO
 *        laden (10.5 × 30 + 1 × 5) = 320, 50% ECA → 160 VLSFO + 160 MGO
 *        load (2 × 20 + 1 × 5) = 45 VLSFO; discharge (1.3333 × 20 + 0.5 × 5) = 29.1667 MGO (0.10% at berth)
 *        VLSFO 331 t × $600 = 198,600; MGO 189.1667 t × $800 = 151,333.33; bunkers 349,933.33
 *  CO₂   126 × 3.151 + 160 × 3.151 + 160 × 3.206 + 45 × 3.151 + 29.1667 × 3.206 = 1,649.4493 t
 *  ETS   laden 50% (into the EU) × 1,017.12 + discharge berth 100% × 93.5083 = 602.0683 t
 *        × 100% phase-in × (€80 × 1.10 = $88) = 52,982.01
 *  money freight 15 × 80,000 = 1,200,000; demurrage 40,000 × 0.5 = 20,000; gross 1,220,000
 *        commissions 2.5% + 1.25% = 45,750; net revenue 1,174,250
 *        costs 349,933.33 + 50,000 + 60,000 + 100,000 + 52,982.01 + 10,000 = 622,915.34
 *        result 551,334.66; TCE 551,334.66 / 21.5833 = 25,544.47 $/day
 *        breakeven 622,915.34 / 0.9625 − 20,000 = 627,184.77 → 7.8398 $/t
 */
function handVoyage(): VoyageInput {
  return {
    ship: {
      kind: "tanker",
      dwt: 115_000,
      capacity: 100_000,
      speedLaden: 12,
      speedBallast: 15,
      consLaden: 30,
      consBallast: 24,
      consPort: 20,
      consIdle: 5,
      fuel: "vlsfo",
    },
    cargo: { quantity: 80_000, unit: "t", fillLimit: 98 },
    legs: {
      ballast: { on: true, nm: 1_800, eca: 0, passages: [], from: NON_EU, to: LOAD },
      laden: {
        on: true,
        nm: 2_880,
        eca: 50,
        passages: [{ id: "straits", name: "Straits", on: true, cost: 100_000, days: 1 }],
        from: LOAD,
        to: EU_DISCH,
      },
      ret: { on: false, nm: 999, eca: 0, passages: [], from: EU_DISCH, to: LOAD },
    },
    calls: {
      load: { mode: "days", days: 2, rate: 0, extraHours: 0, waiting: 1, cost: 50_000, port: LOAD },
      discharge: {
        mode: "rate",
        days: 99,
        rate: 4_000,
        extraHours: 12,
        waiting: 0,
        cost: 60_000,
        port: EU_DISCH,
      },
    },
    demurrage: { rate: 40_000, days: 0.5 },
    freight: { basis: "rate", rate: 15, lump: 0, ws: 0, flat: undefined, targetTce: 0 },
    commissions: { address: 2.5, brokerage: 1.25 },
    prices: { vlsfo: 600, hsfo: 450, mgo: 800 },
    weatherMargin: 5,
    ets: { scope: "auto", phaseIn: 100, euaEur: 80, eurUsd: 1.1 },
    otherCosts: 10_000,
  };
}

describe("estimate — a voyage worked by hand", () => {
  const r = estimate(handVoyage());

  it("is complete, with no warnings", () => {
    expect(r.complete).toBe(true);
    expect(r.issues).toEqual([]);
    expect(r.warnings).toEqual([]);
  });

  it("splits the time: sea days with the weather margin, port, waiting, passages, demurrage", () => {
    expect(r.days.ballast).toBeCloseTo(5.25, 10);
    expect(r.days.laden).toBeCloseTo(10.5, 10);
    expect(r.days.ret).toBe(0);
    expect(r.days.sea).toBeCloseTo(15.75, 10);
    expect(r.days.port).toBeCloseTo(2 + 20 / 24 + 0.5, 10);
    expect(r.days.waiting).toBe(1);
    expect(r.days.passages).toBe(1);
    expect(r.days.demurrage).toBe(0.5);
    expect(r.days.total).toBeCloseTo(21.583333, 5);
  });

  it("burns VLSFO outside the ECA and MGO inside it and at a 0.10% S berth", () => {
    expect(r.fuel.tonnes.vlsfo).toBeCloseTo(331, 6);
    expect(r.fuel.tonnes.mgo).toBeCloseTo(189.166667, 5);
    expect(r.fuel.tonnes.hsfo).toBe(0);
    expect(r.fuel.cost.vlsfo).toBeCloseTo(198_600, 4);
    expect(r.fuel.cost.mgo).toBeCloseTo(151_333.33, 1);
    expect(r.fuel.totalCost).toBeCloseTo(349_933.33, 1);
  });

  it("counts CO₂ with the emission factors and the EU share of each part", () => {
    expect(r.co2.total).toBeCloseTo(1_649.4493, 3);
    expect(r.co2.inScope).toBeCloseTo(602.0683, 3);
    expect(r.co2.surrendered).toBeCloseTo(602.0683, 3);
    expect(r.co2.euaUsd).toBeCloseTo(88, 10);
    expect(r.co2.etsCost).toBeCloseTo(52_982.01, 1);
  });

  it("takes commissions on freight and demurrage, then every voyage cost", () => {
    const m = r.money;
    expect(m.grossFreight).toBe(1_200_000);
    expect(m.demurrage).toBe(20_000);
    expect(m.grossRevenue).toBe(1_220_000);
    expect(m.addressCommission).toBeCloseTo(30_500, 6);
    expect(m.brokerage).toBeCloseTo(15_250, 6);
    expect(m.netFreight).toBeCloseTo(1_155_000, 6);
    expect(m.netRevenue).toBeCloseTo(1_174_250, 6);
    expect(m.costs.bunkers).toBeCloseTo(349_933.33, 1);
    expect(m.costs.portLoad).toBe(50_000);
    expect(m.costs.portDischarge).toBe(60_000);
    expect(m.costs.passages).toBe(100_000);
    expect(m.costs.passageLines).toEqual([
      { id: "straits", name: "Straits", leg: "laden", cost: 100_000 },
    ]);
    expect(m.costs.other).toBe(10_000);
    expect(m.costs.total).toBeCloseTo(622_915.34, 1);
    expect(m.result).toBeCloseTo(551_334.66, 1);
    expect(m.tce).toBeCloseTo(25_544.47, 1);
    expect(m.perTonne).toBe(15);
    expect(m.ws).toBeNull();
  });

  it("gives the breakeven freight (TCE = 0) in $ and $/t", () => {
    expect(r.breakeven.lump).toBeCloseTo(627_184.77, 1);
    expect(r.breakeven.perTonne).toBeCloseTo(7.83981, 4);
    expect(r.breakeven.ws).toBeNull();
    const at = estimate({
      ...handVoyage(),
      freight: { ...handVoyage().freight, rate: r.breakeven.perTonne! },
    });
    expect(at.money.tce).toBeCloseTo(0, 6);
  });
});

describe("estimate — freight terms", () => {
  it("Worldscale: points × the flat rate you enter, per tonne", () => {
    const v = handVoyage();
    // WS 125 on a $12.00 flat is $15.00/t: the same voyage as the hand case.
    const r = estimate({ ...v, freight: { ...v.freight, basis: "ws", ws: 125, flat: 12 } });
    expect(r.money.grossFreight).toBeCloseTo(1_200_000, 6);
    expect(r.money.ws).toBeCloseTo(125, 10);
    expect(r.money.tce).toBeCloseTo(25_544.47, 1);
    // Breakeven 7.8398 $/t on a 12.00 flat = WS 65.33.
    expect(r.breakeven.ws).toBeCloseTo(65.3318, 3);
  });

  it("Worldscale without a flat rate asks for one (we ship no flat-rate table)", () => {
    const v = handVoyage();
    const r = estimate({ ...v, freight: { ...v.freight, basis: "ws", ws: 125, flat: undefined } });
    expect(r.complete).toBe(false);
    expect(r.issues.join(" ")).toMatch(/flat rate/);
  });

  it("lump sum", () => {
    const v = handVoyage();
    const r = estimate({ ...v, freight: { ...v.freight, basis: "lump", lump: 1_000_000 } });
    expect(r.money.grossFreight).toBe(1_000_000);
    expect(r.money.perTonne).toBeCloseTo(12.5, 10);
  });

  it("reverse mode finds the freight for a target TCE, and that freight earns it", () => {
    const v = handVoyage();
    const r = estimate({ ...v, freight: { ...v.freight, basis: "tce", targetTce: 30_000 } });
    // (30,000 × 21.5833 + 622,915.34) / 0.9625 − 20,000 = 1,299,912.04
    expect(r.money.grossFreight).toBeCloseTo(1_299_912.04, 1);
    expect(r.money.tce).toBeCloseTo(30_000, 6);
    const back = estimate({
      ...v,
      freight: { ...v.freight, basis: "rate", rate: r.money.perTonne! },
    });
    expect(back.money.tce).toBeCloseTo(30_000, 6);
  });
});

describe("estimate — rules", () => {
  it("weather margin stretches sea time only", () => {
    expect(seaDays(2_880, 12, 0)).toBe(10);
    expect(seaDays(2_880, 12, 10)).toBeCloseTo(11, 10);
    expect(seaDays(0, 12, 10)).toBe(0);
    const v = handVoyage();
    const calm = estimate({ ...v, weatherMargin: 0 });
    const rough = estimate({ ...v, weatherMargin: 10 });
    expect(rough.days.port).toBe(calm.days.port);
    expect(rough.days.sea).toBeCloseTo(calm.days.sea * 1.1, 10);
  });

  it("port time from the cargo rate: quantity ÷ rate + allowance hours", () => {
    const call = handVoyage().calls.discharge;
    expect(callWorkingDays(call, 80_000)).toBeCloseTo(20 / 24 + 0.5, 12);
    expect(callWorkingDays({ ...call, mode: "days", days: 2.5 }, 80_000)).toBe(2.5);
  });

  it("EU share: 100% between EU ports, 50% in or out, 0 outside", () => {
    expect(euShare(EU_DISCH, EU_DISCH)).toBe(1);
    expect(euShare(NON_EU, EU_DISCH)).toBe(0.5);
    expect(euShare(EU_DISCH, NON_EU)).toBe(0.5);
    expect(euShare(NON_EU, LOAD)).toBe(0);
  });

  it("a fixed ETS scope applies to every part, times the phase-in", () => {
    const v = handVoyage();
    const all = estimate({ ...v, ets: { ...v.ets, scope: "100", phaseIn: 70 } });
    expect(all.co2.inScope).toBeCloseTo(all.co2.total, 10);
    expect(all.co2.etsCost).toBeCloseTo(all.co2.total * 0.7 * 88, 6);
    const none = estimate({ ...v, ets: { ...v.ets, scope: "0" } });
    expect(none.co2.etsCost).toBe(0);
  });

  it("a scrubber ship stays on HSFO in the ECA; an MGO ship burns MGO throughout", () => {
    const v = handVoyage();
    const hs = estimate({ ...v, ship: { ...v.ship, fuel: "hsfo" } });
    expect(hs.fuel.tonnes.vlsfo).toBe(0);
    // Only the 0.10% S berth burns MGO.
    expect(hs.fuel.tonnes.mgo).toBeCloseTo(29.166667, 5);
    expect(hs.fuel.tonnes.hsfo).toBeCloseTo(331 + 160, 6);
    const go = estimate({ ...v, ship: { ...v.ship, fuel: "mgo" } });
    expect(go.fuel.tonnes.mgo).toBeCloseTo(520.166667, 5);
  });

  it("legs switch on and off; the return ballast adds its days and fuel", () => {
    const v = handVoyage();
    const noBallast = estimate({
      ...v,
      legs: { ...v.legs, ballast: { ...v.legs.ballast, on: false } },
    });
    expect(noBallast.days.ballast).toBe(0);
    expect(noBallast.days.total).toBeCloseTo(21.583333 - 5.25, 5);
    const withReturn = estimate({
      ...v,
      legs: { ...v.legs, ret: { ...v.legs.ret, on: true, nm: 1_800 } },
    });
    expect(withReturn.days.ret).toBeCloseTo(5.25, 10);
    expect(withReturn.fuel.tonnes.vlsfo).toBeCloseTo(331 + 126, 6);
  });

  it("switched-off passages cost nothing and add no days", () => {
    const v = handVoyage();
    const r = estimate({
      ...v,
      legs: {
        ...v.legs,
        laden: { ...v.legs.laden, passages: [{ ...v.legs.laden.passages[0], on: false }] },
      },
    });
    expect(r.money.costs.passages).toBe(0);
    expect(r.days.passages).toBe(0);
  });

  it("says what is missing instead of inventing it", () => {
    const v = handVoyage();
    const r = estimate({
      ...v,
      legs: { ...v.legs, laden: { ...v.legs.laden, nm: undefined } },
      cargo: { ...v.cargo, quantity: 0 },
      commissions: { address: 60, brokerage: 40 },
    });
    expect(r.complete).toBe(false);
    expect(r.issues).toEqual([
      "Enter the cargo quantity.",
      "Enter the laden distance (load → discharge port).",
      "Commissions must add up to less than 100%.",
    ]);
  });
});

describe("estimate — gas carriers in cbm", () => {
  const vlgc = (quantity: number): VoyageInput => {
    const v = handVoyage();
    return {
      ...v,
      ship: { ...v.ship, kind: "gas", dwt: 55_000, capacity: 84_000 },
      cargo: { quantity, unit: "cbm", density: 0.582, gradeLabel: "Propane", fillLimit: 98 },
    };
  };

  it("converts cbm to tonnes at the grade's density", () => {
    const r = estimate(vlgc(80_000));
    expect(r.quantityT).toBeCloseTo(46_560, 6);
    // 46,560 t ÷ 0.582 ÷ 98% = 81,632.65 cbm of tank: fits in 84,000.
    expect(r.cbmNeeded).toBeCloseTo(81_632.653, 2);
    expect(r.warnings).toEqual([]);
    expect(r.money.grossFreight).toBeCloseTo(46_560 * 15, 6);
  });

  it("warns when the cargo needs more tank than the ship has at the filling limit", () => {
    const r = estimate(vlgc(83_000));
    expect(r.cbmNeeded).toBeCloseTo(84_693.878, 2);
    expect(r.warnings[0]).toMatch(/84,694 cbm at 98% filling; the ship has 84,000 cbm/);
    // A warning, not a blocker: the estimate still stands.
    expect(r.complete).toBe(true);
  });

  it("warns when a tanker's cargo is above its capacity or deadweight", () => {
    const v = handVoyage();
    const r = estimate({ ...v, cargo: { ...v.cargo, quantity: 120_000 } });
    expect(r.warnings).toHaveLength(2);
    expect(r.warnings[0]).toMatch(/more than this ship’s cargo capacity of 100,000 t/);
    expect(r.warnings[1]).toMatch(/more than the ship’s deadweight \(115,000 t\)/);
  });
});

describe("sensitivity — freight ±10/20% × bunkers ±10/20%", () => {
  const v = handVoyage();
  const r = estimate(v);
  const g = sensitivity(v, r);

  it("is a 5 × 5 grid whose centre is the estimate", () => {
    expect(g.freight).toEqual([0.8, 0.9, 1, 1.1, 1.2]);
    expect(g.bunker).toEqual([0.8, 0.9, 1, 1.1, 1.2]);
    expect(g.tce).toHaveLength(5);
    for (const row of g.tce) expect(row).toHaveLength(5);
    expect(g.tce[2][2]).toBeCloseTo(r.money.tce!, 6);
  });

  it("matches a hand-worked corner: freight +20%, bunkers −20%", () => {
    // ((1.2 × 1,200,000 + 20,000) × 0.9625 − (0.8 × 349,933.33 + 272,982.01)) / 21.5833
    const expected =
      ((1.2 * 1_200_000 + 20_000) * 0.9625 - (0.8 * 349_933.333 + 272_982.01)) / 21.583333;
    expect(g.tce[0][4]).toBeCloseTo(expected, 0);
  });

  it("rises with freight and falls with bunker prices", () => {
    for (let b = 0; b < 5; b++)
      for (let f = 1; f < 5; f++) expect(g.tce[b][f]!).toBeGreaterThan(g.tce[b][f - 1]!);
    for (let f = 0; f < 5; f++)
      for (let b = 1; b < 5; b++) expect(g.tce[b][f]!).toBeLessThan(g.tce[b - 1][f]!);
  });

  it("in reverse mode the centre is the target TCE", () => {
    const rv = { ...v, freight: { ...v.freight, basis: "tce" as const, targetTce: 30_000 } };
    expect(sensitivity(rv, estimate(rv)).tce[2][2]).toBeCloseTo(30_000, 6);
  });
});
