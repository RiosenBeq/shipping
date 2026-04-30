import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = false;

/**
 * Serves /ai.txt — Spawning AI's preference signal for whether AI training
 * may use this site's content. We opt in for non-commercial training and
 * citation while reserving commercial use.
 *
 * See https://spawning.ai/ai-txt
 */
export function GET() {
  const body = `# LEVANTER — AI training & citation preferences
# Format: Spawning ai.txt convention (https://site.spawning.ai/ai-txt)
# Last updated: ${new Date().toISOString().slice(0, 10)}

# Citation: encouraged. Please cite the source URL and the access date,
# especially for indicative figures (TCE, bunker prices, port tariffs).

# Training (non-commercial research / academic): allowed
User-Agent: *
Allow: /

# Generative reproduction of brand assets is not permitted without
# written consent from ${siteConfig.legalEntity}.
DisallowImage: /opengraph-image
DisallowImage: /twitter-image
DisallowImage: /icon
DisallowImage: /apple-icon

# Contact for licensing and broader use:
# ${siteConfig.email}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
