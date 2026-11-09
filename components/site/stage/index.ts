/**
 * The Stage — public API for page builders (docs/STAGE.md).
 *
 *   <StageProvider plates={[…]} />     once per page, before the content (client)
 *   <StageWindow plate ground>         transparent section over a plate (server)
 *   <StageAperture inset radius ground/> rounded opening inside a window (server)
 *   <Card ground="paper|night">        opaque sheet over the stage (server)
 *   <ShipLines ship="vlgc"/>           where P-lines draws the hull (server)
 *   <PauseMotion/>                     WCAG 2.2.2 toggle, shared state (client)
 *   <StageRail items label/>           waypoint rail (client)
 *   calm(k?)                           spread on a copy block: a calm zone under it
 */
export { StageProvider, type StageProviderProps } from "./StageProvider";
export { StageWindow, type StageWindowProps } from "./StageWindow";
export { StageAperture, type StageApertureProps } from "./StageAperture";
export { Card, type CardProps } from "./Card";
// ShipLines pulls in the GA drawing model: import it directly from
// "@/components/site/stage/ShipLines" (server components) — re-exporting it here would put the
// model in the bundle of every client component that imports this barrel. Client islands use
// "./ShipLinesFrame" with a server-rendered profile.
export { PauseMotion } from "./PauseMotion";
export { StageRail, type RailItem } from "./StageRail";
// The plate registry (with the media manifest) is server-side: import "./plates" directly.
export { SHIP_CLASSES, SHIP_CLASS_SLUGS, type ShipClassSlug } from "./lines/classes";
export { PLATE_ID_LIST, isPlateId, type Ground, type PlateId, type StageTier } from "./types";

/** Attributes that make an element a calm zone (strength 0.35–0.55, default 0.45). */
export function calm(k?: number): { "data-calm": string } {
  return { "data-calm": k == null ? "" : String(k) };
}
