import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { AI_AGENTS } from "@/lib/crawlers";

/**
 * Open to search engines and to AI search, assistant and training crawlers, so
 * the desks surface in AI answers. Only API routes are disallowed: `/_next/`
 * must stay crawlable, because Google renders pages with the CSS and JS
 * served from there.
 *
 * AI crawlers get their own group so the policy is explicit per bot (a bot
 * that finds a group naming it ignores the `*` group).
 */
export default function robots(): MetadataRoute.Robots {
  // Previews and builds without a real origin stay out of every index.
  if (!siteConfig.indexable) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  const disallow = ["/api/"];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: AI_AGENTS, allow: "/", disallow },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
