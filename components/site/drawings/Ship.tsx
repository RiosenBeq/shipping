import "@/app/drawings.css";
import { isDrawnClass, particulars, type ShipClassSlug } from "./particulars";
import { profile } from "./profile";
import type { Detail, View } from "./sheet";
import { DrawingSvg } from "./Svg";

const cache = new Map<string, View>();

/** A class's profile at a detail level (computed once per class and level). */
export function profileView(ship: ShipClassSlug, detail: Detail = "thumb"): View {
  const key = `${ship}:${detail}`;
  let v = cache.get(key);
  if (!v) {
    v = profile(particulars(ship), detail);
    cache.set(key, v);
  }
  return v;
}

/*
 * Shared (no directive): server components render these on the server, so the GA drawing
 * model stays out of the pages' JavaScript (the SVG is in the HTML and the RSC payload). A
 * client island that changes the class (the homepage's ships rail) loads it on demand.
 */

/**
 * A ship class in profile, in the general-arrangement drawing language (brass hairlines;
 * `dw--paper` for brass-ink on sand). Decorative by default. `ribbon` names the class of the
 * light ribbon running along the waterline (`stage-lines__ribbon`, `ship-card__ribbon`).
 */
export function ShipProfile({
  ship,
  detail = "thumb",
  className,
  title,
  ribbon,
}: {
  ship: ShipClassSlug;
  detail?: Detail;
  className?: string;
  title?: string;
  ribbon?: string;
}) {
  return (
    <DrawingSvg
      view={profileView(ship, detail)}
      className={className}
      title={title}
      ribbon={ribbon}
    />
  );
}

/** A content slug's profile (thumb), or nothing for a class the drawings do not know. */
export function ClassArt({
  slug,
  className,
  ribbon,
}: {
  slug: string;
  className?: string;
  ribbon?: string;
}) {
  return isDrawnClass(slug) ? (
    <ShipProfile ship={slug} className={className} ribbon={ribbon} />
  ) : null;
}
