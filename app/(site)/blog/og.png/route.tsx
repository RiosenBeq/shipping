import { blogShareImage } from "@/lib/blog/og";
import { BLOG_TITLE } from "@/lib/blog/meta";

export const dynamic = "force-static";

/** The blog's own share card (/blog and its category pages). */
export function GET() {
  return blogShareImage({
    label: "Blog",
    title: BLOG_TITLE,
    footer: "Chartering guides · Route guides · Risk & regulation · Market notes",
    seed: 9,
  });
}
