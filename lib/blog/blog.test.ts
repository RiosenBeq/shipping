import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import Markdoc from "@markdoc/markdoc";
import { load } from "js-yaml";
import { fields } from "@keystatic/core";
import { blogComponents, keystaticConfig } from "@/keystatic.config";
import { postFrontmatterSchema } from "@/lib/content/schemas";
import { BLOG_RESERVED_SLUGS, HORMUZ_NOTE_SLUG, SLUG_PATTERN } from "@/lib/content/options";
import { validatePosts } from "@/lib/content/validate";
import { contourPaths, coverSvg, mastheadSvg } from "./cover";
import { blogFeedXml } from "./feed";
import {
  dumpFrontmatter,
  legacyBodySource,
  legacyBodyText,
  legacyNoteToPostFile,
  migrateHref,
  tagCase,
  type LegacyFile,
} from "./legacy";
import { BLOG_TAGS, bodyHtml, bodyLinks, bodyText, parseMarkdoc, validateBody } from "./markdoc";
import {
  BLOG_CATEGORIES,
  CATEGORY_INFO,
  formatPostDate,
  listingPath,
  paginate,
  postPath,
} from "./meta";
import {
  adjacentPosts,
  buildPost,
  getAllPosts,
  getPosts,
  latestPostCards,
  parsePostFile,
  relatedPosts,
  seedFromSlug,
  toCard,
} from "./posts";
import legacyFile from "./__fixtures__/research-legacy.json";

const ROOT = path.resolve(__dirname, "../..");
const LEGACY = legacyFile as LegacyFile;
const POSTS = getAllPosts();
const bySlug = new Map(POSTS.map((p) => [p.slug, p]));

describe("migration from the research notes (November 2026)", () => {
  it("moved all 13 notes, slugs unchanged", () => {
    expect(LEGACY.notes).toHaveLength(13);
    for (const note of LEGACY.notes) expect(bySlug.has(note.slug), note.slug).toBe(true);
  });

  it("kept every word: the rendered text of each post equals the note's", () => {
    for (const note of LEGACY.notes) {
      const post = bySlug.get(note.slug)!;
      expect(post.text, note.slug).toBe(legacyBodyText(note));
      expect(post.title, note.slug).toBe(note.title);
      expect(post.dek, note.slug).toBe(note.dek);
      expect(post.description, note.slug).toBe(note.desc);
      expect(post.seoTitle, note.slug).toBe(note.seoTitle);
    }
  });

  it("kept the metadata: dates, author, desk, gating, reading time", () => {
    for (const note of LEGACY.notes) {
      const post = bySlug.get(note.slug)!;
      expect(post.date).toBe(note.date);
      expect(post.updated).toBe(note.updated);
      expect(post.author?.name).toBe(note.author);
      expect(post.desk).toBe(note.desk);
      expect(post.gated).toBe(note.gated);
      expect(post.readingTime).toBe(note.read);
      expect(CATEGORY_INFO[post.category.slug].legacy).toBe(note.cat);
      expect(post.tags.map((t) => t.toUpperCase()).join(" · ")).toBe(note.label);
    }
  });

  it("kept every callout link, moved from /research to /blog", () => {
    for (const note of LEGACY.notes) {
      const before = note.blocks.flatMap((b) =>
        b.discriminant === "callout" && b.value.linkHref ? [migrateHref(b.value.linkHref)] : []
      );
      expect(bodyLinks(bySlug.get(note.slug)!.ast), note.slug).toEqual(before);
    }
    expect(migrateHref("/research/td7")).toBe("/blog/td7");
    expect(migrateHref("/research")).toBe("/blog");
    expect(migrateHref("/researchers")).toBe("/researchers");
  });

  it("writes bodies in the canonical Markdoc form (what Keystatic saves)", () => {
    for (const note of LEGACY.notes) {
      const src = legacyBodySource(note);
      expect(Markdoc.format(Markdoc.parse(src)), note.slug).toBe(src);
    }
  });

  it("is reproducible: the script's output for a note is what is on disk, cover aside", () => {
    // Re-run the conversion and compare the parts the script owns (body, frontmatter keys).
    for (const note of LEGACY.notes) {
      const file = readFileSync(path.join(ROOT, "content/blog", `${note.slug}.mdoc`), "utf8");
      const [, fm, body] = file.match(/^---\n([\s\S]*?)---\n([\s\S]*)$/)!;
      const regenerated = legacyNoteToPostFile(note, bySlug.get(note.slug)!.author!.id, {
        cover: { code: "X" },
        keyTakeaways: [],
      });
      expect(regenerated.endsWith(body), note.slug).toBe(true);
      const keys = (s: string) => Object.keys(load(s) as object);
      expect(keys(fm)).toEqual(keys(regenerated.match(/^---\n([\s\S]*?)---\n/)![1]));
    }
  });

  it("sentence-cases card tags but keeps codes", () => {
    expect(tagCase("WAR RISK")).toBe("War risk");
    expect(tagCase("LPG")).toBe("LPG");
    expect(tagCase("TD20 / TD6")).toBe("TD20 / TD6");
    expect(tagCase("EU ETS")).toBe("EU ETS");
    expect(tagCase("POST-FIXTURE")).toBe("Post-fixture");
  });
});

