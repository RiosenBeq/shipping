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
  children: React.ReactNode;
};

/** Standard content section: eyebrow + h2 + intro, then content. */
export function Section({
  id,
  eyebrow,
  title,
  intro,
  tone = "plain",
  className,
  action,
  children,
}: Props) {
  const dark = tone === "dark";
  return (
    <section
      id={id}
      className={cn(
        "py-16 md:py-24",
        tone === "sand" && "bg-sand/60",
        dark && "bg-navy text-white",
        className
      )}
    >
      <div className="container">
        {(eyebrow || title || intro) && (
          <div className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              {eyebrow && (
                <p
                  className={cn(
                    "mb-3 text-xs font-semibold uppercase tracking-[0.18em]",
                    dark ? "text-brass-light" : "text-brass-ink"
                  )}
                >
                  {eyebrow}
                </p>
              )}
              {title && (
                <h2 className="font-display text-3xl leading-tight tracking-tight md:text-[40px]">
                  {title}
                </h2>
              )}
              {intro && (
                <p className={cn("mt-4 text-lg leading-relaxed", dark ? "text-fog" : "text-slate")}>
                  {intro}
                </p>
              )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
