import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Hero aside listing the ship sizes a desk covers, each linking to its guide. */
export function CoverageCard({
  title,
  items,
}: {
  title: string;
  items: { name: string; size: string; href: string }[];
}) {
  return (
    // `!` overrides: the kit card's own padding/gap load after Tailwind.
    <div className="uv-card uv-card--dark !gap-0 !p-6 md:!p-8">
      <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-brass-light">
        <span className="h-px w-6 bg-brass-light/70" aria-hidden="true" />
        {title}
      </p>
      <ol className="mt-5 divide-y divide-white/10 border-y border-white/10">
        {items.map((i, n) => (
          <li key={i.href}>
            <Link
              href={i.href}
              className="group -mx-3 flex items-center gap-4 rounded-md px-3 py-3.5 transition-colors hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brass-light"
            >
              <span className="w-6 shrink-0 font-mono text-xs text-fog" aria-hidden="true">
                {String(n + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-white transition-colors group-hover:text-brass-light">
                  {i.name}
                </span>
                <span className="mt-0.5 block text-sm text-fog">{i.size}</span>
              </span>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-fog transition-[transform,color] group-hover:translate-x-0.5 group-hover:text-brass-light rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
