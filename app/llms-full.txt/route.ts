import { llmsFullTxt } from "@/lib/llms";

export const dynamic = "force-static";

/** Long-form companion to /llms.txt: the site's full text in one file. */
export function GET() {
  return new Response(llmsFullTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      // Duplicates the pages' text, so keep it out of search results.
      "X-Robots-Tag": "noindex",
    },
  });
}
