import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { PAGES } from "@/lib/pages";
import { getPosts, type Post } from "@/lib/blog/posts";
import { BLOG_CATEGORIES, categoryPath } from "@/lib/blog/meta";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { LPG_CLASSES } from "@/lib/data/lpg-classes";
import { LOCALES, homeLanguages } from "@/lib/i18n";
import { assertValidContent } from "@/lib/content/validate";
import { FREIGHT_DATA } from "@/lib/content/freight";
import { FREIGHT_PATH } from "@/lib/freight/constants";
import { getGuides, guideLanguages, guidesUpdated } from "@/lib/guides/guides";
import { GUIDES_PATH } from "@/lib/guides/meta";
import { assertValidGuides } from "@/lib/guides/validate";

/** siteConfig.contentUpdated: bumped when content changes, not a fake "now" per build. */
const CONTENT_UPDATED = new Date(siteConfig.contentUpdated);

const url = (path: string) => new URL(path, siteConfig.url).toString();

/**
 * Public pages only: the content admin (/keystatic) and its API are never
 * listed. The sitemap is generated at build time, so it is also where the
 * content in content/*.json is checked: an admin edit that breaks a rule
 * fails the build instead of reaching the live site (see docs/CMS.md).
 * Blog posts carry their own lastmod (updated, else published).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  assertValidContent();
  assertValidGuides();

  // The 11 homepages point at each other, plus x-default (the English home), as in their <head>.
  const homeAlternates = {
    ...Object.fromEntries(Object.entries(homeLanguages()).map(([lang, path]) => [lang, url(path)])),
    "x-default": url("/"),
  };

  // Blog: every post with its own last revision; the hub and each category
  // change when their newest post does. Empty categories are left out.
  const lastmod = (iso: string) => new Date(`${iso}T00:00:00Z`);
  const blogPosts = getPosts();
  const latest = (posts: Post[]) =>
    posts.reduce((max, p) => ((p.updated ?? p.date) > max ? (p.updated ?? p.date) : max), "");
  const posts: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: url(p.href),
    lastModified: lastmod(p.updated ?? p.date),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));
  const categories: MetadataRoute.Sitemap = BLOG_CATEGORIES.flatMap((c) => {
    const inCategory = blogPosts.filter((p) => p.category.slug === c);
    return inCategory.length
      ? [
          {
            url: url(categoryPath(c)),
            lastModified: lastmod(latest(inCategory)),
            changeFrequency: "weekly" as const,
            priority: 0.5,
          },
        ]
      : [];
  });
  const blogLastmod = latest(blogPosts);
  // The freight calculator changes when its reference prices do: the newest "as of" date.
  const f = FREIGHT_DATA;
  const freightUpdated = [f.fuels.vlsfo, f.fuels.mgo, f.fuels.hsfo, f.eua, f.eurUsd]
    .map((d) => d.asOf)
    .reduce((max, d) => (d > max ? d : max));

  const pages: MetadataRoute.Sitemap = PAGES.map((p) => ({
    url: url(p.path),
    lastModified:
      p.path === "/blog" && blogLastmod
        ? lastmod(blogLastmod)
        : p.path === FREIGHT_PATH
          ? lastmod(freightUpdated)
          : p.path === GUIDES_PATH && guidesUpdated()
            ? lastmod(guidesUpdated())
            : CONTENT_UPDATED,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
    ...(p.path === "/" ? { alternates: { languages: homeAlternates } } : {}),
  }));

  const classes: MetadataRoute.Sitemap = [
    ...LPG_CLASSES.map((c) => `/lpg/${c.slug}`),
    ...TANKER_CLASSES.map((t) => `/tankers/${t.slug}`),
  ].map((path) => ({
    url: url(path),
    lastModified: CONTENT_UPDATED,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const localized: MetadataRoute.Sitemap = LOCALES.map((l) => ({
    url: url(`/${l.code}`),
    lastModified: CONTENT_UPDATED,
    changeFrequency: "monthly" as const,
    priority: 0.7,
    alternates: { languages: homeAlternates },
  }));

  // Guides: lastmod is the "last reviewed" date; a page with a translation lists both (+ x-default).
  const guides: MetadataRoute.Sitemap = getGuides().map((g) => {
    const languages = guideLanguages(g);
    return {
      url: url(g.href),
      lastModified: lastmod(g.updated),
      changeFrequency: "monthly" as const,
      priority: g.kind === "landing" ? 0.8 : 0.7,
      ...(languages
        ? {
            alternates: {
              languages: {
                ...Object.fromEntries(Object.entries(languages).map(([l, p]) => [l, url(p)])),
                "x-default": url(languages.en ?? g.href),
              },
            },
          }
        : {}),
    };
  });

  return [...pages, ...localized, ...classes, ...guides, ...categories, ...posts];
}
