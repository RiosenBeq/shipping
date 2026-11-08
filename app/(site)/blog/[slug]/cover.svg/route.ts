import { coverSvg } from "@/lib/blog/cover";
import { getPost, getPosts } from "@/lib/blog/posts";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts()
    .filter((p) => p.cover.kind === "type")
    .map((p) => ({ slug: p.slug }));
}

/**
 * The contour lines of a post's type-set cover, seeded per post. Linked as
 * cover.svg?s=<seed>, so a new pattern gets a new URL in every cache.
 */
export function GET(_req: Request, { params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post || post.cover.kind !== "type") return new Response("Not found", { status: 404 });
  return new Response(coverSvg(post.cover.seed), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400",
    },
  });
}
