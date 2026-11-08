import { JsonLd } from "@/components/site/JsonLd";
import {
  BLOG_DESCRIPTION,
  BLOG_FEED_PATH,
  BLOG_NAME,
  BLOG_PATH,
  BLOG_TITLE,
  CATEGORY_INFO,
  categoryPath,
  listingPath,
  paginate,
  type BlogCategory,
} from "@/lib/blog/meta";
import { categoryCounts, getPosts, postsInCategory, toCard } from "@/lib/blog/posts";
import { blogLd, webPageLd } from "@/lib/seo";
import { CategoryChips } from "./CategoryChips";
import { RssIcon } from "./icons";
import { BlogMasthead } from "./Masthead";
import { Pagination } from "./Pagination";
import { FeaturedPost } from "./PostCard";
import { PostGrid } from "./PostGrid";
import "./blog.css";

/**
 * A blog listing: the hub (/blog, /blog/page/n) or a category
 * (/blog/category/<c>, …/page/n). Night masthead with the h1 and the category
 * chips; on the sand sheet, the newest post large (first page of the hub
 * only), then the grid by year and the page links.
 */
export function BlogListing({ page = 1, category }: { page?: number; category?: BlogCategory }) {
  const published = getPosts();
  const all = category ? postsInCategory(category) : published;
  // The hub's first page shows the newest post large, above the grid.
  const featured = !category && page === 1 ? all[0] : undefined;
  const rest = featured ? all.slice(1) : all;
  const { items, pages } = paginate(rest, page);
  const info = category ? CATEGORY_INFO[category] : undefined;
  const path = listingPath(page, category);
  const counts = categoryCounts();
  const onPage = [...(featured ? [featured] : []), ...items];

  return (
    <div className="bl bl-page">
      <JsonLd
        data={[
          webPageLd({
            title: info ? `${info.label} — ${BLOG_NAME}` : BLOG_NAME,
            description: info?.description ?? BLOG_DESCRIPTION,
            path,
            type: "CollectionPage",
            ...(onPage[0] ? { dateModified: `${onPage[0].updated ?? onPage[0].date}` } : {}),
          }),
          blogLd({
            path,
            name: BLOG_NAME,
            description: BLOG_DESCRIPTION,
            posts: onPage.map((p) => ({
              title: p.title,
              path: p.href,
              date: p.date,
              author: p.author,
            })),
          }),
        ]}
      />
      <BlogMasthead
        hideCrumbs={!info && page === 1}
        crumbs={[
          { name: "Blog", path: BLOG_PATH },
          ...(info ? [{ name: info.label, path: categoryPath(info.slug) }] : []),
          ...(page > 1 ? [{ name: `Page ${page}`, path }] : []),
        ]}
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div>
            <p className="bl-sub">Blog</p>
            <h1 className="bl-display">
              {info ? info.label : BLOG_TITLE}
              {page > 1 && <span className="sr-only"> — page {page}</span>}
            </h1>
          </div>
          <div className="max-w-[360px] max-lg:hidden">
            <p className="bl-mast__lead">{info?.description ?? BLOG_DESCRIPTION}</p>
            <a className="bl-rss" href={BLOG_FEED_PATH} type="application/rss+xml">
              <RssIcon />
              RSS feed
            </a>
          </div>
        </div>
        {info && <p className="bl-mast__lead mt-5 lg:hidden">{info.description}</p>}
        <div className="mt-10 md:mt-14">
          <CategoryChips counts={counts} total={published.length} current={category} />
        </div>
      </BlogMasthead>

      <div className="bl-sheet">
        <div className="bl-wrap">
          {featured && <FeaturedPost post={toCard(featured)} />}
          {items.length > 0 ? (
            <PostGrid posts={items.map(toCard)} />
          ) : (
            !featured && (
              <p className="bl-empty">
                No posts here yet. The desks publish route guides, chartering how-tos and risk
                briefs — <a href={BLOG_PATH}>see all posts</a> or follow the{" "}
                <a href={BLOG_FEED_PATH}>RSS feed</a>.
              </p>
            )
          )}
          <Pagination page={page} pages={pages} category={category} />
        </div>
      </div>
    </div>
  );
}
