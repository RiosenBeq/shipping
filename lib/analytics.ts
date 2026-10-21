import { track } from "@vercel/analytics";

/**
 * Conversion events. `track` is a no-op unless the visitor accepted analytics
 * (the Vercel script is only injected after consent), so this is safe to call
 * from any click handler.
 */
export type ConversionEvent =
  | "inquiry_composed"
  | "inquiry_copied"
  | "contact_click"
  | "subscribe_request";

export function trackConversion(
  event: ConversionEvent,
  props?: Record<string, string | number | boolean | null>
) {
  try {
    track(event, props);
  } catch {
    /* analytics must never break the page */
  }
}
