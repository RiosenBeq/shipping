import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FREIGHT_DATA as data } from "@/lib/content/freight";
import { estimate } from "./calc";
import { ageInDays, fmtAge, fmtDate, fmtInput, fmtNum, fmtUsd, fmtUsdShort } from "./format";
import { INQUIRY_DRAFT_KEY, inquiryFor, segmentFor } from "./inquiry";
import { emptyState, resolve } from "./state";

const ROOT = path.resolve(__dirname, "../..");

describe("Ask the desk: the contact form with this voyage", () => {
  it("picks the form's cargo for the ship and grade", () => {
    expect(segmentFor("vlcc", "tanker")).toBe("crude");
    expect(segmentFor("mr", "tanker")).toBe("clean");
    expect(segmentFor("mgc", "gas", "ammonia")).toBe("ammonia");
    expect(segmentFor("vlgc", "gas", "propane")).toBe("lpg");
    expect(segmentFor("handysize", "gas", "propylene")).toBe("petchem");
  });

  it("links with cargo, ship size and quantity, and drafts the ports and the estimate", () => {
    const r = resolve(data, emptyState("aframax"));
    const e = estimate(r.input);
    const link = "https://example.test/freight-calculator?v=1&c=aframax";
    const { href, draft } = inquiryFor(data, r, e, link);
    const q = new URLSearchParams(href.split("?")[1]);
    expect(href.startsWith("/contact?")).toBe(true);
    expect(q.get("segment")).toBe("crude");
    expect(q.get("vessel")).toBe("Aframax / LR2");
    expect(q.get("quantity")).toBe("80,000 t");
    expect(draft.mode).toBe("cargo");
    expect(draft.term).toBe("voyage");
    expect(draft.loadArea).toBe(r.ports.load.facts.name);
    expect(draft.dischargeArea).toBe(r.ports.discharge.facts.name);
    expect(draft.notes).toContain("indicative");
    expect(draft.notes).toContain(link);
    expect(draft.notes).toContain(`${fmtUsd(e.money.tce!)}/day`);
    expect(draft.notes.length).toBeLessThanOrEqual(2000);
  });

  it("names the gas cargo with the quantity", () => {
    const r = resolve(data, emptyState("vlgc"));
    const { href } = inquiryFor(data, r, estimate(r.input), "x");
    expect(new URLSearchParams(href.split("?")[1]).get("quantity")).toBe("44,000 t Propane");
  });

  it("matches the contact form's draft contract (key and field names)", () => {
    const form = readFileSync(path.join(ROOT, "app/(site)/contact/InquiryForm.tsx"), "utf8");
    expect(form).toContain(`const DRAFT_KEY = "${INQUIRY_DRAFT_KEY}"`);
    for (const field of [
      "mode",
      "segment",
      "vessel",
      "term",
      "loadArea",
      "dischargeArea",
      "quantity",
      "notes",
    ])
      expect(form, field).toMatch(new RegExp(`\\n  ${field}: `));
    expect(form).toContain('params.get("segment")');
    expect(form).toContain('params.get("quantity")');
  });
});

describe("formatting", () => {
  it("money and numbers, with a real minus", () => {
    expect(fmtUsd(1_234_567.8)).toBe("$1,234,568");
    expect(fmtUsd(-12_000)).toBe("−$12,000");
    expect(fmtUsd(13.25, 2)).toBe("$13.25");
    expect(fmtUsd(-0.2)).toBe("$0");
    expect(fmtNum(-1_500.25, 1)).toBe("−1,500.3");
    expect(fmtUsdShort(1_210_000)).toBe("$1.21M");
    expect(fmtUsdShort(-640_400)).toBe("−$640k");
    expect(fmtUsdShort(8_400)).toBe("$8,400");
    expect(fmtInput(80_000)).toBe("80,000");
    expect(fmtInput(13.5)).toBe("13.5");
    expect(fmtInput(undefined)).toBe("");
  });

  it("dates and their age", () => {
    expect(fmtDate("2026-11-06")).toBe("6 Nov 2026");
    expect(ageInDays("2026-11-06", new Date(2026, 10, 8))).toBe(2);
    expect(ageInDays("2026-11-06", new Date(2026, 10, 1))).toBe(0);
    expect(fmtAge(0)).toBe("today");
    expect(fmtAge(1)).toBe("yesterday");
    expect(fmtAge(12)).toBe("12 days ago");
    expect(fmtAge(95)).toBe("3 months ago");
  });
});
