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
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { getPosts } from "@/lib/blog/posts";
import { BLOG_CATEGORIES, categoryPath, shareImagePath } from "@/lib/blog/meta";
import { bodyLinks } from "@/lib/blog/markdoc";
import {
  articleLd,
  blogLd,
  blogPostingLd,
  breadcrumbsLd,
  buildPageMetadata,
  organizationLd,
} from "@/lib/seo";
import { rootMetadata } from "@/lib/root-metadata";
import { companyFacts } from "@/lib/facts";

const abs = (path: string) => new URL(path, siteConfig.url).toString();
const POSTS = getPosts();
const postPaths = POSTS.map((p) => p.href);
const classPaths = [
  ...TANKER_CLASSES.map((t) => `/tankers/${t.slug}`),
  ...LPG_CLASSES.map((c) => `/lpg/${c.slug}`),
];

describe("feed autodiscovery", () => {
  it("every page's metadata and the root point to the blog feed", () => {
    const feed = { url: "/blog/feed.xml", title: `${siteConfig.name} Blog` };
    const page = buildPageMetadata({ title: "T", description: "D", path: "/tankers" });
    expect(page.alternates?.types?.["application/rss+xml"]).toEqual([feed]);
    expect(rootMetadata.alternates?.types?.["application/rss+xml"]).toEqual([feed]);
  });
});

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

  it("lists every page, class guide, blog post and category once", () => {
    const categories = BLOG_CATEGORIES.filter((c) => POSTS.some((p) => p.category.slug === c));
    for (const path of [
      ...PAGES.map((p) => p.path),
      ...classPaths,
      ...postPaths,
      ...categories.map(categoryPath),
    ]) {
      expect(urls).toContain(abs(path));
    }
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.some((u) => u.includes("/research"))).toBe(false);
  });

  it("dates each post by its last revision", () => {
    const entries = sitemap();
    for (const p of POSTS) {
      const e = entries.find((x) => x.url === abs(p.href));
      expect(e?.lastModified, p.slug).toEqual(new Date(`${p.updated ?? p.date}T00:00:00Z`));
    }
  });
});

describe("blog posts", () => {
  it("have unique slugs, a body and a real author", () => {
    expect(new Set(POSTS.map((p) => p.slug)).size).toBe(POSTS.length);
    for (const p of POSTS) {
      expect(p.words, p.slug).toBeGreaterThan(50);
      expect(getBroker(p.author?.name ?? ""), p.slug).toBeDefined();
    }
  });

  it("keep search titles and descriptions within snippet length", () => {
    for (const p of POSTS) {
      expect((p.seoTitle ?? p.title).length, p.slug).toBeLessThanOrEqual(60);
      expect(p.description.length, p.slug).toBeLessThanOrEqual(160);
      expect(p.description.length, p.slug).toBeGreaterThanOrEqual(140);
    }
  });

  it("only link to pages that exist (never to /research)", () => {
    const known = new Set([
      ...PAGES.map((p) => p.path),
      ...classPaths,
      ...postPaths,
      ...BLOG_CATEGORIES.map(categoryPath),
    ]);
    for (const p of POSTS) {
      for (const href of bodyLinks(p.ast)) {
        if (href.startsWith("/"))
          expect(known.has(href.split("#")[0]), `${p.slug} → ${href}`).toBe(true);
      }
    }
  });
});

describe("share images", () => {
  it("exist for every primary page, class guide and note", () => {
    const cards = shareCards();
    const primary = PAGES.filter((p) => p.group === "primary").map((p) => p.path);
    for (const path of [...primary.filter((p) => p !== "/blog"), ...classPaths]) {
      expect(cards[path], path).toBeDefined();
    }
    // Blog pages have their own type-set share cards (app/(site)/blog/**/og.png).
    expect(shareImagePath("td7")).toBe("/blog/td7/og.png");
    expect(shareImageFor("/")).toBe("/og/home");
    expect(shareImageFor("/tankers/vlcc")).toBe("/og/tankers/vlcc");
    // The retired /research cards are gone (the blog has its own).
    expect(Object.keys(cards).some((k) => k.startsWith("/research"))).toBe(false);
  });
});

