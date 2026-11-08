import { BrandMark } from "@/components/site/BrandMark";
import { coverLabel, type PostCardData } from "@/lib/blog/meta";
import { cn } from "@/lib/utils";

/**
 * A post's cover. Type-set covers (the default) are a navy card with the
 * post's contour lines, its label top-left, the mark top-right and the big
 * code bottom-left (DESIGN-V2 §10); photographs get the house grade.
 * Decorative: the post title next to it carries the meaning.
 */
export function PostCover({
  post,
  size = "md",
  priority = false,
  className,
}: {
  post: Pick<PostCardData, "cover" | "format" | "tags">;
  /** sm: grid cards · md: default · wide: featured · hero: the article's own cover. */
  size?: "sm" | "md" | "wide" | "hero";
  /** Load eagerly (above the fold). */
  priority?: boolean;
  className?: string;
}) {
  const { cover } = post;
  const loading = priority ? "eager" : "lazy";
  const classes = cn(
    "bl-cover",
    size === "sm" && "bl-cover--sm",
    size === "wide" && "bl-cover--wide",
    size === "hero" && "bl-cover--hero",
    cover.kind === "still" && "bl-cover--still",
    className
  );

  if (cover.kind === "still") {
    return (
      <div className={classes} aria-hidden="true">
        <picture>
          {cover.avif && <source srcSet={cover.avif} type="image/avif" />}
          {/* eslint-disable-next-line @next/next/no-img-element -- static asset, sized by CSS */}
          <img
            className="bl-cover__art"
            src={cover.src}
            alt=""
            loading={loading}
            decoding="async"
            {...(cover.width ? { width: cover.width, height: cover.height } : {})}
          />
        </picture>
        <span className="bl-cover__label">{coverLabel(post)}</span>
        <BrandMark light className="bl-cover__mark" />
        {cover.caption && <span className="bl-cover__credit">{cover.caption}</span>}
      </div>
    );
  }

  return (
    <div className={classes} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- generated SVG line art */}
      <img
        className="bl-cover__art"
        src={cover.src}
        alt=""
        loading={loading}
        decoding="async"
        width={1200}
        height={750}
      />
      <span className="bl-cover__label">{coverLabel(post)}</span>
      <BrandMark light className="bl-cover__mark" />
      <span className="bl-cover__code">
        <strong>{cover.code}</strong>
        {cover.caption && <span>{cover.caption}</span>}
      </span>
    </div>
  );
}
