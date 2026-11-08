import { stills, type StillKey } from "@/lib/media";

/** A graded still's sources and focal point (public pages use graded files only). */
export function stillSource(id: StillKey) {
  const s = stills[id];
  const g = s.graded;
  return {
    avif: g.avif,
    webp: g.webp,
    width: g.width,
    height: g.height,
    position: `${Math.round(s.look.focal.x * 100)}% ${Math.round(s.look.focal.y * 100)}%`,
  };
}

/** A decorative graded still (AVIF, WebP fallback), lazy, cropped around its focal point. */
export function Still({ id, className }: { id: StillKey; className?: string }) {
  const s = stillSource(id);
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={s.avif} />
      {/* eslint-disable-next-line @next/next/no-img-element -- graded still in a fixed box */}
      <img
        src={s.webp}
        alt=""
        width={s.width}
        height={s.height}
        loading="lazy"
        decoding="async"
        style={{ objectPosition: s.position }}
      />
    </picture>
  );
}
