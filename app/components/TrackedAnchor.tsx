"use client";

import type { AnchorHTMLAttributes } from "react";
import { trackConversion } from "@/lib/analytics";

/** Plain `<a>` that records a `contact_click` conversion (only if analytics consent was given). */
export function TrackedAnchor({
  channel,
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { channel: string }) {
  return (
    <a
      {...props}
      onClick={(e) => {
        trackConversion("contact_click", { channel, from: window.location.pathname });
        onClick?.(e);
      }}
    />
  );
}
