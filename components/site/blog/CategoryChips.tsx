import Link from "next/link";
import {
  BLOG_CATEGORIES,
  BLOG_PATH,
  CATEGORY_INFO,
  categoryPath,
  type BlogCategory,
} from "@/lib/blog/meta";

/**
 * "All" plus every category that has posts, with its count (as the homepage's
 * Notes strip does). The current one is marked — shown even while it is empty,
 * on its own (noindex) page.
 */
export function CategoryChips({
  counts,
  total,
  current,
}: {
  counts: Record<BlogCategory, number>;
  total: number;
  current?: BlogCategory;
}) {
  return (
    <nav aria-label="Blog categories">
      <ul className="bl-chips">
        <li>
          <Link href={BLOG_PATH} className="bl-chip" aria-current={current ? undefined : "page"}>
            All <b>{total}</b>
          </Link>
        </li>
        {BLOG_CATEGORIES.filter((c) => counts[c] > 0 || current === c).map((c) => (
          <li key={c}>
            <Link
              href={categoryPath(c)}
              className="bl-chip"
              aria-current={current === c ? "page" : undefined}
            >
              {CATEGORY_INFO[c].label} <b>{counts[c]}</b>
              <span className="sr-only"> {counts[c] === 1 ? "post" : "posts"}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
