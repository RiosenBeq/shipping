import { Plus } from "lucide-react";
import { faqLd } from "@/lib/seo";
import { JsonLd } from "./JsonLd";

export type FaqItem = { q: string; a: string };

/** Accessible FAQ list (native <details>) with FAQPage JSON-LD. */
export function Faq({ items, withSchema = true }: { items: FaqItem[]; withSchema?: boolean }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {withSchema && <JsonLd data={faqLd(items)} />}
      {items.map((item) => (
        <details key={item.q} className="group py-5">
          <summary className="flex items-start justify-between gap-6 text-left text-lg font-medium text-navy">
            <h3 className="text-lg font-medium">{item.q}</h3>
            <Plus
              className="mt-1 h-5 w-5 shrink-0 text-brass transition-transform group-open:rotate-45"
              aria-hidden="true"
            />
          </summary>
          <p className="mt-3 max-w-3xl leading-relaxed text-slate">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
