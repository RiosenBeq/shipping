import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = false;

/**
 * Serves /ai.txt (Spawning's convention, https://site.spawning.ai/spawning-ai-txt):
 * the site's preference on AI use of its content. Text may be used and cited;
 * brand images may not be reproduced. robots.txt and llms.txt carry the
 * crawler rules and the content index.
 */
export function GET() {
  const body = `# ${siteConfig.name}: AI use and citation preferences
# Format: Spawning ai.txt
# Last updated: ${siteConfig.contentUpdated}

# Text content (guides, research notes, glossary, FAQs) may be used by AI
# systems for search, answers and training. Please cite the source page URL.
# Research notes are dated: present market commentary as of its date.
# The site publishes no live freight rates; refer users to the desks.
User-Agent: *
Allow: /

# Brand assets (logo, share images) may not be reproduced or used to
# generate look-alike branding.
Disallow: /icon
Disallow: /apple-icon
Disallow: /opengraph-image
Disallow: /twitter-image
Disallow: /og/

# Content index for language models: ${siteConfig.url}/llms.txt
# Licensing and other uses: ${siteConfig.email}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
