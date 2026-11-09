import { readFileSync } from "node:fs";
import path from "node:path";
import { fields } from "@keystatic/core";
import { describe, expect, it } from "vitest";
import { blogComponents, keystaticConfig } from "@/keystatic.config";
import { BLOG_TAGS } from "@/lib/blog/markdoc";
import { getPosts } from "@/lib/blog/posts";
import { PAGES } from "@/lib/pages";
import { breadcrumbsLd, faqLd } from "@/lib/seo";
import sitemap from "@/app/sitemap";
import { llmsFullTxt, llmsTxt } from "@/lib/llms";
import {
  getAllGuides,
  getGuides,
  guideLanguages,
  guideLinksFor,
  translationOf,
  type Guide,
} from "./guides";
import { guideJsonLd, guidesHubJsonLd } from "./ld";
import { GUIDE_LINK_PATHS, GUIDES_DIR, GUIDES_PATH } from "./meta";
import { validateGuides } from "./validate";

const GUIDES = getAllGuides();
const SENTENCE = /[^.!?]+[.!?]+(?=\s|$)/g;

/** Every @type in a JSON-LD value, nested nodes included. */
function types(node: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(node)) node.forEach((n) => types(n, out));
  else if (node && typeof node === "object") {
    const t = (node as Record<string, unknown>)["@type"];
    if (typeof t === "string") out.add(t);
    Object.values(node).forEach((v) => types(v, out));
  }
  return out;
}

describe("guides content", () => {
  it("exist and pass the build-time checks", () => {
    expect(GUIDES.length).toBeGreaterThanOrEqual(8);
    expect(validateGuides()).toEqual([]);
  });

  it("have unique search titles (≤ 60) and descriptions (140–160), site-wide", () => {
    const titles = new Set(PAGES.map((p) => p.title));
    const descs = new Set<string>([...getPosts().map((p) => p.description)]);
    for (const g of GUIDES) {
      const title = g.seoTitle ?? g.title;
      expect(title.length, g.slug).toBeLessThanOrEqual(60);
      expect(g.description.length, g.slug).toBeGreaterThanOrEqual(140);
      expect(g.description.length, g.slug).toBeLessThanOrEqual(160);
      expect(titles.has(title), `${g.slug}: duplicate title`).toBe(false);
      expect(descs.has(g.description), `${g.slug}: duplicate description`).toBe(false);
      titles.add(title);
      descs.add(g.description);
    }
  });

  it("are the right length: guides 900–1,600 words, desk pages 600–900", () => {
    for (const g of GUIDES) {
      const [min, max] = g.kind === "guide" ? [900, 1600] : [600, 900];
      expect(g.words, g.slug).toBeGreaterThanOrEqual(min);
      expect(g.words, g.slug).toBeLessThanOrEqual(max);
    }
  });

  it("answer the query first, then ask question-style H2s, and close with a 4–6 question FAQ", () => {
    for (const g of GUIDES) {
      const first = g.ast.children[0];
      expect(first?.type, `${g.slug}: the body opens with a paragraph`).toBe("paragraph");
      const opening = g.text.split("\n\n")[0];
      expect(opening.match(SENTENCE)?.length ?? 0, g.slug).toBeLessThanOrEqual(3);
      const h2 = g.headings.filter((h) => h.level === 2);
      expect(h2.length, g.slug).toBeGreaterThanOrEqual(4);
      const questions = h2.filter((h) => h.text.trim().endsWith("?")).length;
      expect(questions / h2.length, `${g.slug}: question-style H2s`).toBeGreaterThanOrEqual(0.5);
      expect(g.faq.length, g.slug).toBeGreaterThanOrEqual(4);
      expect(g.faq.length, g.slug).toBeLessThanOrEqual(6);
    }
  });

  it("never mention the old brand", () => {
    for (const g of GUIDES) {
      const source = readFileSync(path.join(process.cwd(), g.file), "utf8");
      expect(/levanter/i.test(source), g.file).toBe(false);
    }
  });

  it("pair translations both ways, across languages only", () => {
    for (const g of getGuides()) {
      const other = translationOf(g);
      if (!other) {
        expect(guideLanguages(g), g.slug).toBeUndefined();
        continue;
      }
      expect(other.lang).not.toBe(g.lang);
      expect(translationOf(other)?.slug).toBe(g.slug);
      expect(guideLanguages(g)).toEqual({ [g.lang]: g.href, [other.lang]: other.href });
    }
    expect(getGuides().some((g) => g.lang === "tr")).toBe(true);
  });

  it("link from existing pages only through the known targets", () => {
    for (const g of GUIDES) for (const p of g.linkFrom) expect(GUIDE_LINK_PATHS).toContain(p);
    expect(guideLinksFor("/tankers").length).toBeGreaterThan(0);
    expect(guideLinksFor("/lpg").length).toBeGreaterThan(0);
  });
});

