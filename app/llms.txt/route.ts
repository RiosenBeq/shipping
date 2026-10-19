import { llmsTxt } from "@/lib/llms";

export const dynamic = "force-static";

/**
 * /llms.txt (https://llmstxt.org/): a markdown index that helps LLMs and AI
 * search understand the site without parsing every page. Built in lib/llms.ts.
 */
export function GET() {
  return new Response(llmsTxt(), {
    headers: {
      // text/plain so browsers display it; the body is markdown per the spec.
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      // For AI crawlers, not for search results (the pages themselves rank).
      "X-Robots-Tag": "noindex",
    },
  });
}
