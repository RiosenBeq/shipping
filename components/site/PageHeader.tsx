import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { breadcrumbsLd, type Crumb } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { JsonLd } from "./JsonLd";

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  /** Breadcrumb trail, excluding Home. Also emitted as BreadcrumbList JSON-LD. */
  crumbs?: Crumb[];
  tone?: "light" | "dark";
  children?: React.ReactNode;
  aside?: React.ReactNode;
};

/** Page-level hero used by every inner page. Renders the page's only <h1>. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  crumbs,
  tone = "light",
  children,
  aside,
}: Props) {
  const dark = tone === "dark";
  const trail: Crumb[] = crumbs ? [{ name: "Home", path: "/" }, ...crumbs] : [];

  return (
    <section
      className={cn(
        "border-b",
        dark ? "border-white/10 bg-navy text-white" : "border-line bg-sand/60 text-navy"
      )}
    >
      {trail.length > 0 && <JsonLd data={breadcrumbsLd(trail)} />}
      <div
        className={cn(
          "container py-12 md:py-16",
          aside && "grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end"
        )}
      >
        <div>
          {trail.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol
                className={cn(
                  "flex flex-wrap items-center gap-1 text-xs",
                  dark ? "text-fog" : "text-slate"
                )}
              >
                {trail.map((c, i) => (
                  <li key={c.path + i} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight className="h-3 w-3 opacity-60" aria-hidden="true" />}
                    {i < trail.length - 1 ? (
                      <Link href={c.path} className={dark ? "hover:text-white" : "hover:text-navy"}>
                        {c.name}
                      </Link>
                    ) : (
                      <span aria-current="page">{c.name}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          {eyebrow && (
            <p
              className={cn(
                "mb-4 text-xs font-semibold uppercase tracking-[0.18em]",
                dark ? "text-brass-light" : "text-brass-ink"
              )}
            >
              {eyebrow}
            </p>
          )}
          <h1 className="max-w-3xl font-display text-4xl leading-[1.08] tracking-tight md:text-5xl lg:text-[56px]">
            {title}
          </h1>
          {lead && (
            <p
              className={cn(
                "mt-5 max-w-2xl text-lg leading-relaxed",
                dark ? "text-fog" : "text-slate"
              )}
            >
              {lead}
            </p>
          )}
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </div>
        {aside}
      </div>
    </section>
  );
}
