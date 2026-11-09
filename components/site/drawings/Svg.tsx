import { LAYERS, type View } from "./sheet";

/**
 * One view as an SVG: one path per layer (classes `dw-<layer>`, styled in app/drawings.css:
 * non-scaling hairlines, so a drawing stays crisp at any size), the longest stroke of the
 * drawn layers in `data-dl` for the draw-in, and optionally the stage's light ribbon along the
 * waterline. Decorative unless it gets a `title` (then `role="img"` with `<title>`).
 */
export function DrawingSvg({
  view,
  className,
  title,
  ribbon,
}: {
  view: View;
  className?: string;
  title?: string;
  /** Class of the ribbon group (its stroke, dash and glow come from that class's CSS). */
  ribbon?: string;
}) {
  const { w, h, paths, dl } = view;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className ? `dw ${className}` : "dw"}
      fill="none"
      data-dl={`${dl.o ?? 0} ${dl.d ?? 0} ${dl.m ?? 0}`}
      {...(title
        ? { role: "img", "aria-label": title }
        : { "aria-hidden": true, focusable: false })}
    >
      {title && <title>{title}</title>}
      {LAYERS.map((l) => paths[l] && <path key={l} className={`dw-${l}`} d={paths[l]} />)}
      {ribbon && view.ribbon && (
        <g className={ribbon}>
          <path
            className="dw-r"
            d={view.ribbon.d}
            pathLength={100}
            style={{ strokeWidth: view.ribbon.width }}
          />
        </g>
      )}
    </svg>
  );
}

/** A view with its HTML labels (Plex Mono, the same pixel size at every drawing size). */
export function LabelledView({
  view,
  className,
  title,
}: {
  view: View;
  className?: string;
  title?: string;
}) {
  return (
    <div className={className ? `dw-v ${className}` : "dw-v"}>
      <DrawingSvg view={view} title={title} />
      {view.labels.length > 0 && (
        <div className="dw-lbs" aria-hidden="true">
          {view.labels.map((l, i) => (
            <span
              key={i}
              className={`dw-lb dw-lb--${l.kind}${l.anchor ? ` dw-lb--${l.anchor}` : ""}${l.minor ? "dw-lb--minor" : ""}`}
              style={{
                left: `${Math.round((l.x / view.w) * 10000) / 100}%`,
                top: `${Math.round((l.y / view.h) * 10000) / 100}%`,
              }}
            >
              {l.text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
