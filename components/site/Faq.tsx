import { faqLd } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { JsonLd } from "./JsonLd";

export type FaqItem = { q: string; a: string };

/**
 * FAQ accordion (DESIGN-V2 §7.8, `uv-accordion` successor): native <details>, no JS,
 * hairlines and a plus that turns to a cross, colours from the ground it sits on (paper or
 * night). FAQPage JSON-LD only from these visible items. Questions are <h3>, so place it
 * under a section <h2>.
 */
export function Faq({
  items,
  withSchema = true,
  className,
  defaultOpen,
}: {
  items: FaqItem[];
  withSchema?: boolean;
  className?: string;
  /** Index of an item to render expanded. */
  defaultOpen?: number;
  /** Kept for older callers; the accordion adapts to its ground. */
  onSand?: boolean;
}) {
  return (
    <div className={cn("ip-faq", className)}>
      {withSchema && <JsonLd data={faqLd(items)} />}
      {items.map((item, i) => (
        <details key={item.q} open={i === defaultOpen || undefined}>
          <summary>
            <h3>{item.q}</h3>
            <span className="ip-faq__icon" aria-hidden="true" />
          </summary>
          <div className="ip-faq__body">
            <p>{item.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
