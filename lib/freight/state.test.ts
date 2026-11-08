import { describe, expect, it } from "vitest";
import { FREIGHT_DATA as data } from "@/lib/content/freight";
import { estimate } from "./calc";
import {
  emptyState,
  resolve,
  setAlt,
  setBasis,
  setClass,
  setNum,
  setOther,
  setPassage,
  setPort,
  setUnit,
} from "./state";

const preset = (slug: string) => data.classes.find((c) => c.slug === slug)!;

describe("resolve — defaults from the reference data", () => {
  const s = emptyState("aframax");
  const r = resolve(data, s);

  it("opens on the class's lane with its particulars", () => {
    const p = preset("aframax");
    expect(r.ports.open.choice).toBe(p.open);
    expect(r.ports.load.choice).toBe(p.load);
    expect(r.ports.discharge.choice).toBe(p.discharge);
    expect(r.ports.ret.choice).toBe(p.load); // return ballast: back to the load port
    expect(r.num.sl.value).toBe(p.speedLaden);
    expect(r.num.q.value).toBe(p.cargo);
    expect(r.num.fr.value).toBe(p.freight);
    expect(r.input.ship.fuel).toBe(p.fuel);
  });

  it("takes distances, ECA share and passages from the table, both ways", () => {
    const laden = r.legs.laden;
    expect(laden.route).not.toBeNull();
    expect(r.num.nl.def).toBe(laden.route!.nm);
    expect(r.num.el.def).toBe(laden.route!.eca);
    // CPC → Trieste runs through the Turkish Straits.
    expect(laden.passages.map((p) => p.passage.id)).toEqual(["turkish-straits"]);
    expect(laden.passages[0].on).toBe(true);
  });

  it("scales port and passage costs by the class's size factor (to $100)", () => {
    const load = data.ports.find((p) => p.id === preset("aframax").load)!;
    expect(r.num.cl.def).toBe(Math.round((load.cost * 1) / 100) * 100);
    const vlcc = resolve(data, emptyState("vlcc"));
    const rt = data.ports.find((p) => p.id === "ras-tanura")!;
    expect(vlcc.num.cl.def).toBe(Math.round((rt.cost * preset("vlcc").sizeFactor) / 100) * 100);
    const ts = data.passages.find((p) => p.id === "turkish-straits")!;
    expect(r.legs.laden.passages[0].defCost).toBe(Math.round(ts.costLaden / 100) * 100);
  });

  it("uses the dated reference prices and admin defaults", () => {
    expect(r.num.pv.value).toBe(data.fuels.vlsfo.value);
    expect(r.num.pm.value).toBe(data.fuels.mgo.value);
    expect(r.num.ph.value).toBe(data.fuels.hsfo.value);
    expect(r.num.ea.value).toBe(data.eua.value);
    expect(r.num.fx.value).toBe(data.eurUsd.value);
    expect(r.num.ac.value).toBe(data.defaults.addressCommission);
    expect(r.num.wm.value).toBe(data.defaults.weatherMargin);
    expect(r.etsScope).toBe(data.defaults.etsScope);
  });

  it("gives every class a complete estimate on its own lane", () => {
    for (const c of data.classes) {
      const e = estimate(resolve(data, emptyState(c.slug)).input);
      expect(e.issues, c.slug).toEqual([]);
      expect(e.warnings, c.slug).toEqual([]);
      expect(e.money.tce, c.slug).toBeGreaterThan(0);
    }
  });

  it("starts reverse mode from the TCE the $/t freight earns", () => {
    const e = estimate(r.input);
    expect(r.num.tt.def).toBe(Math.round(e.money.tce! / 100) * 100);
  });
});

