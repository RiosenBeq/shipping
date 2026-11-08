import type * as React from "react";
import type { Ground, PlateId } from "./types";

type Tag = "section" | "div" | "header" | "footer" | "article" | "aside";

export type StageWindowProps = {
  /** The plate the stage shows while this window is on screen. */
  plate: PlateId;
  /** What is under the copy: drives the header, rail and focus colours. Every plate is dark. */
  ground?: Ground;
  /** Hide the horizon hairline for this window. */
  horizon?: boolean;
  as?: Tag;
} & Omit<React.HTMLAttributes<HTMLElement>, "color">;

/**
 * A window (DESIGN-V2 §2): a transparent section through which the stage shows its plate.
 * Copy inside it sits on calm zones (`data-calm` on the copy block). Server component: it only
 * writes the attributes the stage reads. While it is on screen the stage writes
 * `--stage-in`, `--stage-out`, `--stage-pin` and `--stage-through` (0..1) on it for
 * scroll-scrubbed CSS. See docs/STAGE.md.
 */
export function StageWindow({
  plate,
  ground = "dark",
  horizon = true,
  as: Tag = "section",
  className,
  children,
  ...rest
}: StageWindowProps) {
  return (
    <Tag
      data-stage-window=""
      data-plate={plate}
      data-ground={ground}
      data-horizon={horizon ? undefined : "off"}
      className={className ? `stage-window ${className}` : "stage-window"}
      {...rest}
    >
      {children}
    </Tag>
  );
}
