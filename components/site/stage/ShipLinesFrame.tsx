import type { ShipClassSlug } from "./lines/classes";

/**
 * `ShipLines` without the drawing: the box `P-lines` draws the hull into, around a profile the
 * caller renders (a server-rendered `ShipProfile`, so a client island such as the homepage's
 * ships rail need not ship the GA drawing model). Same markup and contract as `ShipLines`.
 */
export function ShipLinesFrame({
  ship,
  className,
  children,
}: {
  ship: ShipClassSlug;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      aria-hidden="true"
      data-stage-lines=""
      data-class={ship}
      className={className ? `stage-lines ${className}` : "stage-lines"}
    >
      <div className="stage-lines__svg" data-draw="">
        {children}
      </div>
    </div>
  );
}
