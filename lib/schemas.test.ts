import { describe, expect, it } from "vitest";
import { InquirySchema, ResearchCategorySchema } from "./schemas";

const valid = {
  segment: "lpg",
  vessel: "VLGC",
  term: "voyage",
  loadArea: "Houston",
  dischargeArea: "Aliağa",
  quantity: "44,000 mt",
  laycanFrom: "2026-11-01",
  laycanTo: "2026-11-05",
  name: "Ayşe Demir",
  company: "Example Energy",
  email: "ayse@example.com",
  phone: "",
  notes: "",
};

describe("InquirySchema", () => {
  it("accepts a complete LPG inquiry", () => {
    expect(InquirySchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a tanker inquiry without optional fields", () => {
    const { phone: _phone, notes: _notes, ...rest } = valid;
    const r = InquirySchema.safeParse({ ...rest, segment: "crude", vessel: "Suezmax" });
    expect(r.success).toBe(true);
  });

  it("rejects an unknown segment", () => {
    expect(InquirySchema.safeParse({ ...valid, segment: "dry-bulk" }).success).toBe(false);
  });

  it("rejects an unknown vessel class", () => {
    expect(InquirySchema.safeParse({ ...valid, vessel: "Capesize" }).success).toBe(false);
  });

  it("requires a valid email", () => {
    const r = InquirySchema.safeParse({ ...valid, email: "not-an-email" });
    expect(r.success).toBe(false);
  });

  it("rejects a laycan that ends before it starts", () => {
    const r = InquirySchema.safeParse({
      ...valid,
      laycanFrom: "2026-11-10",
      laycanTo: "2026-11-01",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.join(".") === "laycanTo")).toBe(true);
    }
  });

  it("accepts a single-day laycan", () => {
    const r = InquirySchema.safeParse({
      ...valid,
      laycanFrom: "2026-11-01",
      laycanTo: "2026-11-01",
    });
    expect(r.success).toBe(true);
  });

  it("accepts an open laycan with only a start date", () => {
    expect(InquirySchema.safeParse({ ...valid, laycanTo: "" }).success).toBe(true);
    const { laycanTo: _to, ...rest } = valid;
    expect(InquirySchema.safeParse(rest).success).toBe(true);
  });

  it("asks for a cargo type when none is chosen", () => {
    const r = InquirySchema.safeParse({ ...valid, segment: "" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const issue = r.error.issues.find((i) => i.path[0] === "segment");
      expect(issue?.message).toBe("Choose a cargo type");
    }
  });

  it("requires load and discharge areas", () => {
    expect(InquirySchema.safeParse({ ...valid, loadArea: " " }).success).toBe(false);
    expect(InquirySchema.safeParse({ ...valid, dischargeArea: "" }).success).toBe(false);
  });

  it("reports every missing field at once, even with no cargo chosen", () => {
    const r = InquirySchema.safeParse({
      ...valid,
      segment: "",
      loadArea: "",
      dischargeArea: "",
      quantity: "",
      laycanFrom: "",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      const paths = r.error.issues.map((i) => i.path.join("."));
      for (const k of ["segment", "loadArea", "dischargeArea", "quantity", "laycanFrom"]) {
        expect(paths).toContain(k);
      }
    }
  });

  it("defaults to a cargo inquiry", () => {
    const r = InquirySchema.safeParse(valid);
    expect(r.success && r.data.mode).toBe("cargo");
  });

  it("makes redelivery optional on a time charter and asks for a period", () => {
    const tc = { ...valid, term: "tc", dischargeArea: "", quantity: "12 months" };
    expect(InquirySchema.safeParse(tc).success).toBe(true);
    const r = InquirySchema.safeParse({ ...tc, quantity: "" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.find((i) => i.path[0] === "quantity")?.message).toMatch(/period/i);
    }
  });

  it("accepts an open ship without discharge or quantity", () => {
    const ship = {
      ...valid,
      mode: "ship",
      dischargeArea: "",
      quantity: "",
      laycanTo: "2026-10-01",
    };
    // laycanTo is ignored for an open ship (one open date), even if out of order
    expect(InquirySchema.safeParse(ship).success).toBe(true);
  });

  it("still needs the open port and date for an open ship", () => {
    const r = InquirySchema.safeParse({ ...valid, mode: "ship", loadArea: "", laycanFrom: "" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const paths = r.error.issues.map((i) => i.path.join("."));
      expect(paths).toEqual(expect.arrayContaining(["loadArea", "laycanFrom"]));
      expect(paths).not.toContain("dischargeArea");
      expect(paths).not.toContain("quantity");
    }
  });

  it("rejects an unknown mode", () => {
    expect(InquirySchema.safeParse({ ...valid, mode: "broker" }).success).toBe(false);
  });
});

describe("ResearchCategorySchema", () => {
  it("accepts the published categories", () => {
    for (const c of ["all", "weekly", "route", "reg", "guide"]) {
      expect(ResearchCategorySchema.safeParse(c).success).toBe(true);
    }
  });

  it("rejects retired categories", () => {
    expect(ResearchCategorySchema.safeParse("sp").success).toBe(false);
  });
});
