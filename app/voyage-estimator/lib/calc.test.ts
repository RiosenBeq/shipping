import { describe, expect, it } from "vitest";
import { Inputs, WS_LEVELS, buildSensitivity, computeResults, fmt } from "./calc";

const SUEZMAX_AG_CHINA: Inputs = {
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

describe("computeResults — defaults", () => {
  const r = computeResults(SUEZMAX_AG_CHINA);

  it("computes sea time as distance / (speed × 24)", () => {
    // 6300 nm / (12.5 kn × 24 h) = 21.0 days
    expect(r.seaDays).toBeCloseTo(21, 5);
  });

  it("adds port days + 0.5 day contingency to total days", () => {
    // 21 + 4 + 0.5 = 25.5
    expect(r.totalDays).toBeCloseTo(25.5, 5);
  });

  it("burns consumption × seaDays at sea + 5 mt/d × portDays in port", () => {
    expect(r.burnLaden).toBeCloseTo(42 * 21, 5);
    expect(r.burnPort).toBe(20);
    expect(r.totalBurn).toBeCloseTo(42 * 21 + 20, 5);
  });

  it("computes freight as ws/100 × flat × cargo", () => {
    // 0.68 × 15.20 × 135,000 = 1,395,360 (with FP rounding)
    expect(r.freight).toBeCloseTo(1_395_360, 0);
  });

  it("expects 0.5 day demurrage", () => {
    expect(r.demRev).toBe(19_000);
  });

  it("derives total revenue = freight + demurrage", () => {
    expect(r.totalRev).toBeCloseTo(r.freight + r.demRev, 5);
  });

  it("costs = laden + port bunker + port costs + canal + ETS + brokerage", () => {
    const expected = r.cBunkLaden + r.cBunkPort + 285_000 + 0 + 0 + r.cBrok;
    expect(r.totalCosts).toBeCloseTo(expected, 5);
  });

  it("brokerage = freight × 1.25%", () => {
    expect(r.cBrok).toBeCloseTo(r.freight * 0.0125, 5);
  });

  it("P&L = revenue − costs and TCE = P&L / total days", () => {
    expect(r.pl).toBeCloseTo(r.totalRev - r.totalCosts, 5);
    expect(r.tce).toBeCloseTo(r.pl / r.totalDays, 5);
  });

  it("CO₂ = totalBurn × 3.114", () => {
    expect(r.co2).toBeCloseTo(r.totalBurn * 3.114, 5);
  });
});

describe("computeResults — sensitivity to inputs", () => {
  it("higher WS → higher revenue and TCE", () => {
    const low = computeResults({ ...SUEZMAX_AG_CHINA, ws: 56 });
    const high = computeResults({ ...SUEZMAX_AG_CHINA, ws: 80 });
    expect(high.freight).toBeGreaterThan(low.freight);
    expect(high.tce).toBeGreaterThan(low.tce);
  });

  it("higher VLSFO → lower TCE (costs go up)", () => {
    const cheap = computeResults({ ...SUEZMAX_AG_CHINA, vlsfo: 400 });
    const dear = computeResults({ ...SUEZMAX_AG_CHINA, vlsfo: 800 });
    expect(dear.tce).toBeLessThan(cheap.tce);
  });

  it("EU ETS allowance moves the cost stack and TCE", () => {
    const noEts = computeResults({ ...SUEZMAX_AG_CHINA, etsCost: 0 });
    const withEts = computeResults({ ...SUEZMAX_AG_CHINA, etsCost: 200_000 });
    expect(withEts.totalCosts - noEts.totalCosts).toBeCloseTo(200_000, 5);
    expect(withEts.tce).toBeLessThan(noEts.tce);
  });

  it("VLCC defaults are bigger than Suezmax", () => {
    const suezmax = computeResults(SUEZMAX_AG_CHINA);
    const vlcc = computeResults({
      ...SUEZMAX_AG_CHINA,
      vesselClass: "vlcc",
      cargo: 280_000,
      consumption: 75,
    });
    expect(vlcc.freight).toBeGreaterThan(suezmax.freight);
    expect(vlcc.totalBurn).toBeGreaterThan(suezmax.totalBurn);
  });
});

describe("buildSensitivity — 5×5 grid", () => {
  const grid = buildSensitivity(SUEZMAX_AG_CHINA);

  it("returns 5 rows × 5 cells", () => {
    expect(grid).toHaveLength(5);
    grid.forEach((row) => expect(row.cells).toHaveLength(5));
  });

  it("row 3 is the centre row (delta=0, isCenter=true)", () => {
    const center = grid.find((r) => r.delta === 0);
    expect(center?.isCenter).toBe(true);
    expect(center?.vlsfo).toBe(SUEZMAX_AG_CHINA.vlsfo);
  });

  it("centre cell at WS 68 matches the live TCE for the same inputs", () => {
    const wsIdx = WS_LEVELS.indexOf(68 as 68);
    const center = grid.find((r) => r.delta === 0)!;
    const live = computeResults(SUEZMAX_AG_CHINA);
    expect(center.cells[wsIdx].tce).toBeCloseTo(live.tce, 0);
  });

  it("each row TCE is monotonically increasing in WS", () => {
    grid.forEach((row) => {
      for (let i = 1; i < row.cells.length; i++) {
        expect(row.cells[i].tce).toBeGreaterThan(row.cells[i - 1].tce);
      }
    });
  });

  it("for any fixed WS, TCE decreases as bunker delta increases", () => {
    for (let col = 0; col < WS_LEVELS.length; col++) {
      for (let i = 1; i < grid.length; i++) {
        expect(grid[i].cells[col].tce).toBeLessThan(grid[i - 1].cells[col].tce);
      }
    }
  });

  it("heat-low / heat-mid / heat-high classes match the threshold rules", () => {
    grid.forEach((row) =>
      row.cells.forEach((c) => {
        if (c.tce > 35_000) expect(c.cls).toBe("heat-high");
        else if (c.tce < 15_000) expect(c.cls).toBe("heat-low");
        else expect(c.cls).toBe("heat-mid");
      })
    );
  });
});

describe("fmt", () => {
  it("formats integers with US thousands separators", () => {
    expect(fmt(1234567)).toBe("1,234,567");
  });

  it("respects the digit count argument", () => {
    expect(fmt(1.005, 2)).toBe("1.01");
    expect(fmt(1234.5, 1)).toBe("1,234.5");
  });
});
