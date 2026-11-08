import { GasCarrierArt, PressurisedGasArt, TankerArt } from "@/components/site/VesselArt";
import { SHIP_CLASSES, type ShipClassSlug } from "./lines/classes";

/**
 * Where `P-lines` draws the active class's 3D lines plan (DESIGN-V2 §6.3, §7.4). Place it in a
 * `P-lines` window and give it a size; change `ship` to morph the hull (700 ms). On phones,
 * the low tier and before the compositor is live it shows the class's VesselArt profile with a
 * light ribbon running along the waterline instead. Decorative: the class name and the
 * `aria-live` caption belong to the page.
 */
export function ShipLines({ ship, className }: { ship: ShipClassSlug; className?: string }) {
  const kit = SHIP_CLASSES[ship].deckKit;
  const Art = kit === "tanker" ? TankerArt : kit === "gas" ? GasCarrierArt : PressurisedGasArt;
  return (
    <div
      aria-hidden="true"
      data-stage-lines=""
      data-class={ship}
      className={className ? `stage-lines ${className}` : "stage-lines"}
    >
      <div className="stage-lines__svg">
        <Art className="stage-lines__art" />
        <svg className="stage-lines__ribbon" viewBox="0 0 320 96" fill="none">
          <path d="M22 74 H300" pathLength="100" />
        </svg>
      </div>
    </div>
  );
}
