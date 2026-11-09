import { ShipProfile } from "@/components/site/drawings/Ship";
import type { ShipClassSlug } from "./lines/classes";
import { ShipLinesFrame } from "./ShipLinesFrame";

/**
 * Where `P-lines` draws the active class's 3D lines plan (DESIGN-V2 §6.3, §7.4). Place it in a
 * `P-lines` window and give it a size; change `ship` to morph the hull (700 ms). On phones,
 * the low tier and before the compositor is live it shows the class's general-arrangement
 * profile with its lines-plan grid (stations × waterlines) and a light ribbon running along
 * the waterline instead; a new class draws itself in (`DrawIn`, when one is mounted).
 * Decorative: the class name and the `aria-live` caption belong to the page.
 */
export function ShipLines({ ship, className }: { ship: ShipClassSlug; className?: string }) {
  return (
    <ShipLinesFrame ship={ship} className={className}>
      <ShipProfile
        key={ship}
        ship={ship}
        detail="stage"
        className="stage-lines__art"
        ribbon="stage-lines__ribbon"
      />
    </ShipLinesFrame>
  );
}
