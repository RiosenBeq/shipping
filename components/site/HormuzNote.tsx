import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { HORMUZ_NOTE_PATH } from "@/lib/data/research";
import { ICON_STROKE } from "@/components/site/iconStroke";

/** Inline marker for a route that loads inside the Strait of Hormuz. */
export function HormuzBadge() {
  return (
    <span className="ip-badge">
      <TriangleAlert aria-hidden="true" strokeWidth={ICON_STROKE.inline} />
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
    <p className="ip-note">
      <TriangleAlert aria-hidden="true" strokeWidth={ICON_STROKE.inline} />
      <span>
        Lanes marked <span className="font-semibold text-navy">Hormuz</span> load in the Middle East
        Gulf. Since March 2026, traffic through the Strait of Hormuz has been severely disrupted and
        every call needs additional war-risk cover: ask the desk for current loading options.{" "}
        <Link href={HORMUZ_NOTE_PATH}>Read the charterers’ checklist</Link>
      </span>
    </p>
  );
}
