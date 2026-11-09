"use client";

import type { ComponentPropsWithoutRef } from "react";

/**
 * An edge-to-edge scroller's list (the /brokers team strip) that brings a focused item out from
 * under the edge shades: Chrome leaves an item that is partly in view where it is, its ring and
 * label under the shade. `scroll-padding-inline` on the list sets the clear area.
 */
export function FocusStrip(props: ComponentPropsWithoutRef<"ul">) {
  return (
    <ul
      {...props}
      onFocus={(e) => {
        (e.target as Element).closest("li")?.scrollIntoView({ block: "nearest", inline: "nearest" });
      }}
    />
  );
}
