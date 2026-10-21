import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/**
 * Robots policy.
 *
 * - Production: open to all crawlers. `/_next/` is deliberately NOT blocked — search
 *   engines need the CSS/JS chunks under it to render pages. There is no `/api/`.
 * - LLM / AI crawlers (GPTBot, ClaudeBot, PerplexityBot, …) are listed explicitly so the
 *   policy is visible and easy to change per bot; they currently get the same access.
 * - Preview deployments and builds without a configured origin disallow everything
 *   (pages are also served with `noindex`).
 */
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "CCBot",
  "Applebot-Extended",
  "Bytespider",
  "Meta-ExternalAgent",
  "Amazonbot",
];

export default function robots(): MetadataRoute.Robots {
  if (!siteConfig.indexable) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
