import { stills, type StillKey } from "@/lib/media";
import { cn } from "@/lib/utils";

// Client components import these from ./btn directly (no media manifest in their bundle).
export { BtnLabel, LinkArrow } from "./btn";

/** Brass glow top-right and tide glow bottom-left (night grounds only, max two per view). */
export function Glows({ tide = true, brass = true }: { tide?: boolean; brass?: boolean }) {
  return (
    <>
      {brass && <div className="lv-glow lv-glow--brass" aria-hidden="true" />}
      {tide && <div className="lv-glow lv-glow--tide" aria-hidden="true" />}
    </>
  );
}

/** "— Sub" line above a heading (brass-ink on paper, brass-light on night). */
export function Sub({
  children,
  as: Tag = "p",
  className,
}: {
  children: React.ReactNode;
  as?: "p" | "span";
  className?: string;
}) {
  return <Tag className={cn("t-sub ip-sub", className)}>{children}</Tag>;
}

/**
 * Section opener (GNB/Seacon): "— Sub" and the h2 on the left, a lead and an action on the
 * right (stacked on phones). The h2 gets `id` for aria-labelledby.
 */
export function SectionHead({
  sub,
  title,
  id,
  lead,
  action,
  size = "display",
  className,
}: {
  sub?: string;
  title: React.ReactNode;
  id?: string;
  lead?: React.ReactNode;
  action?: React.ReactNode;
  /** `display` (t-display, §4.2 openers) or `sm` for dense pages. */
  size?: "display" | "sm";
  className?: string;
}) {
  const side = lead || action;
  return (
    <div className={cn("ip-head", !side && "ip-head--solo", className)}>
      <div>
        {sub && <Sub>{sub}</Sub>}
        <h2 id={id} className={size === "sm" ? "ip-h2" : "t-display"}>
          {title}
        </h2>
      </div>
      {side && (
        <div className="ip-head__side">
          {lead && <p className="t-lead">{lead}</p>}
          {action}
        </div>
      )}
    </div>
  );
}

/**
 * A graded still (lib/media.ts `stills[key].graded`, the plate's grade baked in) with a
 * pill caption. Public pages use graded files only. The caption says what is on screen.
 */
export function StillFigure({
  still,
  caption,
  className,
  sizes = "(min-width: 1180px) 700px, 100vw",
}: {
  still: StillKey;
  caption?: string;
  className?: string;
  sizes?: string;
}) {
  const s = stills[still];
  return (
    <figure className={cn("ip-still", className)}>
      <picture>
        <source type="image/avif" srcSet={`${s.graded.avif} ${s.graded.width}w`} sizes={sizes} />
        {/* eslint-disable-next-line @next/next/no-img-element -- pre-graded AVIF/WebP pair from public/media */}
        <img
          src={s.graded.webp}
          alt={s.alt}
          width={s.graded.width}
          height={s.graded.height}
          loading="lazy"
          decoding="async"
        />
      </picture>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
