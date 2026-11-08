import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogListing } from "@/components/site/blog/BlogListing";
import {
  BLOG_CATEGORIES,
  BLOG_SHARE_IMAGE,
  CATEGORY_INFO,
  categoryPath,
  isBlogCategory,
} from "@/lib/blog/meta";
import { postsInCategory } from "@/lib/blog/posts";
import { buildPageMetadata } from "@/lib/seo";

type Props = { params: { category: string } };

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((category) => ({ category }));
}

export function generateMetadata({ params }: Props): Metadata {
  if (!isBlogCategory(params.category)) notFound();
  const info = CATEGORY_INFO[params.category];
  const path = categoryPath(info.slug);
  return {
    ...buildPageMetadata({
      title: `${info.label}: Tanker & LPG Blog`,
      description: info.description,
      path,
      languages: { en: path },
      ogImage: BLOG_SHARE_IMAGE,
    }),
    // An empty category (e.g. News before its first post) stays out of search.
    ...(postsInCategory(info.slug).length === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

/** /blog/category/<category>: one category's posts (static, indexable). */
export default function BlogCategoryPage({ params }: Props) {
  if (!isBlogCategory(params.category)) notFound();
  return <BlogListing category={params.category} />;
}
