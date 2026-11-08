import type { PostCardData } from "@/lib/blog/meta";
import { PostCard } from "./PostCard";

/** Posts in a three-column grid, grouped under a heading per year (newest first). */
export function PostGrid({ posts, grouped = true }: { posts: PostCardData[]; grouped?: boolean }) {
  if (!grouped) {
    return (
      <ul className="bl-grid">
        {posts.map((p) => (
          <li key={p.slug}>
            <PostCard post={p} />
          </li>
        ))}
      </ul>
    );
  }
  const years = new Map<string, PostCardData[]>();
  for (const p of posts) {
    const y = p.date.slice(0, 4);
    years.set(y, [...(years.get(y) ?? []), p]);
  }
  return (
    <>
      {[...years].map(([year, list]) => (
        <section key={year} aria-labelledby={`year-${year}`}>
          <div className="bl-year">
            <h2 id={`year-${year}`}>{year}</h2>
            <span>
              {list.length} {list.length === 1 ? "post" : "posts"}
            </span>
          </div>
          <ul className="bl-grid">
            {list.map((p) => (
              <li key={p.slug}>
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
