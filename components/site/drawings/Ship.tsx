"use client";

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
 * Client components on purpose: the server sends only the class slug in the RSC payload (not
 * the path data twice); the SVG is still rendered into the HTML on the server, so it is there
 * without JavaScript, and the model is cached with the page's JavaScript.
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