describe("post files", () => {
  it("are valid: frontmatter schema, Markdoc body, authors, dates, images", () => {
    expect(validatePosts()).toEqual([]);
  });

  it("have frontmatter exactly as Keystatic writes it (js-yaml dump, schema key order)", () => {
    const order = Object.keys(keystaticConfig("local").collections.posts.schema).filter(
      (k) => k !== "body"
    );
    for (const p of POSTS) {
      const file = readFileSync(path.join(ROOT, p.file), "utf8");
      const [, fm, body] = file.match(/^---\n([\s\S]*?)---\n([\s\S]*)$/)!;
      const data = parsePostFile(file).data as Record<string, unknown>;
      expect(dumpFrontmatter(data), p.file).toBe(fm);
      const keys = Object.keys(data);
      expect(keys, p.file).toEqual(order.filter((k) => keys.includes(k)));
      expect(Markdoc.format(Markdoc.parse(body)), p.file).toBe(body);
      expect(postFrontmatterSchema.safeParse(data).success, p.file).toBe(true);
    }
  });

  it("use URL-safe slugs that do not shadow /blog routes", () => {
    for (const p of POSTS) {
      expect(p.slug).toMatch(SLUG_PATTERN);
      expect(BLOG_RESERVED_SLUGS as readonly string[]).not.toContain(p.slug);
    }
    expect(bySlug.has(HORMUZ_NOTE_SLUG)).toBe(true);
  });

  it("flag a reserved slug, an unknown author and a bad date", () => {
    const good = readFileSync(path.join(ROOT, POSTS[0].file), "utf8");
    const bad = good
      .replace(/^author: .*$/m, "author: nobody-here")
      .replace(/^date: .*$/m, "date: '2026-13-40'");
    const parsed = postFrontmatterSchema.safeParse(parsePostFile(bad).data);
    expect(parsed.success).toBe(false);
  });
});

describe("Markdoc components", () => {
  it("match the Keystatic editor's components (same tags and attributes)", () => {
    const keystatic = fields.markdoc.createMarkdocConfig({ components: blogComponents }).tags ?? {};
    expect(Object.keys(BLOG_TAGS).sort()).toEqual(Object.keys(keystatic).sort());
    for (const [name, schema] of Object.entries(BLOG_TAGS)) {
      expect(Object.keys(schema.attributes ?? {}).sort(), name).toEqual(
        Object.keys(keystatic[name].attributes ?? {}).sort()
      );
      expect(Boolean(schema.selfClosing), name).toBe(Boolean(keystatic[name].selfClosing));
    }
  });

  it("render callouts, pull quotes, captioned tables and figures", () => {
    const ast = parseMarkdoc(`Intro.

{% callout label="Desk note" linkHref="/compliance" linkLabel="How we screen" %}
Some text.
{% /callout %}

{% pullQuote quote="Port time costs more than freight." attribution="Ahmed El-Sayed" /%}

{% routeTable caption="Who pays" %}
{% table %}
* Item
* Voyage
---
* Bunkers
* Owner
{% /table %}
{% /routeTable %}

{% figure image="/images/blog/x/figure.png" alt="A tanker" caption="At anchor" /%}
`);
    expect(validateBody(ast)).toEqual([]);
    const html = bodyHtml(ast);
    expect(html).toContain('<div class="bl-callout" role="note">');
    expect(html).toContain('<a href="/compliance">How we screen</a>');
    expect(html).toContain("<blockquote><p>Port time costs more than freight.</p></blockquote>");
    expect(html).toContain("<caption>Who pays</caption>");
    expect(html).toContain('<th scope="col">Item</th>');
    expect(html).toContain('<th scope="row">Bunkers</th>');
    expect(html).toContain('<img src="/images/blog/x/figure.png" alt="A tanker" loading="lazy"');
    expect(bodyText(ast)).toContain("Desk note: Some text.");
    expect(bodyText(ast)).toContain("| Bunkers | Owner |");
  });

  it("reject unknown tags and missing attributes", () => {
    expect(validateBody(parseMarkdoc("{% shout %}x{% /shout %}"))).not.toEqual([]);
    expect(validateBody(parseMarkdoc('{% figure alt="x" /%}'))).not.toEqual([]);
  });

  it("give headings unique anchors", () => {
    const source = readFileSync(path.join(ROOT, POSTS[0].file), "utf8").replace(
      /---\n[\s\S]*$/,
      (m) => m.split("\n---\n")[0] + "\n---\n## Costs\n\nx\n\n## Costs\n\ny\n"
    );
    const post = buildPost("t", source);
    expect(post.headings.map((h) => h.id)).toEqual(["costs", "costs-2"]);
    expect(bodyHtml(post.ast)).toContain('<h2 id="costs-2">Costs</h2>');
  });
});

