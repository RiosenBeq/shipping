import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { AI_AGENTS } from "@/lib/crawlers";
import { llmsFullTxt, llmsTxt } from "@/lib/llms";
import { PAGES } from "@/lib/pages";
import { shareCards, shareImageFor } from "@/lib/og-cards";
import { SOCIAL_PROFILES, siteConfig } from "@/lib/site";
import { BROKERS, getBroker } from "@/lib/data/brokers";
import { GLOSSARY_TERMS } from "@/lib/data/glossary";
import { LPG_CLASSES } from "@/lib/data/lpg-classes";
import { REPORTS, reportSlug } from "@/lib/data/research";
import { REPORT_BODIES } from "@/lib/data/research-bodies";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { articleLd, buildPageMetadata, localBusinessLd, organizationLd } from "@/lib/seo";

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

describe("previews and builds without a real origin", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("are noindex and closed to every crawler", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_INDEXABLE", "false");
    vi.resetModules();
    const { default: closedRobots } = await import("@/app/robots");
    const { rootMetadata } = await import("@/lib/root-metadata");
    expect(closedRobots()).toEqual({ rules: [{ userAgent: "*", disallow: "/" }] });
    expect(rootMetadata.robots).toMatchObject({ index: false, googleBot: { index: false } });
  });

  it("production with a real origin is indexable", async () => {
    const { rootMetadata } = await import("@/lib/root-metadata");
    expect(siteConfig.url).toBe("https://shipbroker.example");
    expect(rootMetadata.robots).toMatchObject({ index: true });
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
  it("publishes only verified social profiles", () => {
    const verified = SOCIAL_PROFILES.filter((p) => p.verified).map((p) => p.url);
    const org = organizationLd() as { sameAs?: string[] };
    expect(org.sameAs ?? []).toEqual(verified);
    const twitter = buildPageMetadata({ title: "t", description: "d", path: "/" }).twitter as {
      site?: string;
    };
    if (!SOCIAL_PROFILES.some((p) => p.verified && p.handle)) expect(twitter.site).toBeUndefined();
  });

  it("keeps unconfirmed contact details out of the markup", async () => {
    const { COMPANY_DETAILS_CONFIRMED } = await import("@/lib/site");
    const json = JSON.stringify(organizationLd());
    if (COMPANY_DETAILS_CONFIRMED) {
      expect(localBusinessLd()).not.toBeNull();
    } else {
      expect(localBusinessLd()).toBeNull();
      expect(json).not.toContain(siteConfig.phone);
      expect(json).not.toContain(siteConfig.email);
      expect(json).not.toContain(siteConfig.address.street);
    }
  });

  it("uses a logo large enough for Google (≥ 112 px)", () => {
    const logo = organizationLd().logo as { width: number; height: number };
    expect(logo.width).toBeGreaterThanOrEqual(112);
    expect(logo.height).toBeGreaterThanOrEqual(112);
  });

  it("credits research notes to a person only once the broker is verified", () => {
    const r = REPORTS[0];
    const broker = getBroker(r.author)!;
    const ld = (author: typeof broker) =>
      articleLd({
        title: r.title,
        description: r.desc,
        path: `/research/${r.slug}`,
        datePublished: "2026-10-16",
        section: r.catLabel,
        author,
        text: "one two three",
      });
    expect(ld({ ...broker, verified: false }).author).toEqual({
      "@id": `${siteConfig.url}#organization`,
    });
    expect(ld({ ...broker, verified: true }).author).toMatchObject({
      "@type": "Person",
      name: r.author,
    });
    expect(ld(broker).wordCount).toBe(3);
    expect(ld(broker).image.url).toBe(abs(`/og/research/${r.slug}`));
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

  it("contains every note and glossary term", () => {
    for (const r of REPORTS) expect(txt).toContain(`### ${r.title}`);
    for (const t of GLOSSARY_TERMS) expect(txt).toContain(`**${t.term}**`);
  });

  it("names only verified brokers in the team list and bylines", () => {
    const team = txt.slice(txt.indexOf("## Team"), txt.indexOf("## Working with"));
    for (const b of BROKERS) {
      if (b.verified) expect(team).toContain(b.name);
      else {
        expect(team).not.toContain(b.name);
        expect(txt).not.toContain(`by ${b.name}`);
      }
    }
  });

  it("has no unrendered placeholders", () => {
    expect(txt).not.toMatch(/undefined|\[object Object\]/);
  });
});
