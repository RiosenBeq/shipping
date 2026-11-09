import type { Metadata } from "next";
import { BlogListing } from "@/components/site/blog/BlogListing";
import { BLOG_PATH, BLOG_SHARE_IMAGE } from "@/lib/blog/meta";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Tanker & LPG Blog: Notes from the Desk",
  description:
    "Chartering guides, route guides, risk briefs and market notes from OBM Shipping's tanker and LPG brokers: Hormuz, laytime, Worldscale, VLGC routing, EU ETS.",
  path: BLOG_PATH,
  languages: { en: BLOG_PATH },
  ogImage: BLOG_SHARE_IMAGE,
  keywords: [
    "tanker chartering blog",
    "LPG shipping blog",
    "shipbroker insights",
    "Strait of Hormuz tanker",
    "laytime and demurrage guide",
    "Worldscale explained",
    "VLGC Panama Canal routing",
    "LPG charter party COA",
    "EU ETS charter party",
  ],
});

/** /blog: the blog home (DESIGN-V2 §11, mock 04). */
export default function BlogPage() {
  return <BlogListing />;
}
