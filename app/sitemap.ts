import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

type Route = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const ROUTES: Route[] = [
  { path: "", changeFrequency: "weekly", priority: 1.0 },
  { path: "/voyage-estimator", changeFrequency: "weekly", priority: 0.95 },
  { path: "/research", changeFrequency: "weekly", priority: 0.9 },
  { path: "/brokers", changeFrequency: "weekly", priority: 0.85 },
  { path: "/tankers", changeFrequency: "monthly", priority: 0.85 },
  { path: "/offices", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.75 },
  { path: "/dry-bulk", changeFrequency: "monthly", priority: 0.7 },
  { path: "/sale-purchase", changeFrequency: "monthly", priority: 0.7 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((r) => ({
    url: `${siteConfig.url}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
