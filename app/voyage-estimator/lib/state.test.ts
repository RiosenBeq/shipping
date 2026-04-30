import { describe, expect, it } from "vitest";
import { decodeState, encodeState, type EstimatorState } from "./state";

const DEFAULTS: EstimatorState = {
  inputs: {
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
  },
  route: "ag-china",
  charter: "voyage",
};

describe("encodeState / decodeState", () => {
  it("round-trips the default state", () => {
    const qs = encodeState(DEFAULTS);
    const back = decodeState(qs, DEFAULTS);
    expect(back).toEqual(DEFAULTS);
  });

  it("round-trips a customised state", () => {
    const custom: EstimatorState = {
      ...DEFAULTS,
      inputs: { ...DEFAULTS.inputs, ws: 92, vlsfo: 720, etsCost: 180_000 },
      route: "ag-ukc",
      charter: "tc",
    };
    const qs = encodeState(custom);
    const back = decodeState(qs, DEFAULTS);
    expect(back).toEqual(custom);
  });

  it("falls back to defaults when an unknown vessel/route/charter is given", () => {
    const back = decodeState("v=foo&r=bar&c=baz", DEFAULTS);
    expect(back.inputs.vesselClass).toBe(DEFAULTS.inputs.vesselClass);
    expect(back.route).toBe(DEFAULTS.route);
    expect(back.charter).toBe(DEFAULTS.charter);
  });

  it("ignores non-finite numeric values and keeps defaults for them", () => {
    const back = decodeState("ws=abc&vl=NaN", DEFAULTS);
    expect(back.inputs.ws).toBe(DEFAULTS.inputs.ws);
    expect(back.inputs.vlsfo).toBe(DEFAULTS.inputs.vlsfo);
  });

  it("uses short keys (no key longer than 3 chars in the query string)", () => {
    const qs = encodeState(DEFAULTS);
    for (const [key] of new URLSearchParams(qs)) {
      expect(key.length).toBeLessThanOrEqual(3);
    }
  });
});
