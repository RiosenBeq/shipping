import Link from "next/link";
import { BLOG_PATH } from "@/lib/blog/meta";
import { breadcrumbsLd, type Crumb } from "@/lib/seo";
import { JsonLd } from "@/components/site/JsonLd";
import { cn } from "@/lib/utils";

/**
 * Night masthead of every blog page: static contour lines (the P-bathy plate
 * at rest), a brass glow top-right and a tide glow bottom-left, then the
 * page's only <h1>. The sand sheet that follows rides up over its bottom edge.
 */
export function BlogMasthead({
  sub,
  crumbs,
  hideCrumbs = false,
  children,
  className,
}: {
  /** The "— Blog" line above the heading. */
  sub?: string;
  /** Trail after Home (also emitted as BreadcrumbList JSON-LD). */
  crumbs?: Crumb[];
  /** Keep the trail in JSON-LD only (the blog home, where it would only say Home / Blog). */
  hideCrumbs?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const trail: Crumb[] = crumbs ? [{ name: "Home", path: "/" }, ...crumbs] : [];
  return (
    <section className={cn("bl-mast", className)} data-ground="dark" data-header-overlay="">
      {/* eslint-disable-next-line @next/next/no-img-element -- generated SVG line art */}
      <img
        className="bl-mast__art"
        src={`${BLOG_PATH}/masthead.svg`}
        alt=""
        aria-hidden="true"
        width={1600}
        height={480}
        decoding="async"
      />
      <div className="bl-mast__glow" aria-hidden="true" />
      <div className="bl-mast__glow bl-mast__glow--tide" aria-hidden="true" />
      {trail.length > 0 && <JsonLd data={breadcrumbsLd(trail)} />}
      <div className="bl-wrap">
        {trail.length > 1 && !hideCrumbs && (
          <nav aria-label="Breadcrumb" className="bl-crumbs">
            <ol>
              {trail.map((c, i) =>
                i < trail.length - 1 ? (
                  <li key={c.path}>
                    <Link href={c.path}>{c.name}</Link>
                  </li>
                ) : (
                  <li key={c.path}>
                    <span aria-current="page">{c.name}</span>
                  </li>
                )
              )}
            </ol>
          </nav>
        )}
        {sub && <p className="bl-sub">{sub}</p>}
        {children}
      </div>
    </section>
  );
}
