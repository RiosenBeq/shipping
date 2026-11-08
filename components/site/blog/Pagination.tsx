import Link from "next/link";
import { listingPath, type BlogCategory } from "@/lib/blog/meta";

/** Numbered pages for a listing (only rendered when there is more than one). */
export function Pagination({
  page,
  pages,
  category,
}: {
  page: number;
  pages: number;
  category?: BlogCategory;
}) {
  if (pages <= 1) return null;
  return (
    <nav className="bl-pager" aria-label="Pages">
      {page > 1 && (
        <Link href={listingPath(page - 1, category)} rel="prev">
          ← Newer
        </Link>
      )}
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) =>
        n === page ? (
          <span key={n} aria-current="page">
            {n}
          </span>
        ) : (
          <Link key={n} href={listingPath(n, category)} aria-label={`Page ${n}`}>
            {n}
          </Link>
        )
      )}
      {page < pages && (
        <Link href={listingPath(page + 1, category)} rel="next">
          Older →
        </Link>
      )}
    </nav>
  );
}
