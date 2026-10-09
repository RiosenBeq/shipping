import { faqLd } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { JsonLd } from "./JsonLd";

export type FaqItem = { q: string; a: string };

/**
 * FAQ list on the kit's `.uv-accordion` (native <details>, no JS) with
 * FAQPage JSON-LD. Questions are <h3>, so place it under a section <h2>.
 */
export function Faq({
  items,
  withSchema = true,
  className,
  defaultOpen,
  onSand = false,
}: {
  items: FaqItem[];
  withSchema?: boolean;
  className?: string;
  /** Index of an item to render expanded. */
  defaultOpen?: number;
  /**
   * Set when the list sits on a sand section: the kit's summary hover tint is
   * sand too, so it would give no feedback there. `!` — the kit rule loads
   * after Tailwind with the same specificity.
   */
  onSand?: boolean;
}) {
  return (
    <div
      className={cn(
        "max-w-4xl border-t border-line",
        onSand && "[&_summary:hover]:!bg-white/70",
        className
      )}
    >
      {withSchema && <JsonLd data={faqLd(items)} />}
      {items.map((item, i) => (
        <details key={item.q} className="uv-accordion" open={i === defaultOpen || undefined}>
          <summary>
            <h3>{item.q}</h3>
            <span className="uv-accordion__icon" aria-hidden="true" />
          </summary>
          <div className="uv-accordion__body">
            <p>{item.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
