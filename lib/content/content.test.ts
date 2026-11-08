import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createReader } from "@keystatic/core/reader";
import { keystaticConfig } from "@/keystatic.config";
import { CONTENT_FILES, validateContent } from "@/lib/content/validate";
import { REPORT_CATEGORIES } from "@/lib/content/options";
import { isoToReportDate } from "@/lib/content/format";
import { ResearchCategorySchema } from "@/lib/schemas";
import { AVATAR_COLOR, BROKERS, TEAM_LABEL, TEAM_ORDER } from "@/lib/data/brokers";
import { HORMUZ_NOTE_PATH, REPORTS, getReportBySlug, reportDateIso } from "@/lib/data/research";
import { REPORT_BODIES } from "@/lib/data/research-bodies";
import { LPG_CARGO_DENSITY, LPG_CLASSES } from "@/lib/data/lpg-classes";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { STRAITS_SECTIONS } from "@/lib/data/turkish-straits";
import { siteConfig, whatsappUrl } from "@/lib/site";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => readFileSync(path.join(ROOT, rel), "utf8");

describe("content files", () => {
  it.each(CONTENT_FILES.map((f) => [f.path, f] as const))("%s matches its schema", (_, f) => {
    const result = f.schema.safeParse(f.data);
    const issues = result.success
      ? []
      : result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    expect(issues).toEqual([]);
  });

  it("pass the cross-file rules (unique slugs, real authors, the Hormuz brief)", () => {
    expect(validateContent()).toEqual([]);
  });

  it("are all registered, and every one is editable in /keystatic", () => {
    const onDisk = readdirSync(path.join(ROOT, "content"))
      .filter((f) => f.endsWith(".json"))
      .map((f) => `content/${f}`)
      .sort();
    expect(CONTENT_FILES.map((f) => f.path).sort()).toEqual(onDisk);

    const singletons = keystaticConfig("local").singletons;
    const paths = Object.values(singletons).map((s) => `${s.path}.json`);
    expect(paths.sort()).toEqual(onDisk);
    for (const s of Object.values(singletons)) expect(s.format).toEqual({ data: "json" });
  });

  it("are formatted the way Keystatic writes them (no noise in admin diffs)", () => {
    for (const f of CONTENT_FILES) {
      const text = read(f.path);
      expect(text, f.path).toBe(JSON.stringify(JSON.parse(text), null, 2) + "\n");
    }
  });

  it("open in the Keystatic admin (its own reader accepts every file)", async () => {
    const reader = createReader(ROOT, keystaticConfig("local"));
    for (const key of Object.keys(reader.singletons) as (keyof typeof reader.singletons)[]) {
      await expect(reader.singletons[key].readOrThrow(), key).resolves.toBeTruthy();
    }
  });
});

describe("unique slugs", () => {
  const unique = (values: string[]) => expect(new Set(values).size).toBe(values.length);

  it("research notes, classes, brokers, converter cargoes and Straits sections", () => {
    unique(REPORTS.map((r) => r.slug));
    unique(TANKER_CLASSES.map((c) => c.slug));
    unique(LPG_CLASSES.map((c) => c.slug));
    unique(BROKERS.map((b) => b.name));
    unique(LPG_CARGO_DENSITY.map((c) => c.key));
    unique(STRAITS_SECTIONS.map((s) => s.id));
  });

  it("are reported by validateContent when they collide", async () => {
    const research = (await import("@/content/research.json")).default;
    const first = research.notes[0];
    research.notes.push(first);
    try {
      expect(validateContent()).toContainEqual(
        `content/research.json: duplicate note slug "${first.slug}"`
      );
    } finally {
      research.notes.pop();
    }
    expect(validateContent()).toEqual([]);
  });
});

describe("loaders (lib/site, lib/data)", () => {
  it("keep the site's shapes: report dates, avatar colours, optional fields", () => {
    expect(isoToReportDate("2026-04-08")).toBe("08 APR 2026");
    for (const r of REPORTS) {
      expect(r.date).toMatch(/^\d{2} [A-Z]{3} \d{4}$/);
      expect(reportDateIso(r.date)).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      // Missing in the JSON means absent here, never an empty string.
      expect(r.seoTitle === undefined || r.seoTitle.length > 0).toBe(true);
      expect("updated" in r ? r.updated : "x").toBeTruthy();
    }
    for (const b of BROKERS) {
      expect(Object.values(AVATAR_COLOR)).toContain(b.color);
      expect("photo" in b ? b.photo : "/x").toMatch(/^\//);
    }
    for (const t of TEAM_ORDER) expect(TEAM_LABEL[t]).toBeTruthy();
    for (const c of [...TANKER_CLASSES, ...LPG_CLASSES]) {
      for (const r of c.routes) expect(r.hormuz === undefined || r.hormuz === true).toBe(true);
    }
  });

  it("give every note a body, with links in callouts as {href, label}", () => {
    for (const r of REPORTS) expect(REPORT_BODIES[r.slug], r.slug).toBeDefined();
    const callouts = Object.values(REPORT_BODIES).flatMap((b) =>
      b.blocks.filter((x) => x.kind === "callout")
    );
    expect(callouts.length).toBeGreaterThan(0);
    for (const c of callouts) {
      if (c.kind === "callout" && c.link) expect(c.link.href.startsWith("/")).toBe(true);
    }
    // Keystatic stores an empty table cell as null; the renderer gets "".
    for (const b of Object.values(REPORT_BODIES)) {
      for (const x of b.blocks) {
        if (x.kind === "table") {
          for (const cell of [...x.head, ...x.rows.flat()]) expect(typeof cell).toBe("string");
        }
      }
    }
  });

  it("keep the Hormuz brief linked from route tables", () => {
    expect(getReportBySlug(HORMUZ_NOTE_PATH.replace("/research/", ""))).toBeDefined();
  });

  it("keep site settings usable by the client components", () => {
    expect(siteConfig.url).toMatch(/^https?:\/\/[^/]+.*[^/]$/);
    expect(whatsappUrl()).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
    expect(LPG_CARGO_DENSITY.length).toBeGreaterThan(0);
  });

  it("show a broker's photo only when the file exists in public/", () => {
    for (const b of BROKERS) {
      if (b.photo) expect(existsSync(path.join(ROOT, "public", b.photo)), b.photo).toBe(true);
    }
  });

  it("offer the same research categories as the /research filter", () => {
    expect([...REPORT_CATEGORIES].sort()).toEqual(
      ResearchCategorySchema.options.filter((c) => c !== "all").sort()
    );
  });
});
