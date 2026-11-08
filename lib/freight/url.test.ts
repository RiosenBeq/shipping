import { describe, expect, it } from "vitest";
import { FREIGHT_DATA as data } from "@/lib/content/freight";
import {
  NUM_KEYS,
  emptyState,
  resolve,
  setNum,
  setOther,
  setPassage,
  setPort,
  type CalcState,
} from "./state";
import { STATE_VERSION, decodeState, encodeState } from "./url";

/** A calculation that touches every kind of field. */
function busy(): CalcState {
  let s = emptyState("suezmax");
  s = setPort(data, s, "open", "aliaga");
  s = setPort(data, s, "load", "novorossiysk");
  s = setPort(data, s, "discharge", "x");
  s = setOther(s, "discharge", { name: "Skikda (Algeria)", eu: false, mgo: true });
  s = setNum(s, "nl", 1_420);
  s = setNum(s, "el", 72.5);
  s = setNum(s, "q", 130_000);
  s = setNum(s, "pv", 610.5);
  s = setNum(s, "ws", 112.5);
  s = setNum(s, "ft", 9.87);
  s = setPassage(s, "ballast", "turkish-straits", { on: false });
  s = setPassage(s, "laden", "suez", { on: true, cost: 300_000, days: 1.5 });
  return {
    ...s,
    returnOn: true,
    ballastOn: false,
    alt: { laden: 1 },
    basis: "ws",
    callMode: { discharge: "rate" },
    fuel: "hsfo",
    etsScope: "50",
  };
}

describe("URL state", () => {
  it("round-trips a calculation exactly", () => {
    const s = busy();
    const qs = encodeState(s);
    const back = decodeState(qs, data);
    expect(back.versionMismatch).toBe(false);
    expect(back.ignored).toEqual([]);
    expect(back.state).toEqual(s);
  });

  it("is compact: version first, short keys, only what differs from the defaults", () => {
    const qs = encodeState(emptyState("aframax"));
    expect(qs).toBe(`v=${STATE_VERSION}&c=aframax`);
    for (const [k] of new URLSearchParams(encodeState(busy())))
      expect(k.length).toBeLessThanOrEqual(3);
    expect(NUM_KEYS.every((k) => k.length <= 3)).toBe(true);
    expect(encodeState(busy()).length).toBeLessThan(260);
  });

  it("is readable: ports by id, the other port inline, passages as id:on:cost:days", () => {
    const qs = encodeState(busy());
    expect(qs).toContain("l=novorossiysk");
    expect(qs).toContain("d=x:Skikda%20(Algeria):m");
    expect(qs).toContain("xl=suez:1:300000:1.5");
    expect(qs).toContain("xb=turkish-straits:0");
  });

  it("can pin the reference prices in a shared link", () => {
    const s = emptyState("mr");
    const pinned = encodeState(s, { pinPrices: resolve(data, s) });
    const back = decodeState(pinned, data).state;
    expect(back.num.pv).toBe(data.fuels.vlsfo.value);
    expect(back.num.pm).toBe(data.fuels.mgo.value);
    expect(back.num.ph).toBe(data.fuels.hsfo.value);
    expect(back.num.ea).toBe(data.eua.value);
    expect(back.num.fx).toBe(data.eurUsd.value);
    // A price the user typed is kept as typed.
    const typed = encodeState(setNum(s, "pv", 700), { pinPrices: resolve(data, s) });
    expect(decodeState(typed, data).state.num.pv).toBe(700);
  });

  it("reads the class guides' ?class= link", () => {
    expect(decodeState("?class=vlgc", data).state).toEqual(emptyState("vlgc"));
  });

  it("ignores what it cannot read and keeps the defaults for it", () => {
    const d = decodeState(
      "v=1&c=nope&l=atlantis&sl=99&ac=-1&ib=x&f=z&g=kerosene&q=abc&xl=fake:1",
      data
    );
    expect(d.state).toEqual(emptyState(data.defaults.cls));
    expect(d.ignored.sort()).toEqual(["ac", "c", "f", "g", "ib", "l", "q", "sl"].sort());
  });

  it("flags a link from another version", () => {
    expect(decodeState("v=9&c=mr", data).versionMismatch).toBe(true);
    expect(decodeState("c=mr", data).versionMismatch).toBe(false);
  });
});