describe("structured data", () => {
  it("uses a logo large enough for Google (≥ 112 px)", () => {
    const logo = organizationLd().logo as { width: number; height: number };
    expect(logo.width).toBeGreaterThanOrEqual(112);
    expect(logo.height).toBeGreaterThanOrEqual(112);
  });

  it("credits blog posts to a person, with the post's share card as image", () => {
    const p = POSTS[0];
    const ld = blogPostingLd({
      title: p.title,
      description: p.description,
      path: p.href,
      date: p.date,
      updated: p.updated,
      section: p.category.label,
      author: p.author,
      text: "one two three",
      image: shareImagePath(p.slug),
    });
    expect(ld["@type"]).toBe("BlogPosting");
    expect(ld.author).toMatchObject({
      "@type": "Person",
      name: p.author?.name,
      "@id": abs(`/brokers#${p.author?.id}`),
    });
    expect(ld.wordCount).toBe(3);
    expect(ld.image.url).toBe(abs(`/blog/${p.slug}/og.png`));
    expect(ld.datePublished).toBe(`${p.date}T00:00:00.000Z`);
    expect(ld.isPartOf).toEqual({ "@id": abs("/blog#blog") });
  });

  it("describes the blog as a Blog listing its posts", () => {
    const ld = blogLd({
      path: "/blog",
      name: "OBM Shipping Blog",
      description: "x",
      posts: POSTS.slice(0, 2).map((p) => ({ title: p.title, path: p.href, date: p.date })),
    });
    expect(ld["@type"]).toBe("Blog");
    expect(ld.blogPost).toHaveLength(2);
    expect(ld.blogPost[0]).toMatchObject({ "@type": "BlogPosting", url: abs(POSTS[0].href) });
  });

  it("builds breadcrumbs with absolute URLs", () => {
    const ld = breadcrumbsLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
    ]);
    expect(ld.itemListElement[1]).toMatchObject({ position: 2, item: abs("/blog") });
  });

  it("keeps articleLd for the long-read guides", () => {
    const ld = articleLd({
      title: "Turkish Straits",
      description: "x",
      path: "/turkish-straits",
      datePublished: "2026-10-16",
      section: "Guide",
      author: getBroker(BROKERS[0].name),
    });
    expect(ld.author).toMatchObject({ "@type": "Person", name: BROKERS[0].name });
  });
});

describe("llms.txt", () => {
  const txt = llmsTxt();

  it("follows the llmstxt.org shape: H1, then a blockquote summary", () => {
    const lines = txt.split("\n");
    expect(lines[0]).toBe(`# ${siteConfig.name}`);
    expect(lines[2].startsWith("> ")).toBe(true);
  });

  it("links every primary page, class guide and blog post", () => {
    const primary = PAGES.filter((p) => p.group === "primary").map((p) => p.path);
    for (const path of [...primary.filter((p) => p !== "/"), ...classPaths, ...postPaths]) {
      expect(txt, path).toContain(`](${abs(path)})`);
    }
    expect(txt).toContain(abs("/llms-full.txt"));
    expect(txt).toContain(abs("/blog/feed.xml"));
    expect(txt).not.toContain("/research");
  });
});

describe("llms-full.txt", () => {
  const txt = llmsFullTxt();

  it("contains every post (full text), glossary term and broker", () => {
    for (const p of POSTS) {
      expect(txt).toContain(`### ${p.title}`);
      expect(txt).toContain(p.text.slice(0, 200));
    }
    for (const t of GLOSSARY_TERMS) expect(txt).toContain(`**${t.term}**`);
    for (const b of BROKERS) expect(txt).toContain(b.name);
  });

  it("has no unrendered placeholders", () => {
    expect(txt).not.toMatch(/undefined|\[object Object\]/);
  });
});

describe("brand and GEO facts", () => {
  const org = organizationLd() as Record<string, unknown>;

  it("names the company OBM Shipping everywhere crawlers and AI engines look", () => {
    expect(siteConfig.name).toBe("OBM Shipping");
    expect(siteConfig.wordmark).toBe("OBM SHIPPING");
    expect(org.name).toBe("OBM Shipping");
    expect(rootMetadata.title).toMatchObject({ template: "%s · OBM Shipping" });
    for (const text of [llmsTxt(), llmsFullTxt(), JSON.stringify(org)]) {
      expect(text).not.toMatch(/levanter/i);
    }
  });

  it("takes every absolute URL from the one site origin", () => {
    expect(siteConfig.url).not.toMatch(/\/$/);
    expect(org.url).toBe(siteConfig.url);
    expect(robots().sitemap).toBe(`${siteConfig.url}/sitemap.xml`);
  });

  it("lists sameAs only for social profiles that exist (no invented profiles)", () => {
    const filled = Object.values(siteConfig.socials).filter(Boolean);
    if (filled.length) expect(org.sameAs).toEqual(filled);
    else expect(org).not.toHaveProperty("sameAs");
    expect(org).not.toHaveProperty("aggregateRating");
    expect(org).not.toHaveProperty("review");
  });

  it("has a contact point per desk and the offices as locations", () => {
    const emails = (org.contactPoint as { email?: string }[]).map((c) => c.email);
    for (const desk of Object.values(siteConfig.desks)) expect(emails).toContain(desk.email);
    const places = org.location as { address: { addressLocality: string } }[];
    expect(places.map((p) => p.address.addressLocality)).toEqual(
      siteConfig.offices.map((o) => o.city)
    );
  });

  it("keeps lab and admin routes out of crawls and welcomes the AI crawlers", () => {
    const rules = [robots().rules].flat();
    for (const rule of rules) {
      expect([rule.disallow ?? []].flat()).toEqual(
        expect.arrayContaining(["/api/", "/keystatic", "/stage-lab"])
      );
    }
    for (const bot of ["ChatGPT-User", "Claude-SearchBot", "Applebot-Extended", "CCBot"]) {
      expect(AI_AGENTS).toContain(bot);
    }
  });

  it("repeats the /about fact sheet word for word in llms.txt and llms-full.txt", () => {
    const facts = companyFacts();
    expect(facts.length).toBeGreaterThanOrEqual(5);
    for (const f of facts) {
      expect(llmsTxt()).toContain(f.a);
      expect(llmsFullTxt()).toContain(f.a);
    }
    expect(facts.map((f) => f.a).join(" ")).toContain(siteConfig.address.street);
  });
});