describe("queries", () => {
  const published = getPosts();

  it("list published posts newest first", () => {
    const dates = published.map((p) => p.date);
    expect(dates).toEqual([...dates].sort().reverse());
    expect(published.every((p) => !p.draft)).toBe(true);
  });

  it("find related posts and neighbours, never the post itself", () => {
    for (const p of published) {
      const related = relatedPosts(p);
      expect(related).toHaveLength(Math.min(3, published.length - 1));
      expect(related.map((r) => r.slug)).not.toContain(p.slug);
    }
    expect(adjacentPosts(published[0]).newer).toBeUndefined();
    expect(adjacentPosts(published[0]).older?.slug).toBe(published[1].slug);
    expect(adjacentPosts(published.at(-1)!).older).toBeUndefined();
  });

  it("give the homepage strip serialisable cards", () => {
    const cards = latestPostCards(3);
    expect(cards).toHaveLength(3);
    expect(JSON.parse(JSON.stringify(cards))).toEqual(cards);
    expect(cards[0]).not.toHaveProperty("ast");
    expect(latestPostCards(3, "lpg").every((c) => c.desk === "lpg" || c.desk === "both")).toBe(
      true
    );
    expect(toCard(published[0]).href).toBe(postPath(published[0].slug));
  });

  it("paginate 12 to a page (the hub's first page adds the featured post)", () => {
    const items = Array.from({ length: 30 }, (_, i) => i);
    expect(paginate(items, 1)).toMatchObject({ page: 1, pages: 3, items: items.slice(0, 12) });
    expect(paginate(items, 3).items).toEqual(items.slice(24));
    expect(paginate([], 1).pages).toBe(1);
    expect(paginate(items, 99).page).toBe(3);
    expect(listingPath(1)).toBe("/blog");
    expect(listingPath(2)).toBe("/blog/page/2");
    expect(listingPath(2, "news")).toBe("/blog/category/news/page/2");
  });

  it("cover every category with a label and description", () => {
    for (const c of BLOG_CATEGORIES) {
      expect(CATEGORY_INFO[c].label.length).toBeGreaterThan(0);
      expect(CATEGORY_INFO[c].description.length).toBeLessThanOrEqual(160);
    }
    expect(formatPostDate("2026-10-16")).toBe("16 Oct 2026");
  });
});

describe("RSS feed (/blog/feed.xml)", () => {
  const xml = blogFeedXml(getPosts());

  it("is RSS 2.0 with every post, full text, absolute links", () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"')).toBe(true);
    expect(xml).toContain('<atom:link href="https://');
    for (const p of getPosts()) {
      expect(xml).toContain(`<guid isPermaLink="true">`);
      expect(xml).toContain(`/blog/${p.slug}</link>`);
    }
    expect(xml.match(/<item>/g)).toHaveLength(getPosts().length);
    expect(xml.match(/<content:encoded>/g)).toHaveLength(getPosts().length);
    expect(xml).not.toMatch(/href="\/(?!\/)/);
    expect(xml).not.toContain("/research");
  });

  it("is well formed (escaped text, balanced CDATA)", () => {
    const outside = xml.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "");
    expect(outside).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)/);
    expect((xml.match(/<item>/g) ?? []).length).toBe((xml.match(/<\/item>/g) ?? []).length);
  });
});

describe("redirects from /research (next.config.mjs)", () => {
  it("are permanent (308) and keep the slugs", async () => {
    const mod = await import(pathToFileURL(path.join(ROOT, "next.config.mjs")).href);
    const redirects = (await mod.default.redirects()) as {
      source: string;
      destination: string;
      permanent: boolean;
    }[];
    const find = (source: string) => redirects.find((r) => r.source === source);
    expect(find("/research")).toEqual({
      source: "/research",
      destination: "/blog",
      permanent: true,
    });
    expect(find("/research/:slug")).toEqual({
      source: "/research/:slug",
      destination: "/blog/:slug",
      permanent: true,
    });
    expect(find("/research/feed.xml")?.destination).toBe("/blog/feed.xml");
    // The feed rule comes before the slug rule, and no redirect points at /research.
    const order = redirects.map((r) => r.source);
    expect(order.indexOf("/research/feed.xml")).toBeLessThan(order.indexOf("/research/:slug"));
    expect(redirects.filter((r) => r.destination.startsWith("/research"))).toEqual([]);
    expect(
      redirects.filter((r) => r.source.startsWith("/research")).every((r) => r.permanent)
    ).toBe(true);
  });
});

describe("type-set covers", () => {
  it("are deterministic per seed, and seeds are stable per slug", () => {
    expect(coverSvg(42)).toBe(coverSvg(42));
    expect(coverSvg(42)).not.toBe(coverSvg(43));
    expect(seedFromSlug("td7")).toBe(seedFromSlug("td7"));
    expect(seedFromSlug("td7")).toBeGreaterThanOrEqual(1);
    expect(seedFromSlug("td7")).toBeLessThanOrEqual(9999);
  });

  it("produce valid, light SVG path data", () => {
    const { minor, index } = contourPaths({ seed: 3, width: 400, height: 250, step: 10 });
    expect(minor).toMatch(/^M\d/);
    expect(index).toMatch(/^M\d/);
    expect(minor).not.toMatch(/l(M|$)/);
    expect(coverSvg(7).length).toBeLessThan(60_000);
    expect(mastheadSvg()).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  });
});
