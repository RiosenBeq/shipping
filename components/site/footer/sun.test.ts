import { describe, expect, it } from "vitest";
import { ISTANBUL, clockIn, dateIn, istanbulDaylight, sunTimes } from "./sun";

/** Minutes after midnight of an "HH:MM" string. */
const mins = (hm: string) => Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3, 5));

/**
 * Reference: US Naval Observatory, Astronomical Applications API (aa.usno.navy.mil, "rstt/oneday",
 * coords 41.0,29.0, tz +3), fetched 2026-11-09. Istanbul has kept UTC+3 all year since 2016.
 */
const USNO: [date: string, rise: string, set: string][] = [
  ["2026-03-20", "07:08", "19:16"],
  ["2026-06-21", "05:32", "20:40"],
  ["2026-09-23", "06:52", "19:00"],
  ["2026-11-09", "07:44", "17:51"],
  ["2026-12-21", "08:25", "17:39"],
  ["2027-02-01", "08:15", "18:20"],
];

describe("sunTimes (NOAA equations)", () => {
  it.each(USNO)("Istanbul %s: sunrise %s, sunset %s (±2 min)", (date, rise, set) => {
    const [y, m, d] = date.split("-").map(Number);
    const t = sunTimes(y, m, d, ISTANBUL.lat, ISTANBUL.lon);
    expect(t.rise).not.toBeNull();
    expect(t.set).not.toBeNull();
    const local = (x: Date) => mins(clockIn(x, ISTANBUL.timeZone));
    expect(Math.abs(local(t.rise!) - mins(rise))).toBeLessThanOrEqual(2);
    expect(Math.abs(local(t.set!) - mins(set))).toBeLessThanOrEqual(2);
  });

  it("returns null in polar night and polar day", () => {
    expect(sunTimes(2026, 12, 21, 78.2, 15.6).rise).toBeNull(); // Longyearbyen, polar night
    expect(sunTimes(2026, 6, 21, 78.2, 15.6).set).toBeNull(); // midnight sun
  });

  it("keeps sunrise before sunset, about 9 h 14 min apart at the winter solstice", () => {
    const t = sunTimes(2026, 12, 21, ISTANBUL.lat, ISTANBUL.lon);
    const len = (t.set!.getTime() - t.rise!.getTime()) / 60_000;
    expect(len).toBeGreaterThan(9 * 60 + 10);
    expect(len).toBeLessThan(9 * 60 + 18);
  });
});

describe("Istanbul's date and clock", () => {
  it("uses the Istanbul calendar date, not the viewer's", () => {
    // 22:30 UTC on 9 November is already 10 November in Istanbul (UTC+3).
    expect(dateIn(new Date(Date.UTC(2026, 10, 9, 22, 30)), ISTANBUL.timeZone)).toEqual([
      2026, 11, 10,
    ]);
    expect(clockIn(new Date(Date.UTC(2026, 10, 9, 4, 44)), ISTANBUL.timeZone)).toBe("07:44");
  });

  it("formats today's daylight as HH:MM Istanbul time", () => {
    expect(istanbulDaylight(new Date(Date.UTC(2026, 10, 9, 9)))).toEqual({
      rise: "07:44",
      set: "17:51",
    });
    // Late evening UTC: the Istanbul date (10 November) decides which day's times are shown.
    const next = istanbulDaylight(new Date(Date.UTC(2026, 10, 9, 22, 30)))!;
    expect(mins(next.rise)).toBeGreaterThanOrEqual(mins("07:44"));
    expect(mins(next.set)).toBeLessThanOrEqual(mins("17:51"));
  });
});
