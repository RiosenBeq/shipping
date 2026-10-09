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
    <div className="uv-card uv-card--dark p-6 md:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass-light">{title}</p>
      <ul className="mt-4 divide-y divide-white/10">
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className="group flex items-center justify-between gap-4 py-3">
              <span>
                <span className="block font-medium text-white group-hover:text-brass-light">
                  {i.name}
                </span>
                <span className="block text-sm text-fog">{i.size}</span>
              </span>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-fog transition-transform group-hover:translate-x-0.5 group-hover:text-brass-light"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
