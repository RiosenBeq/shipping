import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { HORMUZ_NOTE_PATH } from "@/lib/data/research";

/** Inline marker for a route that loads inside the Strait of Hormuz. */
export function HormuzBadge() {
  return (
    <span className="ms-2 inline-flex items-center gap-1 rounded-full border border-brass/40 bg-brass/10 px-2 py-0.5 align-middle text-[11px] font-semibold uppercase tracking-[0.08em] text-brass-ink">
      <TriangleAlert className="h-3 w-3" aria-hidden="true" />
      Hormuz
    </span>
  );
}

/**
 * Advisory under a route table when any listed lane loads in the Middle East
 * Gulf. Durable wording: it states the dependency, not a market level.
 */
export function HormuzNote() {
  return (
    <p className="mt-4 flex gap-3 rounded-[10px] border border-line bg-sand/50 px-4 py-3 text-sm leading-relaxed text-slate sm:px-6">
      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-brass-ink" aria-hidden="true" />
      <span>
        Lanes marked <span className="font-semibold text-navy">Hormuz</span> load in the Middle East
        Gulf. Since March 2026, traffic through the Strait of Hormuz has been severely disrupted and
        every call needs additional war-risk cover: ask the desk for current loading options.{" "}
        <Link href={HORMUZ_NOTE_PATH} className="uv-link font-semibold text-navy">
          Read the charterers’ checklist
        </Link>
      </span>
    </p>
  );
}