describe("changes keep what belongs together", () => {
  it("a new load port clears what was entered for the old legs and call", () => {
    let s = emptyState("aframax");
    s = setNum(s, "nl", 1234);
    s = setNum(s, "nb", 555);
    s = setNum(s, "cl", 12_345);
    s = setNum(s, "cd", 54_321);
    s = setPassage(s, "laden", "turkish-straits", { on: false });
    s = setPort(data, s, "load", "novorossiysk");
    expect(s.num.nl).toBeUndefined();
    expect(s.num.nb).toBeUndefined();
    expect(s.num.cl).toBeUndefined();
    expect(s.pass.laden).toBeUndefined();
    // The discharge call did not move.
    expect(s.num.cd).toBe(54_321);
  });

  it("a new class clears ship particulars and size-scaled costs, keeps the voyage terms", () => {
    let s = emptyState("aframax");
    s = setPort(data, s, "open", "aliaga");
    s = setPort(data, s, "load", "ceyhan");
    s = setNum(s, "sl", 12);
    s = setNum(s, "cl", 99_000);
    s = setNum(s, "fr", 21.5);
    s = setNum(s, "pv", 600);
    s = setPassage(s, "ballast", "turkish-straits", { on: false, cost: 1 });
    s = setClass(data, s, "suezmax");
    expect(s.cls).toBe("suezmax");
    expect(s.num.sl).toBeUndefined();
    expect(s.num.cl).toBeUndefined();
    expect(s.num.fr).toBe(21.5);
    expect(s.num.pv).toBe(600);
    expect(s.ports.load).toBe("ceyhan");
    expect(s.pass.ballast?.["turkish-straits"]).toEqual({ on: false });
  });

  it("ports the user did not choose follow the new class's lane", () => {
    let s = emptyState("aframax");
    s = setNum(s, "nl", 1500);
    s = setClass(data, s, "vlcc");
    const r = resolve(data, s);
    expect(r.ports.load.choice).toBe(preset("vlcc").load);
    expect(s.num.nl).toBeUndefined();
  });

  it("rejects numbers outside a field's bounds", () => {
    const s = emptyState("mr");
    expect(setNum(s, "sl", 0).num.sl).toBeUndefined();
    expect(setNum(s, "ac", 25).num.ac).toBeUndefined();
    expect(setNum(s, "ac", 5).num.ac).toBe(5);
    expect(setNum(setNum(s, "ac", 5), "ac", undefined).num.ac).toBeUndefined();
  });

  it("route alternatives: the Cape instead of Suez", () => {
    let s = emptyState("suezmax");
    s = setPort(data, s, "load", "ras-tanura");
    s = setPort(data, s, "discharge", "rotterdam");
    const viaSuez = resolve(data, s).legs.laden;
    expect(viaSuez.routes.length).toBeGreaterThan(1);
    expect(viaSuez.route!.passages).toContain("suez");
    s = setAlt(s, "laden", 1);
    const viaCape = resolve(data, s).legs.laden;
    expect(viaCape.route!.via).toMatch(/Cape of Good Hope/);
    expect(viaCape.route!.nm).toBeGreaterThan(viaSuez.route!.nm);
    // Reversed lookups read in the direction of travel.
    expect(viaSuez.route!.passages[0]).toBe("hormuz");
  });

  it("canal limits: a laden VLCC goes round the Cape, and a Suez choice is flagged", () => {
    let s = emptyState("vlcc");
    s = setPort(data, s, "load", "ras-tanura");
    s = setPort(data, s, "discharge", "rotterdam");
    let r = resolve(data, s);
    expect(r.legs.laden.blocked).toEqual(["suez", "panama"]);
    expect(r.legs.laden.route!.via).toMatch(/Cape of Good Hope/);
    expect(r.warnings).toEqual([]);
    const suez = r.legs.laden.routes.findIndex((x) => x.passages.includes("suez"));
    s = setAlt(s, "laden", suez);
    r = resolve(data, s);
    expect(r.legs.laden.route!.passages).toContain("suez");
    expect(r.warnings).toEqual([
      "A laden VLCC cannot use the Suez Canal: pick another route for the laden leg.",
    ]);
    // Houston → Ningbo: no Panama for a VLCC in ballast either.
    let h = emptyState("vlcc");
    h = setPort(data, h, "open", "ningbo");
    h = setPort(data, h, "load", "houston");
    h = setPort(data, h, "discharge", "ningbo");
    const rh = resolve(data, h);
    expect(rh.legs.ballast.route!.passages).not.toContain("panama");
    expect(rh.legs.laden.route!.via).toMatch(/Cape of Good Hope/);
  });

  it("a port typed by hand needs its distance, and its flags drive the rules", () => {
    let s = emptyState("mr");
    s = setPort(data, s, "discharge", "x");
    s = setOther(s, "discharge", { name: "Skikda", eu: false, mgo: true });
    let r = resolve(data, s);
    expect(r.legs.laden.route).toBeNull();
    expect(r.num.nl.value).toBeUndefined();
    expect(r.ports.discharge.facts).toEqual({ name: "Skikda", eu: false, mgoAtBerth: true });
    expect(estimate(r.input).issues[0]).toMatch(/laden distance/);
    // Every passage is offered, switched off.
    expect(r.legs.laden.passages.every((p) => !p.on)).toBe(true);
    s = setNum(s, "nl", 640);
    r = resolve(data, s);
    expect(estimate(r.input).complete).toBe(true);
  });

  it("the same open and load port means no ballast leg", () => {
    let s = emptyState("aframax");
    s = setPort(data, s, "open", preset("aframax").load);
    const r = resolve(data, s);
    expect(r.legs.ballast.samePort).toBe(true);
    expect(r.num.nb.value).toBe(0);
    expect(estimate(r.input).days.ballast).toBe(0);
  });

  it("switching to cbm carries the cargo across at the grade's density", () => {
    const s = emptyState("vlgc");
    const r = resolve(data, s);
    const next = setUnit(r, s, "cbm");
    const density = r.cargo!.density;
    expect(next.unit).toBe("cbm");
    expect(next.num.q).toBe(Math.round(preset("vlgc").cargo / density));
    const r2 = resolve(data, next);
    expect(estimate(r2.input).quantityT).toBeCloseTo(preset("vlgc").cargo, -1);
  });

  it("switching the freight basis re-quotes the same freight", () => {
    const s = emptyState("aframax");
    const r = resolve(data, s);
    const e = estimate(r.input);
    const current = { gross: e.money.grossFreight, quantityT: e.quantityT, tce: e.money.tce };
    const lump = setBasis(r, s, "lump", current);
    expect(estimate(resolve(data, lump).input).money.grossFreight).toBeCloseTo(
      e.money.grossFreight,
      0
    );
    const tce = setBasis(r, s, "tce", current);
    const back = estimate(resolve(data, tce).input);
    expect(back.money.tce).toBeCloseTo(Math.round(e.money.tce! / 100) * 100, 6);
  });
});
