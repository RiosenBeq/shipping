import Link from "next/link";
import { breadcrumbsLd, type Crumb } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { JsonLd } from "./JsonLd";
import { Eyebrow } from "./Section";

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  /** Breadcrumb trail, excluding Home. Also emitted as BreadcrumbList JSON-LD. */
  crumbs?: Crumb[];
  tone?: "light" | "dark";
  children?: React.ReactNode;
  /** Extra classes for the children row, e.g. `max-sm:hidden` to drop chips on phones. */
  childrenClassName?: string;
  aside?: React.ReactNode;
  /** Extra classes for the outer <section>. */
  className?: string;
};

/**
 * Navy-tinted take on the kit's `.uv-hero-pattern` graticule for light
 * headers: same 120px chart grid with 24px minor lines, faded in from the end
 * edge. Inline because the kit class is tuned for navy and isn't edited here.
 */
const LIGHT_GRATICULE: React.CSSProperties = {
  backgroundImage:
    "conic-gradient(from 90deg at 1px 1px, #0000 90deg, rgba(10,31,51,0.07) 0), conic-gradient(from 90deg at 1px 1px, #0000 90deg, rgba(10,31,51,0.035) 0)",
  backgroundSize: "120px 120px, 24px 24px",
  WebkitMaskImage: "radial-gradient(ellipse 80% 75% at 75% 40%, #000 15%, transparent 72%)",
  maskImage: "radial-gradient(ellipse 80% 75% at 75% 40%, #000 15%, transparent 72%)",
};

/** Page-level hero used by every inner page. Renders the page's only <h1>. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  crumbs,
  tone = "light",
  children,
  childrenClassName,
  aside,
  className,
}: Props) {
  const dark = tone === "dark";
  const trail: Crumb[] = crumbs ? [{ name: "Home", path: "/" }, ...crumbs] : [];

  return (
    <section
      className={cn(
        "relative isolate border-b",
        dark ? "border-white/10 bg-navy text-white" : "border-line bg-sand text-navy",
        className
      )}
    >
      {dark ? (
        <div className="uv-hero-pattern" aria-hidden="true" />
      ) : (
        // Light tone: a whisper of warmth top-right, no pattern.
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_85%_0%,rgba(255,255,255,0.7),transparent_70%)]"
        />
      )}
      {!dark && !aside && (
        // Light header with nothing on the end side: the kit's chart graticule,
        // tinted navy at a whisper, fills the empty half on desktop. Static (no
        // drift) and decorative only.
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 end-0 -z-10 hidden w-[55%] lg:block rtl:-scale-x-100"
          style={LIGHT_GRATICULE}
        />
      )}
      {trail.length > 0 && <JsonLd data={breadcrumbsLd(trail)} />}

      <div
        className={cn(
          "container relative z-[1] py-12 md:py-20",
          aside && "grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-14"
        )}
      >
        <div>
          {trail.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-8 print:hidden">
              <ol
                className={cn(
                  "flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]",
                  dark ? "text-fog" : "text-slate"
                )}
              >
                {trail.map((c, i) => (
                  // The current page takes the rest of the row and truncates, so a
                  // long title never wraps onto its own line behind an orphaned "/"
                  // (the h1 below names the page in full).
                  <li
                    key={c.path + i}
                    className={cn(
                      "flex items-center gap-2",
                      i === trail.length - 1 && "min-w-0 flex-1"
                    )}
                  >
                    {i > 0 && (
                      <span
                        aria-hidden="true"
                        className={cn("select-none", dark ? "text-white/25" : "text-navy/25")}
                      >
                        /
                      </span>
                    )}
                    {i < trail.length - 1 ? (
                      <Link
                        href={c.path}
                        className={cn("uv-link", dark ? "hover:text-white" : "hover:text-navy")}
                      >
                        {c.name}
                      </Link>
                    ) : (
                      <span
                        aria-current="page"
                        className={cn("truncate font-medium", dark ? "text-white" : "text-navy")}
                      >
                        {c.name}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          {eyebrow && (
            <Eyebrow dark={dark} className="mb-5">
              {eyebrow}
            </Eyebrow>
          )}
          <h1 className="max-w-3xl font-display text-[38px] leading-[1.08] tracking-tight sm:text-5xl lg:text-[56px]">
            {title}
          </h1>
          {lead && (
            <p
              className={cn(
                "mt-6 max-w-2xl text-lg leading-relaxed",
                dark ? "text-fog" : "text-slate"
              )}
            >
              {lead}
            </p>
          )}
          {children && (
            <div className={cn("mt-9 flex flex-wrap items-center gap-3", childrenClassName)}>
              {children}
            </div>
          )}
        </div>
        {aside}
      </div>
    </section>
  );
}
