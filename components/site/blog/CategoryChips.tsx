import Link from "next/link";
import {
  BLOG_CATEGORIES,
  BLOG_PATH,
  CATEGORY_INFO,
  categoryPath,
  type BlogCategory,
} from "@/lib/blog/meta";

/**
 * "All" plus every category with its post count. The current one is marked;
 * empty categories stay visible (the count says 0) but are not links.
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
        {BLOG_CATEGORIES.map((c) => {
          const label = (
            <>
              {CATEGORY_INFO[c].label} <b>{counts[c]}</b>
              <span className="sr-only"> {counts[c] === 1 ? "post" : "posts"}</span>
            </>
          );
          return (
            <li key={c}>
              {counts[c] > 0 || current === c ? (
                <Link
                  href={categoryPath(c)}
                  className="bl-chip"
                  aria-current={current === c ? "page" : undefined}
                >
                  {label}
                </Link>
              ) : (
                <span className="bl-chip" aria-disabled="true">
                  {label}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
