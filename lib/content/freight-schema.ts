/**
 * zod schema for content/freight.json (the "Freight calculator data" singleton,
 * lib/content/keystatic-freight.ts), in the shape Keystatic writes it: strict objects,
 * empty optional text left out. The cross-checks (unique ids, every port, passage and
 * cargo a preset or route names exists, no distance shorter than the great circle between
 * its ports) run in the same schema, so the build-time content check (validate.ts →
 * assertValidContent) stops a broken admin edit before it reaches the live calculator.
 * Server and test code only: it pulls in zod.
 */
import { z } from "zod";
import lpgCargoes from "@/content/lpg-cargoes.json";
import { CLASS_SLUGS, ETS_SCOPES, FUELS, PORT_REGIONS } from "@/lib/freight/constants";
import { greatCircleNm } from "@/lib/freight/routes";
import { SLUG_PATTERN } from "./options";

const text = z.string().min(1);
const optionalText = z.string().min(1).optional();
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a date as YYYY-MM-DD")
  .refine((d) => !Number.isNaN(Date.parse(`${d}T00:00:00Z`)), "Not a real date");
const id = z.string().regex(SLUG_PATTERN, "Lowercase letters, digits and hyphens only");
const num = (min: number, max: number) => z.number().min(min).max(max);
const int = (min: number, max: number) => z.number().int().min(min).max(max);

const fuelPrice = z.object({ price: num(1, 10_000), asOf: isoDate }).strict();

const classPreset = z
  .object({
    slug: z.enum(CLASS_SLUGS),
    label: text,
    dwt: int(500, 600_000),
    capacity: int(100, 600_000),
    speedLaden: num(1, 30),
    speedBallast: num(1, 30),
    consLaden: num(0, 400),
    consBallast: num(0, 400),
    consPort: num(0, 200),
    consIdle: num(0, 200),
    fuel: z.enum(FUELS),
    sizeFactor: num(0.01, 10),
    portDays: num(0, 60),
    cargoRate: int(1, 100_000),
    demurrage: int(0, 1_000_000),
    cargo: int(1, 1_000_000),
    grade: optionalText,
    freight: num(0, 10_000),
    open: id,
    load: id,
    discharge: id,
  })
  .strict();

const port = z
  .object({
    id,
    name: text,
    country: z.string().regex(/^[A-Z]{2}$/, "Two-letter country code, e.g. TR"),
    region: z.enum(PORT_REGIONS),
    lat: num(-90, 90),
    lon: num(-180, 180),
    eu: z.boolean(),
    mgoAtBerth: z.boolean(),
    cost: int(0, 10_000_000),
    note: optionalText,
  })
  .strict();

const passage = z
  .object({
    id,
    name: text,
    costLaden: int(0, 100_000_000),
    costBallast: int(0, 100_000_000),
    days: num(0, 60),
    note: optionalText,
  })
  .strict();

/** "turkish-straits, gibraltar" → ["turkish-straits", "gibraltar"]. */
export const splitIds = (s: string | undefined) =>
  (s ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

const distance = z
  .object({
    from: id,
    to: id,
    nm: int(0, 30_000),
    via: optionalText,
    passages: z
      .string()
      .regex(
        /^[a-z0-9-]+(\s*,\s*[a-z0-9-]+)*$/,
        "Passage ids separated by commas, e.g. turkish-straits, gibraltar"
      )
      .optional(),
    eca: int(0, 100),
  })
  .strict();

export const freightFileSchema = z
  .object({
    notice: text,
    sources: text,
    staleAfterDays: int(1, 365),
    fuels: z.object({ vlsfo: fuelPrice, mgo: fuelPrice, hsfo: fuelPrice }).strict(),
    ets: z
      .object({
        euaPrice: num(0, 1_000),
        euaAsOf: isoDate,
        eurUsd: num(0.1, 5),
        eurUsdAsOf: isoDate,
        phaseIn: int(0, 100),
      })
      .strict(),
    defaults: z
      .object({
        class: z.enum(CLASS_SLUGS),
        weatherMargin: num(0, 50),
        addressCommission: num(0, 20),
        brokerage: num(0, 20),
        extraHours: num(0, 240),
        fillLimit: num(50, 100),
        etsScope: z.enum(ETS_SCOPES),
      })
      .strict(),
    classes: z.array(classPreset).min(1),
    ports: z.array(port).min(2),
    passages: z.array(passage),
    distances: z.array(distance),
  })
  .strict()
  .superRefine((f, ctx) => {
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
    const dup = (values: string[]) => values.filter((v, i) => values.indexOf(v) !== i);

    for (const d of dup(f.classes.map((c) => c.slug))) issue(["classes"], `Two presets for "${d}"`);
    for (const d of dup(f.ports.map((p) => p.id))) issue(["ports"], `Duplicate port id "${d}"`);
    for (const d of dup(f.passages.map((p) => p.id)))
      issue(["passages"], `Duplicate passage id "${d}"`);
    if (!f.classes.some((c) => c.slug === f.defaults.class))
      issue(["defaults", "class"], `No preset for the default class "${f.defaults.class}"`);

    const ports = new Map(f.ports.map((p) => [p.id, p]));
    const passages = new Set(f.passages.map((p) => p.id));
    const cargoes = new Set(lpgCargoes.cargoes.map((c) => c.key));

    f.classes.forEach((c, i) => {
      for (const k of ["open", "load", "discharge"] as const) {
        if (!ports.has(c[k])) issue(["classes", i, k], `No port "${c[k]}" in the port list`);
      }
      if (c.grade && !cargoes.has(c.grade))
        issue(["classes", i, "grade"], `No cargo "${c.grade}" in LPG converter cargoes`);
    });

    const seen = new Set<string>();
    f.distances.forEach((d, i) => {
      const a = ports.get(d.from);
      const b = ports.get(d.to);
      if (!a) issue(["distances", i, "from"], `No port "${d.from}" in the port list`);
      if (!b) issue(["distances", i, "to"], `No port "${d.to}" in the port list`);
      if (d.from === d.to) issue(["distances", i], "From and to are the same port");
      for (const p of splitIds(d.passages)) {
        if (!passages.has(p)) issue(["distances", i, "passages"], `No passage "${p}"`);
      }
      const key = [[d.from, d.to].sort().join("|"), d.via ?? ""].join("|");
      if (seen.has(key))
        issue(["distances", i], `${d.from}–${d.to} is listed twice with the same "via"`);
      seen.add(key);
      // A sea route is never shorter than the great circle (1% and the rounding spare).
      if (a && b && d.from !== d.to) {
        const gc = greatCircleNm(a, b);
        if (d.nm < gc * 0.99 - 5)
          issue(
            ["distances", i, "nm"],
            `${d.from}–${d.to}: ${d.nm} nm is shorter than the great circle between the ports (${Math.round(gc)} nm); check the figure`
          );
      }
    });
  });

export type FreightFile = z.infer<typeof freightFileSchema>;
