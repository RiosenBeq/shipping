import { describe, expect, it } from "vitest";
import { parseLocaleNumber } from "./number";

const v = (s: string) => parseLocaleNumber(s).value;
const re = (s: string) => parseLocaleNumber(s).reinterpreted;

describe("parseLocaleNumber", () => {
  it("reads English grouping as thousands", () => {
    expect(v("84,000")).toBe(84000);
    expect(v("1,234,567")).toBe(1234567);
    expect(v("84,000.50")).toBe(84000.5);
    expect(re("84,000")).toBe(false);
  });

  it("reads plain and dot-decimal numbers as is", () => {
    expect(v("84000")).toBe(84000);
    expect(v("84.5")).toBe(84.5);
    expect(v("98")).toBe(98);
    expect(re("84.5")).toBe(false);
  });

  it("reads Turkish/European dot thousands", () => {
    expect(v("84.000")).toBe(84000);
    expect(v("1.234.567")).toBe(1234567);
    expect(re("84.000")).toBe(true);
  });

  it("reads Turkish/European comma decimals", () => {
    expect(v("84.000,00")).toBe(84000);
    expect(v("84.000,5")).toBe(84000.5);
    expect(v("97,5")).toBe(97.5);
    expect(v("98,5")).toBe(98.5);
    expect(v("1500,5")).toBe(1500.5);
    expect(v("1500,25")).toBe(1500.25);
    expect(v("0,500")).toBe(0.5);
    expect(re("97,5")).toBe(true);
    expect(re("84.000,00")).toBe(true);
  });

  it("ignores spaces and underscores used as grouping", () => {
    expect(v("84 000")).toBe(84000);
    expect(v("84 000")).toBe(84000);
    expect(v("84_000")).toBe(84000);
  });

  it("returns NaN for empty or unreadable input", () => {
    expect(v("")).toBeNaN();
    expect(v("   ")).toBeNaN();
    expect(v("abc")).toBeNaN();
    expect(v("1.2.3")).toBeNaN();
  });
});
