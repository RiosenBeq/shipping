import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { AI_AGENTS } from "@/lib/crawlers";
import { llmsFullTxt, llmsTxt } from "@/lib/llms";
import { PAGES } from "@/lib/pages";
import { shareCards, shareImageFor } from "@/lib/og-cards";
import { siteConfig } from "@/lib/site";
import { BROKERS, getBroker } from "@/lib/data/brokers";
import { GLOSSARY_TERMS } from "@/lib/data/glossary";
import { LPG_CLASSES } from "@/lib/data/lpg-classes";
import { REPORTS, reportSlug } from "@/lib/data/research";
import { REPORT_BODIES } from "@/lib/data/research-bodies";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { articleLd, organizationLd } from "@/lib/seo";

const abs = (path: string) => new URL(path, siteConfig.url).toString();
const reportPaths = REPORTS.map((r) => `/research/${reportSlug(r)}`);
const classPaths = [
  ...TANKER_CLASSES.map((t) => `/tankers/${t.slug}`),
  ...LPG_CLASSES.map((c) => `/lpg/${c.slug}`),
];

describe("robots.txt", () => {
  const r = robots();
  const rules = Array.isArray(r.rules) ? r.rules : [r.rules];

  it("never blocks /_next/ (Google needs the CSS and JS to render pages)", () => {
    for (const rule of rules) {
      expect([rule.disallow ?? []].flat()).not.toContain("/_next/");
    }
  });

  it("names the main AI search and assistant crawlers and allows them", () => {
    for (const bot of [
      "GPTBot",
      "OAI-SearchBot",
      "ClaudeBot",
      "PerplexityBot",
      "Google-Extended",
    ]) {
      expect(AI_AGENTS).toContain(bot);
    }
    const ai = rules.find((x) => Array.isArray(x.userAgent));
    expect(ai?.allow).toBe("/");
  });

  it("points to the sitemap", () => {
    expect(r.sitemap).toBe(`${siteConfig.url}/sitemap.xml`);
  });
});

describe("sitemap.xml", () => {
  const urls = sitemap().map((e) => e.url);

  it("lists every page, class guide and research note once", () => {
    for (const path of [...PAGES.map((p) => p.path), ...classPaths, ...reportPaths]) {
      expect(urls).toContain(abs(path));
    }
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe("research notes", () => {
  it("have unique slugs, a body and a real author", () => {
    expect(new Set(REPORTS.map((r) => r.slug)).size).toBe(REPORTS.length);
    for (const r of REPORTS) {
      expect(REPORT_BODIES[r.slug], r.slug).toBeDefined();
      expect(getBroker(r.author), `${r.slug}: ${r.author}`).toBeDefined();
    }
  });

  it("keep search titles and descriptions within snippet length", () => {
    for (const r of REPORTS) {
      expect((r.seoTitle ?? r.title).length, r.slug).toBeLessThanOrEqual(60);
      expect(r.desc.length, r.slug).toBeLessThanOrEqual(160);
    }
  });

  it("only link to pages that exist", () => {
    const known = new Set([...PAGES.map((p) => p.path), ...classPaths, ...reportPaths]);
    for (const [slug, body] of Object.entries(REPORT_BODIES)) {
      for (const b of body.blocks) {
        if (b.kind === "callout" && b.link) expect(known.has(b.link.href), slug).toBe(true);
      }
    }
  });
});

describe("share images", () => {
  it("exist for every primary page, class guide and note", () => {
    const cards = shareCards();
    const primary = PAGES.filter((p) => p.group === "primary").map((p) => p.path);
    for (const path of [...primary, ...classPaths, ...reportPaths]) {
      expect(cards[path], path).toBeDefined();
    }
    expect(shareImageFor("/")).toBe("/og/home");
    expect(shareImageFor("/tankers/vlcc")).toBe("/og/tankers/vlcc");
  });
});

describe("structured data", () => {
  it("uses a logo large enough for Google (≥ 112 px)", () => {
    const logo = organizationLd().logo as { width: number; height: number };
    expect(logo.width).toBeGreaterThanOrEqual(112);
    expect(logo.height).toBeGreaterThanOrEqual(112);
  });

  it("credits research notes to a person", () => {
    const r = REPORTS[0];
    const ld = articleLd({
      title: r.title,
      description: r.desc,
      path: `/research/${r.slug}`,
      datePublished: "2026-10-16",
      section: r.catLabel,
      author: getBroker(r.author),
      text: "one two three",
    });
    expect(ld.author).toMatchObject({ "@type": "Person", name: r.author });
    expect(ld.wordCount).toBe(3);
    expect(ld.image.url).toBe(abs(`/og/research/${r.slug}`));
  });
});

describe("llms.txt", () => {
  const txt = llmsTxt();

  it("follows the llmstxt.org shape: H1, then a blockquote summary", () => {
    const lines = txt.split("\n");
    expect(lines[0]).toBe(`# ${siteConfig.name}`);
    expect(lines[2].startsWith("> ")).toBe(true);
  });

  it("links every primary page, class guide and note", () => {
    const primary = PAGES.filter((p) => p.group === "primary").map((p) => p.path);
    for (const path of [...primary.filter((p) => p !== "/"), ...classPaths, ...reportPaths]) {
      expect(txt, path).toContain(`](${abs(path)})`);
    }
    expect(txt).toContain(abs("/llms-full.txt"));
  });
});

describe("llms-full.txt", () => {
  const txt = llmsFullTxt();

  it("contains every note, glossary term and broker", () => {
    for (const r of REPORTS) expect(txt).toContain(`### ${r.title}`);
    for (const t of GLOSSARY_TERMS) expect(txt).toContain(`**${t.term}**`);
    for (const b of BROKERS) expect(txt).toContain(b.name);
  });

  it("has no unrendered placeholders", () => {
    expect(txt).not.toMatch(/undefined|\[object Object\]/);
  });
});
