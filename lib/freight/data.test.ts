import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { config } from "@keystatic/core";
import { createReader } from "@keystatic/core/reader";
import file from "@/content/freight.json";
import { FREIGHT_DATA as data } from "@/lib/content/freight";
import { freightFileSchema } from "@/lib/content/freight-schema";
import { freightNavigation, freightSingletons } from "@/lib/content/keystatic-freight";
import { CLASS_SLUGS } from "./constants";
import { greatCircleNm, routesBetween } from "./routes";

const ROOT = path.resolve(__dirname, "../..");
const issuesOf = (value: unknown) => {
  const r = freightFileSchema.safeParse(value);
  return r.success ? [] : r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
};

describe("content/freight.json", () => {
  it("matches its schema, references included", () => {
    expect(issuesOf(file)).toEqual([]);
  });

  it("is written the way Keystatic writes it (no noise in admin diffs)", () => {
    const text = readFileSync(path.join(ROOT, "content/freight.json"), "utf8");
    expect(text).toBe(JSON.stringify(JSON.parse(text), null, 2) + "\n");
  });

  it("keeps its keys in the admin's field order", () => {
    const schema = freightSingletons.freight.schema;
    expect(Object.keys(file)).toEqual(Object.keys(schema));
    // Fields of each list item, in order (optional text may be absent).
    const order = (list: string, item: Record<string, unknown>) => {
      const field = schema[list as keyof typeof schema] as unknown as {
        element: { fields: Record<string, unknown> };
      };
      const all = Object.keys(field.element.fields);
      expect(Object.keys(item), list).toEqual(all.filter((k) => k in item));
    };
    for (const c of file.classes) order("classes", c);
    for (const p of file.ports) order("ports", p);
    for (const p of file.passages) order("passages", p);
    for (const d of file.distances) order("distances", d);
  });

  it("opens in the Keystatic admin", async () => {
    const reader = createReader(
      ROOT,
      config({ storage: { kind: "local" }, singletons: freightSingletons })
    );
    const entry = await reader.singletons.freight.readOrThrow();
    expect(entry.fuels.vlsfo.price).toBe(file.fuels.vlsfo.price);
    expect(entry.distances).toHaveLength(file.distances.length);
    expect(freightNavigation).toEqual({ Tools: ["freight"] });
  });

  it("marks the example values and dates every reference price", () => {
    expect(file.notice).toMatch(/example values/i);
    for (const f of Object.values(file.fuels)) expect(f.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(file.ets.euaAsOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(file.ets.eurUsdAsOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(file.ets.phaseIn).toBe(100); // 2026 emissions: 100%
  });

  it("has a preset for every ship class the site covers", () => {
    expect(data.classes.map((c) => c.slug).sort()).toEqual([...CLASS_SLUGS].sort());
  });

  it("covers the ports the desks quote, with a route for every pair", () => {
    const ids = data.ports.map((p) => p.id);
    for (const p of [
      "novorossiysk",
      "cpc",
      "ceyhan",
      "aliaga",
      "augusta",
      "trieste",
      "rotterdam",
      "ras-tanura",
      "fujairah",
      "houston",
      "yanbu",
      "ain-sukhna",
      "sidi-kerir",
      "gibraltar",
      "tuapse",
      "constanta",
      "marmara-eregli",
      "dortyol",
      "antwerp",
      "algeciras",
    ])
      expect(ids, p).toContain(p);
    for (const a of ids)
      for (const b of ids)
        if (a !== b) expect(routesBetween(data, a, b).length, `${a}–${b}`).toBeGreaterThan(0);
  });

  it("has no sea distance shorter than the great circle between its ports", () => {
    const at = new Map(data.ports.map((p) => [p.id, p]));
    for (const d of data.distances) {
      const gc = greatCircleNm(at.get(d.from)!, at.get(d.to)!);
      expect(d.nm, `${d.from}–${d.to}`).toBeGreaterThanOrEqual(gc * 0.99 - 5);
    }
  });

  it("agrees with commonly quoted distances on benchmark lanes (±3%)", () => {
    const near = (a: string, b: string, nm: number, via?: RegExp) => {
      const r = routesBetween(data, a, b).find((x) => !via || via.test(x.via ?? ""));
      expect(r, `${a}–${b}`).toBeDefined();
      expect(Math.abs(r!.nm - nm) / nm, `${a}–${b}: ${r!.nm} vs ${nm}`).toBeLessThan(0.03);
    };
    near("ras-tanura", "ningbo", 5_800); // TD3C
    near("ras-tanura", "rotterdam", 11_200, /Cape/); // VLCC to Europe round the Cape
    near("houston", "chiba", 9_150, /Panama/); // BLPG3 via Panama
    near("houston", "rotterdam", 5_000);
    near("gibraltar", "rotterdam", 1_355);
    near("fujairah", "singapore", 3_290);
  });

  it("rejects a broken admin edit: unknown port, too-short distance, duplicate id", () => {
    const broken = structuredClone(file);
    broken.distances[0] = { ...broken.distances[0], to: "atlantis" };
    broken.distances[1] = { ...broken.distances[1], nm: 10 };
    broken.ports.push({ ...broken.ports[0] });
    const issues = issuesOf(broken);
    expect(issues.some((i) => /No port "atlantis"/.test(i))).toBe(true);
    expect(issues.some((i) => /shorter than the great circle/.test(i))).toBe(true);
    expect(issues.some((i) => /Duplicate port id/.test(i))).toBe(true);
  });
});
