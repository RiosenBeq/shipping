import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { PAGES } from "@/lib/pages";
import { REPORTS, reportSlug, reportDateIso } from "@/lib/data/research";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { LPG_CLASSES } from "@/lib/data/lpg-classes";
import { LOCALES, homeLanguages } from "@/lib/i18n";

/** Bump when page content changes materially; avoids a fake "now" on every build. */
const CONTENT_UPDATED = new Date("2026-10-09");

const url = (path: string) => new URL(path, siteConfig.url).toString();

export default function sitemap(): MetadataRoute.Sitemap {
  const homeAlternates = Object.fromEntries(
    Object.entries(homeLanguages()).map(([lang, path]) => [lang, url(path)])
  );

  const pages: MetadataRoute.Sitemap = PAGES.map((p) => ({
    url: url(p.path),
    lastModified: CONTENT_UPDATED,
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

  const reports: MetadataRoute.Sitemap = REPORTS.map((r) => ({
    url: url(`/research/${reportSlug(r)}`),
    lastModified: new Date(reportDateIso(r.date)),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  const localized: MetadataRoute.Sitemap = LOCALES.map((l) => ({
    url: url(`/${l.code}`),
    lastModified: CONTENT_UPDATED,
    changeFrequency: "monthly" as const,
    priority: 0.7,
    alternates: { languages: homeAlternates },
  }));

  return [...pages, ...localized, ...classes, ...reports];
}
