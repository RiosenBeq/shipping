import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogListing } from "@/components/site/blog/BlogListing";
import {
  BLOG_CATEGORIES,
  BLOG_SHARE_IMAGE,
  CATEGORY_INFO,
  isBlogCategory,
  listingPath,
  paginate,
  type BlogCategory,
} from "@/lib/blog/meta";
import { postsInCategory } from "@/lib/blog/posts";
import { buildPageMetadata } from "@/lib/seo";

type Props = { params: { category: string; page: string } };

function resolve(params: Props["params"]): { category: BlogCategory; page: number } | undefined {
  if (!isBlogCategory(params.category) || !/^[1-9]\d*$/.test(params.page)) return undefined;
  const page = Number(params.page);
  const pages = paginate(postsInCategory(params.category), 1).pages;
  return page >= 2 && page <= pages ? { category: params.category, page } : undefined;
}

export function generateStaticParams() {
  return BLOG_CATEGORIES.flatMap((category) => {
    const { pages } = paginate(postsInCategory(category), 1);
    return Array.from({ length: pages - 1 }, (_, i) => ({ category, page: String(i + 2) }));
  });
}

export function generateMetadata({ params }: Props): Metadata {
  const r = resolve(params);
  if (!r) notFound();
  const info = CATEGORY_INFO[r.category];
  const path = listingPath(r.page, r.category);
  return buildPageMetadata({
    title: `${info.label}: Tanker & LPG Blog — Page ${r.page}`,
    description: info.description,
    path,
    languages: { en: path },
    ogImage: BLOG_SHARE_IMAGE,
  });
}

/** /blog/category/<category>/page/<n>: older posts in a category. */
export default function BlogCategoryPageN({ params }: Props) {
  const r = resolve(params);
  if (!r) notFound();
  return <BlogListing category={r.category} page={r.page} />;
}
