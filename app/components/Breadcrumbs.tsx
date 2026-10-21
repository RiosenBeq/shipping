import Link from "next/link";
import type { Crumb } from "@/lib/seo";

/** Visible breadcrumb trail. Pass the same crumbs to `breadcrumbsLd` for the JSON-LD. */
export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="crumbs">
      <ol>
        {crumbs.map((c, i) =>
          i === crumbs.length - 1 ? (
            <li key={c.path}>
              <span aria-current="page">{c.name}</span>
            </li>
          ) : (
            <li key={c.path}>
              <Link href={c.path}>{c.name}</Link>
            </li>
          )
        )}
      </ol>
    </nav>
  );
}
