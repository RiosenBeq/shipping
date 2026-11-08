import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogListing } from "@/components/site/blog/BlogListing";
import { BLOG_DESCRIPTION, BLOG_SHARE_IMAGE, listingPath, paginate } from "@/lib/blog/meta";
import { getPosts } from "@/lib/blog/posts";
import { buildPageMetadata } from "@/lib/seo";

type Props = { params: { page: string } };

/** Pages of the hub grid after the first (the first page also shows the featured post). */
const pageCount = () => paginate(getPosts().slice(1), 1).pages;

/** "2" → 2; anything that is not a page past the first → undefined. */
function pageNumber(param: string): number | undefined {
  const n = Number(param);
  return /^[1-9]\d*$/.test(param) && n >= 2 && n <= pageCount() ? n : undefined;
}

export function generateStaticParams() {
  return Array.from({ length: pageCount() - 1 }, (_, i) => ({ page: String(i + 2) }));
}

export function generateMetadata({ params }: Props): Metadata {
  const page = pageNumber(params.page);
  if (!page) notFound();
  const path = listingPath(page);
  return buildPageMetadata({
    title: `Blog: Notes from the Desk — Page ${page}`,
    description: BLOG_DESCRIPTION,
    path,
    languages: { en: path },
    ogImage: BLOG_SHARE_IMAGE,
  });
}

/** /blog/page/<n>: older posts. /blog/page/1 is /blog itself (never linked). */
export default function BlogPageN({ params }: Props) {
  const page = pageNumber(params.page);
  if (!page) notFound();
  return <BlogListing page={page} />;
}
