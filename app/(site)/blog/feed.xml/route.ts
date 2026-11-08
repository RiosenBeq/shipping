import { blogFeedXml } from "@/lib/blog/feed";
import { getPosts } from "@/lib/blog/posts";

export const dynamic = "force-static";
export const revalidate = false;

/** RSS 2.0 feed of the blog, full text, newest first (lib/blog/feed.ts). */
export function GET() {
  return new Response(blogFeedXml(getPosts()), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
