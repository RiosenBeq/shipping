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
