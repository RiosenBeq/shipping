import { describe, expect, it } from "vitest";
import {
  OFFICES,
  OFFICE_ORDER,
  tzOffsetMinutes,
  weekdayCoverageHours,
  type Office,
} from "./offices";
import { OfficeCitySchema } from "@/lib/schemas";

const office = (tz: string, opens: string, closes: string, days = ["Wednesday"]): Office => ({
  ...OFFICES.istanbul,
  tz,
  openingHours: { days, opens, closes },
});

describe("tzOffsetMinutes", () => {
  it("handles fixed and DST time zones", () => {
    const winter = new Date("2026-01-14T12:00:00Z");
    const summer = new Date("2026-07-15T12:00:00Z");
    expect(tzOffsetMinutes("Europe/Istanbul", winter)).toBe(180);
    expect(tzOffsetMinutes("Europe/London", winter)).toBe(0);
    expect(tzOffsetMinutes("Europe/London", summer)).toBe(60);
    expect(tzOffsetMinutes("America/Chicago", winter)).toBe(-360);
    expect(tzOffsetMinutes("America/Chicago", summer)).toBe(-300);
  });
});

describe("weekdayCoverageHours", () => {
  const at = new Date("2026-03-04T12:00:00Z");

  it("measures a single desk's hours", () => {
    expect(weekdayCoverageHours([office("UTC", "08:00", "18:00")], at)).toBe(10);
  });

  it("joins overlapping desks across time zones", () => {
    const desks = [office("UTC", "06:00", "14:00"), office("UTC", "12:00", "20:00")];
    expect(weekdayCoverageHours(desks, at)).toBe(14);
  });

  it("ignores desks that are closed on weekdays", () => {
    const desks = [office("UTC", "00:00", "23:59", ["Saturday", "Sunday"])];
    expect(weekdayCoverageHours(desks, at)).toBe(0);
  });

  it("caps continuous coverage at 24 hours", () => {
    const desks = [office("UTC", "00:00", "13:00"), office("UTC", "12:00", "24:00")];
    expect(weekdayCoverageHours(desks, at)).toBe(24);
  });

  it("derives the published LEVANTER coverage from the office data", () => {
    const desks = OFFICE_ORDER.map((s) => OFFICES[s]);
    expect(weekdayCoverageHours(desks, new Date("2026-01-14T12:00:00Z"))).toBe(24);
    expect(weekdayCoverageHours(desks, new Date("2026-07-15T12:00:00Z"))).toBe(24);
  });
});

describe("office data", () => {
  it("keys every office by its own slug, in the declared order", () => {
    for (const slug of OFFICE_ORDER) {
      expect(OfficeCitySchema.parse(slug)).toBe(slug);
      expect(OFFICES[slug].slug).toBe(slug);
    }
  });

  it("keeps the display hours in sync with the machine-readable hours", () => {
    for (const slug of OFFICE_ORDER) {
      const o = OFFICES[slug];
      expect(o.hours).toContain(o.openingHours.opens);
      expect(o.hours).toContain(o.openingHours.closes);
    }
  });
});
