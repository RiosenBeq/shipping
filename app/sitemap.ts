import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { BROKERS, brokerSlug } from "@/lib/data/brokers";
import { REPORTS, reportSlug, reportDateIso } from "@/lib/data/research";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";

type StaticRoute = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const STATIC_ROUTES: StaticRoute[] = [
  { path: "", changeFrequency: "weekly", priority: 1.0 },
  { path: "/voyage-estimator", changeFrequency: "weekly", priority: 0.95 },
  { path: "/research", changeFrequency: "weekly", priority: 0.9 },
  { path: "/brokers", changeFrequency: "weekly", priority: 0.85 },
  { path: "/tankers", changeFrequency: "monthly", priority: 0.85 },
  { path: "/offices", changeFrequency: "monthly", priority: 0.8 },
  { path: "/glossary", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.75 },
  { path: "/dry-bulk", changeFrequency: "monthly", priority: 0.75 },
  { path: "/sale-purchase", changeFrequency: "monthly", priority: 0.75 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

const OFFICE_CITIES = ["ist", "lon", "sg", "hou"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${siteConfig.url}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const tankerClassEntries: MetadataRoute.Sitemap = TANKER_CLASSES.map((t) => ({
    url: `${siteConfig.url}/tankers/${t.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const officeEntries: MetadataRoute.Sitemap = OFFICE_CITIES.map((c) => ({
    url: `${siteConfig.url}/offices/${c}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const brokerEntries: MetadataRoute.Sitemap = BROKERS.map((b) => ({
    url: `${siteConfig.url}/brokers/${brokerSlug(b)}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const reportEntries: MetadataRoute.Sitemap = REPORTS.map((r) => ({
    url: `${siteConfig.url}/research/${reportSlug(r)}`,
    lastModified: new Date(reportDateIso(r.date)),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  return [
    ...staticEntries,
    ...tankerClassEntries,
    ...officeEntries,
    ...brokerEntries,
    ...reportEntries,
  ];
}
