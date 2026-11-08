import type * as React from "react";

type Tag = "section" | "div" | "article" | "aside" | "footer";

export type CardProps = {
  /** paper: sand sheet, navy text. night: navy-deep sheet, sand text (glows and glass allowed). */
  ground?: "paper" | "night";
  as?: Tag;
} & React.HTMLAttributes<HTMLElement>;

/**
 * A card (DESIGN-V2 §2): an opaque sheet over the stage — radius 28 / inset 12 on desktop,
 * radius 22 (top) / inset 8 on phones — that settles in as it enters (CSS scroll-driven,
 * progressive enhancement, no JS). The stage stays visible in the gutters around it; a card
 * covering ≥ 92% of the viewport freezes the plate. See docs/STAGE.md.
 */
export function Card({
  ground = "paper",
  as: Tag = "section",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Tag
      data-stage-card=""
      data-ground={ground === "paper" ? "light" : "dark"}
      className={`stage-card stage-card--${ground}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
