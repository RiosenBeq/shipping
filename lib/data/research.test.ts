import { describe, expect, it } from "vitest";
import { REPORTS, reportDateIso, reportSlug } from "./research";
import { REPORT_BODIES } from "./research-bodies";

describe("research catalogue", () => {
  it("has a body for every report, keyed by the report's URL slug", () => {
    const missing = REPORTS.map(reportSlug).filter((slug) => !(slug in REPORT_BODIES));
    expect(missing).toEqual([]);
  });

  it("has no orphaned bodies that no report links to", () => {
    const slugs = new Set(REPORTS.map(reportSlug));
    const orphans = Object.keys(REPORT_BODIES).filter((key) => !slugs.has(key));
    expect(orphans).toEqual([]);
  });

  it("gives free reports a full body and gated reports a public summary", () => {
    for (const r of REPORTS) {
      const body = REPORT_BODIES[reportSlug(r)];
      if (r.gated) expect(body.summary?.length ?? 0).toBeGreaterThan(80);
      else expect(body.blocks.length).toBeGreaterThan(2);
    }
  });

  it("uses unique slugs", () => {
    const slugs = REPORTS.map(reportSlug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("parses display dates to ISO 8601", () => {
    expect(reportDateIso("28 APR 2026")).toBe("2026-04-28T00:00:00.000Z");
    for (const r of REPORTS) expect(reportDateIso(r.date)).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
