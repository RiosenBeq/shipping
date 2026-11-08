import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createReader } from "@keystatic/core/reader";
import { keystaticConfig } from "@/keystatic.config";
import { CONTENT_FILES, validateContent, validatePublicNotes } from "@/lib/content/validate";
import { REPORT_CATEGORIES } from "@/lib/content/options";
import { isoToReportDate } from "@/lib/content/format";
import { ResearchCategorySchema } from "@/lib/schemas";
import { AVATAR_COLOR, BROKERS, TEAM_LABEL, TEAM_ORDER } from "@/lib/data/brokers";
import { HORMUZ_NOTE_PATH, REPORTS, getReportBySlug, reportDateIso } from "@/lib/data/research";
import { getAllPosts } from "@/lib/blog/posts";
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

  it("keep notes for editors off public copy (the calculator's price note)", () => {
    expect(validatePublicNotes("Example values, not live market prices.")).toEqual([]);
    expect(validatePublicNotes("Example values — update in the admin.")).toHaveLength(1);
    expect(validatePublicNotes("TODO: real prices")).toHaveLength(1);
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

    // The blog is a collection of Markdoc files, and nothing else lives in content/blog.
    const { posts } = keystaticConfig("local").collections;
    expect(posts.path).toBe("content/blog/*");
    expect(posts.format).toEqual({ contentField: "body" });
    const blog = readdirSync(path.join(ROOT, "content/blog"));
    expect(blog.filter((f) => !f.endsWith(".mdoc"))).toEqual([]);
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
    const slugs = await reader.collections.posts.list();
    expect(slugs.sort()).toEqual(getAllPosts().map((p) => p.slug).sort());
    for (const slug of slugs) {
      const entry = await reader.collections.posts.readOrThrow(slug, { resolveLinkedFiles: true });
      expect(entry.title, slug).toBeTruthy();
      expect(entry.body.node.children.length, slug).toBeGreaterThan(0);
    }
  });
});

describe("unique slugs", () => {
  const unique = (values: string[]) => expect(new Set(values).size).toBe(values.length);

  it("blog posts, classes, brokers, converter cargoes and Straits sections", () => {
    unique(getAllPosts().map((p) => p.slug));
    unique(TANKER_CLASSES.map((c) => c.slug));
    unique(LPG_CLASSES.map((c) => c.slug));
    unique(BROKERS.map((b) => b.name));
    unique(LPG_CARGO_DENSITY.map((c) => c.key));
    unique(STRAITS_SECTIONS.map((s) => s.id));
  });

  it("are reported by validateContent when they collide", async () => {
    const brokers = (await import("@/content/brokers.json")).default;
    const first = brokers.brokers[0];
    brokers.brokers.push(first);
    try {
      expect(validateContent()).toContainEqual(
        `content/brokers.json: duplicate broker short id "${first.name.slug}"`
      );
    } finally {
      brokers.brokers.pop();
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

  it("give every post an author, a body and cards that only hold plain data", () => {
    for (const p of getAllPosts()) {
      expect(p.author, p.slug).toBeDefined();
      expect(p.words, p.slug).toBeGreaterThan(50);
      expect(p.dateLabel).toMatch(/^\d{1,2} [A-Z][a-z]{2} \d{4}$/);
    }
  });

  it("keep the old Report shape for the pages that still list notes", () => {
    expect(REPORTS.length).toBeGreaterThan(0);
    for (const r of REPORTS) {
      expect(r.href).toBe(`/blog/${r.slug}`);
      expect(r.label.length).toBeGreaterThan(0);
    }
  });

  it("keep the Hormuz brief linked from route tables", () => {
    expect(HORMUZ_NOTE_PATH.startsWith("/blog/")).toBe(true);
    expect(getReportBySlug(HORMUZ_NOTE_PATH.replace("/blog/", ""))).toBeDefined();
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

  it("keep the legacy research category keys in step with lib/schemas", () => {
    expect([...REPORT_CATEGORIES].sort()).toEqual(
      ResearchCategorySchema.options.filter((c) => c !== "all").sort()
    );
  });
});