describe("guides JSON-LD", () => {
  const check = (g: Guide) => {
    const crumbs = breadcrumbsLd([
      { name: "Home", path: "/" },
      { name: "Guides", path: GUIDES_PATH },
      { name: g.title, path: g.href },
    ]);
    const data = [...guideJsonLd(g), faqLd(g.faq), crumbs];
    // Serialises cleanly (no undefined, no cycles) and round-trips.
    const json = JSON.stringify(data);
    expect(JSON.parse(json)).toEqual(JSON.parse(JSON.stringify(data)));
    for (const node of data)
      expect((node as Record<string, unknown>)["@context"]).toBe("https://schema.org");
    return data as Record<string, unknown>[];
  };

  it("describes each guide as a WebPage, an Article, a FAQPage and a BreadcrumbList", () => {
    for (const g of getGuides()) {
      const data = check(g);
      const found = types(data);
      for (const t of ["WebPage", "FAQPage", "BreadcrumbList", "Person"]) {
        expect(found.has(t), `${g.slug}: ${t}`).toBe(true);
      }
      expect(found.has(g.kind === "guide" ? "TechArticle" : "Article"), g.slug).toBe(true);
      expect(found.has("Service"), g.slug).toBe(g.kind === "landing");

      const [page, article] = data;
      expect(page.inLanguage).toBe(g.lang);
      expect(article.inLanguage).toBe(g.lang);
      expect(article.headline).toBe(g.title);
      expect(article.datePublished).toBe(g.published);
      expect(article.dateModified).toBe(g.updated);
      expect(article.wordCount).toBe(g.words);
      expect((article.author as Record<string, unknown>).name).toBe(g.author?.name);
      expect(String(article.url)).toMatch(new RegExp(`${g.href}$`));

      const faq = data.find((d) => d["@type"] === "FAQPage")!;
      const entities = faq.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
      expect(entities.map((e) => e.name)).toEqual(g.faq.map((f) => f.q));
      expect(entities.every((e) => e.acceptedAnswer.text.length > 0)).toBe(true);
    }
  });

  it("lists every guide on the hub", () => {
    const hub = guidesHubJsonLd(getGuides(), { title: "t", description: "d" });
    const list = hub[1] as { itemListElement: { position: number; url: string }[] };
    expect(list.itemListElement.map((i) => i.position)).toEqual(getGuides().map((_, i) => i + 1));
    expect(types(hub).has("CollectionPage")).toBe(true);
  });
});

describe("guides in the sitemap, llms.txt and the admin", () => {
  it("lists the hub and every guide in the sitemap, with hreflang for translated pairs", () => {
    const entries = sitemap();
    const byPath = new Map(entries.map((e) => [new URL(e.url).pathname, e]));
    expect(byPath.has(GUIDES_PATH)).toBe(true);
    for (const g of getGuides()) {
      const entry = byPath.get(g.href);
      expect(entry, g.slug).toBeDefined();
      const langs = entry?.alternates?.languages as Record<string, string> | undefined;
      if (translationOf(g)) {
        expect(Object.keys(langs ?? {}).sort()).toEqual(["en", "tr", "x-default"]);
      } else expect(langs, g.slug).toBeUndefined();
    }
  });

  it("puts every guide in llms.txt (link) and llms-full.txt (full text)", () => {
    const short = llmsTxt();
    const full = llmsFullTxt();
    for (const g of getGuides()) {
      expect(short).toContain(g.href);
      expect(full).toContain(g.href);
      expect(full).toContain(g.text.slice(0, 120));
    }
  });

  it("is editable in Keystatic with the blog's body components", () => {
    const config = keystaticConfig("local");
    const guides = config.collections?.guides;
    expect(guides?.path).toBe(`${GUIDES_DIR}/*`);
    const keystatic = fields.markdoc.createMarkdocConfig({ components: blogComponents }).tags ?? {};
    expect(Object.keys(BLOG_TAGS).sort()).toEqual(Object.keys(keystatic).sort());
    expect(Object.values(config.ui?.navigation ?? {}).flat()).toContain("guides");
  });
});
