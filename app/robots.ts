import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/**
 * Robots policy.
 *
 * - Default: open to all generic crawlers.
 * - LLM crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) are explicitly
 *   allowed for the public site so the brand surfaces in AI search results.
 *   We block /api/ and /_next/ infrastructure for everyone.
 * - Brand image assets (OG / Twitter / favicons) are listed in /ai.txt as
 *   off-limits for generative reproduction; we don't block them at the
 *   crawler level because share-card previews need them.
 */
export default function robots(): MetadataRoute.Robots {
  const sharedDisallow = ["/api/", "/_next/"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: sharedDisallow,
      },
      // Search engine bots — explicit so they can't fall back to a
      // restrictive default if a deployment proxy adds one.
      { userAgent: "Googlebot", allow: "/", disallow: sharedDisallow },
      { userAgent: "Bingbot", allow: "/", disallow: sharedDisallow },
      { userAgent: "DuckDuckBot", allow: "/", disallow: sharedDisallow },
      { userAgent: "Yandex", allow: "/", disallow: sharedDisallow },
      // LLM / AI crawlers — allowed so LEVANTER appears in AI answers.
      { userAgent: "GPTBot", allow: "/", disallow: sharedDisallow },
      { userAgent: "ChatGPT-User", allow: "/", disallow: sharedDisallow },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: sharedDisallow },
      { userAgent: "ClaudeBot", allow: "/", disallow: sharedDisallow },
      { userAgent: "Claude-Web", allow: "/", disallow: sharedDisallow },
      { userAgent: "anthropic-ai", allow: "/", disallow: sharedDisallow },
      { userAgent: "PerplexityBot", allow: "/", disallow: sharedDisallow },
      { userAgent: "Perplexity-User", allow: "/", disallow: sharedDisallow },
      { userAgent: "Google-Extended", allow: "/", disallow: sharedDisallow },
      { userAgent: "CCBot", allow: "/", disallow: sharedDisallow },
      { userAgent: "Applebot-Extended", allow: "/", disallow: sharedDisallow },
      { userAgent: "Bytespider", allow: "/", disallow: sharedDisallow },
      { userAgent: "Meta-ExternalAgent", allow: "/", disallow: sharedDisallow },
      { userAgent: "Amazonbot", allow: "/", disallow: sharedDisallow },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
