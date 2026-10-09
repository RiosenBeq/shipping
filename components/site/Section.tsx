import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  intro?: React.ReactNode;
  tone?: "plain" | "sand" | "dark";
  className?: string;
  /** Optional element aligned right of the heading (e.g. a "view all" link). */
  action?: React.ReactNode;
  /** Dark tone only: draw the kit's chart-graticule pattern behind the content. Default true. */
  pattern?: boolean;
  /** Center the heading block (no action slot alignment). */
  align?: "start" | "center";
  children: React.ReactNode;
};

/** Short brass rule + small caps label. Shared by sections and page headers. */
export function Eyebrow({
  children,
  dark = false,
  className,
}: {
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em]",
        dark ? "text-brass-light" : "text-brass-ink",
        className
      )}
    >
      <span
        className={cn("h-px w-8 shrink-0", dark ? "bg-brass-light/70" : "bg-brass")}
        aria-hidden="true"
      />
      {children}
    </p>
  );
}

/** Standard content section: eyebrow + h2 + intro (+ action), then content. */
export function Section({
  id,
  eyebrow,
  title,
  intro,
  tone = "plain",
  className,
  action,
  pattern = true,
  align = "start",
  children,
}: Props) {
  const dark = tone === "dark";
  const center = align === "center";
  const hasHead = Boolean(eyebrow || title || intro || action);

  return (
    <section
      id={id}
      className={cn(
        "relative isolate py-16 md:py-24",
        tone === "sand" && "border-y border-line/70 bg-sand",
        dark && "bg-navy text-white",
        className
      )}
    >
      {dark && pattern && <div className="uv-hero-pattern" aria-hidden="true" />}
      <div className="container relative z-[1]">
        {hasHead && (
          <div
            className={cn(
              "mb-10 flex flex-col gap-6 md:mb-14",
              center
                ? "items-center text-center"
                : "md:flex-row md:items-end md:justify-between md:gap-10"
            )}
          >
            <div className={cn("max-w-2xl", center && "flex flex-col items-center")}>
              {eyebrow && (
                <Eyebrow dark={dark} className="mb-4">
                  {eyebrow}
                </Eyebrow>
              )}
              {title && (
                <h2 className="font-display text-[32px] leading-[1.12] tracking-tight md:text-[42px]">
                  {title}
                </h2>
              )}
              {intro && (
                <p className={cn("mt-5 text-lg leading-relaxed", dark ? "text-fog" : "text-slate")}>
                  {intro}
                </p>
              )}
            </div>
            {action && <div className="flex shrink-0 flex-wrap gap-3">{action}</div>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
