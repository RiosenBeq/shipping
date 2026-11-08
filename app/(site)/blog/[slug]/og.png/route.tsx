import { blogShareImage } from "@/lib/blog/og";
import { coverLabel } from "@/lib/blog/meta";
import { getPost, getPosts, seedFromSlug } from "@/lib/blog/posts";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

/** A post's share card (Open Graph / Twitter, BlogPosting image), built at build time. */
export function GET(_req: Request, { params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) return new Response("Not found", { status: 404 });
  return blogShareImage({
    label: coverLabel(post),
    title: post.title,
    code: post.cover.kind === "type" ? post.cover.code : undefined,
    footer: `${post.dateLabel}${post.author ? ` · ${post.author.name}` : ""}`,
    seed: post.cover.kind === "type" ? post.cover.seed : seedFromSlug(post.slug),
  });
}
