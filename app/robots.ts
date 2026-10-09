import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/**
 * Open to search engines and AI search crawlers (so the desks surface in AI
 * answers). Only framework internals are disallowed.
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = ["/api/", "/_next/"];
  const aiAgents = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-SearchBot",
    "Claude-User",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Applebot-Extended",
  ];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: aiAgents, allow: "/", disallow },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
