import { describe, expect, it } from "vitest";
import {
  BrokerFilterSchema,
  InquiryStep1Schema,
  InquiryStep2Schema,
  InquiryStep3Schema,
  InquiryStep4Schema,
  SubscribeSchema,
} from "./schemas";

describe("SubscribeSchema", () => {
  it("accepts a valid email", () => {
    expect(SubscribeSchema.safeParse({ email: "you@company.com" }).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const r = SubscribeSchema.safeParse({ email: "not-an-email" });
    expect(r.success).toBe(false);
  });
});

describe("BrokerFilterSchema", () => {
  it("parses an empty filter to defaults", () => {
    const parsed = BrokerFilterSchema.parse({
      sectors: [],
      classes: [],
      desks: [],
      q: "",
      sort: "name",
    });
    expect(parsed.sort).toBe("name");
  });

  it("rejects an unknown sector", () => {
    const r = BrokerFilterSchema.safeParse({
      sectors: ["bogus"],
      classes: [],
      desks: [],
      q: "",
      sort: "name",
    });
    expect(r.success).toBe(false);
  });
});

describe("Inquiry step schemas", () => {
  it("Step 1 requires a known cargo enum", () => {
    expect(InquiryStep1Schema.safeParse({ cargo: "crude" }).success).toBe(true);
    expect(InquiryStep1Schema.safeParse({ cargo: "rocks" }).success).toBe(false);
  });

  it("Step 2 accepts an empty stem but rejects unknown areas and classes", () => {
    const base = {
      loadArea: "blk",
      dischArea: "ukc-med",
      vesselClass: "Suezmax",
    };
    expect(InquiryStep2Schema.safeParse({ ...base, stem: "130000 mt" }).success).toBe(true);
    expect(InquiryStep2Schema.safeParse({ ...base, stem: "" }).success).toBe(true);
    expect(InquiryStep2Schema.safeParse({ ...base }).success).toBe(true);
    expect(InquiryStep2Schema.safeParse({ ...base, loadArea: "moon" }).success).toBe(false);
    expect(InquiryStep2Schema.safeParse({ ...base, vesselClass: "Titanic" }).success).toBe(false);
    expect(InquiryStep2Schema.safeParse({ ...base, vesselClass: "Capesize" }).success).toBe(true);
  });

  it("Step 3 makes laycan optional but enforces laycanFrom <= laycanTo", () => {
    expect(InquiryStep3Schema.safeParse({ term: "voy" }).success).toBe(true);
    expect(InquiryStep3Schema.safeParse({ laycanFrom: "", laycanTo: "", term: "tc" }).success).toBe(
      true
    );

    const ok = InquiryStep3Schema.safeParse({
      laycanFrom: "2026-05-03",
      laycanTo: "2026-05-08",
      term: "voy",
    });
    expect(ok.success).toBe(true);

    const bad = InquiryStep3Schema.safeParse({
      laycanFrom: "2026-05-08",
      laycanTo: "2026-05-03",
      term: "voy",
    });
    expect(bad.success).toBe(false);
    if (!bad.success) expect(bad.error.issues[0]?.path).toEqual(["laycanTo"]);
  });

  it("Step 3 caps free-text notes", () => {
    expect(InquiryStep3Schema.safeParse({ term: "coa", notes: "CP: Asbatankvoy" }).success).toBe(
      true
    );
    expect(InquiryStep3Schema.safeParse({ term: "coa", notes: "x".repeat(2001) }).success).toBe(
      false
    );
  });

  it("returns English validation messages", () => {
    const r = InquiryStep4Schema.safeParse({ name: "", firm: "", email: "nope" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const messages = r.error.issues.map((i) => i.message);
      expect(messages).toContain("Enter your name");
      expect(messages).toContain("Enter a valid email address");
    }
  });

  it("Step 4 requires name, firm, and a valid email", () => {
    const ok = InquiryStep4Schema.safeParse({
      name: "Mehmet",
      firm: "ACME",
      email: "m@example.com",
    });
    expect(ok.success).toBe(true);

    const noEmail = InquiryStep4Schema.safeParse({
      name: "Mehmet",
      firm: "ACME",
      email: "not-email",
    });
    expect(noEmail.success).toBe(false);

    const noName = InquiryStep4Schema.safeParse({
      name: "",
      firm: "ACME",
      email: "m@example.com",
    });
    expect(noName.success).toBe(false);
  });
});
