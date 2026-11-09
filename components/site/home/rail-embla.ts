import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import type { RailEvents } from "./useDesktopRail";

/**
 * The ships rail under Embla (8.6.0, MIT © David Jerleke) with wheel gestures (8.1.0, MIT ©
 * Felix Leupold). This module is the lazy chunk: `useDesktopRail` imports it after idle on
 * fine-pointer desktops only, so neither library is ever in the homepage's first load.
 */
export function mountRail(
  root: HTMLElement,
  on: { current: RailEvents }
): EmblaCarouselType | null {
  const track = root.firstElementChild as HTMLElement | null;
  if (!track) return null;
  track.scrollLeft = 0; // leave native mode cleanly
  root.dataset.rail = "embla";
  const api = EmblaCarousel(
    root,
    {
      align: "start",
      // A snap per card (so the snapped index is the card's), contained at both ends.
      containScroll: "keepSnaps",
      direction: getComputedStyle(root).direction === "rtl" ? "rtl" : "ltr",
      // Attraction physics, not ms (docs: 20–60): tuned by eye against the 640ms tide.
      duration: 32,
      skipSnaps: true,
    },
    [WheelGesturesPlugin()]
  );
  const report = (a: EmblaCarouselType) =>
    on.current.scroll?.(a.scrollProgress(), !a.canScrollPrev(), !a.canScrollNext());
  api.on("select", (a) => on.current.select?.(a.selectedScrollSnap()));
  api.on("scroll", report);
  api.on("reInit", report);
  api.on("pointerDown", () => {
    root.dataset.dragging = "";
  });
  api.on("pointerUp", () => {
    delete root.dataset.dragging;
  });
  report(api);
  return api;
}
