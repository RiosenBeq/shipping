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

/**
 * Short brass rule + small caps label. Shared by sections, page headers and
 * cards, so the rule length, tracking and colour never drift.
 *  - `size="md"` (default): section- and page-level labels.
 *  - `size="sm"`: labels inside cards, asides, menus and form legends.
 */
export function Eyebrow({
  children,
  dark = false,
  size = "md",
  as: Tag = "p",
  id,
  className,
}: {
  children: React.ReactNode;
  dark?: boolean;
  size?: "md" | "sm";
  /** Element to render; use a heading when the label titles a region. */
  as?: "p" | "span" | "h2" | "h3";
  id?: string;
  className?: string;
}) {
  const sm = size === "sm";
  return (
    <Tag
      id={id}
      className={cn(
        "flex items-center gap-3 font-semibold uppercase tracking-[0.18em]",
        sm ? "text-[11px]" : "text-xs",
        dark ? "text-brass-light" : "text-brass-ink",
        className
      )}
    >
      <span
        className={cn("h-px shrink-0", sm ? "w-6" : "w-8", dark ? "bg-brass-light/70" : "bg-brass")}
        aria-hidden="true"
      />
      {children}
    </Tag>
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
                <p
                  className={cn(
                    "mt-5 text-pretty text-lg leading-relaxed",
                    dark ? "text-fog" : "text-slate"
                  )}
                >
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
