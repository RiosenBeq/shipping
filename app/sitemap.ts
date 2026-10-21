import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { DATA_UPDATED, PAGES } from "@/lib/pages";
import { BROKERS, brokerSlug } from "@/lib/data/brokers";
import { REPORTS, reportSlug, reportDateIso } from "@/lib/data/research";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { OFFICE_ORDER } from "@/lib/data/offices";

/**
 * lastmod comes from real content dates (PAGES[].updated, report dates, DATA_UPDATED)
 * rather than the build time, so search engines can trust it. changefreq/priority
 * are omitted: Google ignores them.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${siteConfig.url}${path === "/" ? "" : path}`;
  const dataUpdated = new Date(DATA_UPDATED);

  return [
    ...PAGES.map((p) => ({ url: url(p.path), lastModified: new Date(p.updated) })),
    ...TANKER_CLASSES.map((t) => ({ url: url(`/tankers/${t.slug}`), lastModified: dataUpdated })),
    ...OFFICE_ORDER.map((slug) => ({ url: url(`/offices/${slug}`), lastModified: dataUpdated })),
    ...BROKERS.map((b) => ({ url: url(`/brokers/${brokerSlug(b)}`), lastModified: dataUpdated })),
    // Pro reports are noindex (public summary only), so they're left out of the sitemap.
    ...REPORTS.filter((r) => !r.gated).map((r) => ({
      url: url(`/research/${reportSlug(r)}`),
      lastModified: new Date(reportDateIso(r.date)),
    })),
  ];
}
