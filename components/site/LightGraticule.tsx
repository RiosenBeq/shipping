/**
 * Navy-tinted take on the kit's `.uv-hero-pattern` graticule for light
 * headers: same 120px chart grid with 24px minor lines, faded in from the end
 * edge. Inline because the kit class is tuned for navy and isn't edited here.
 */
const LIGHT_GRATICULE: React.CSSProperties = {
  backgroundImage:
    "conic-gradient(from 90deg at 1px 1px, #0000 90deg, rgba(10,31,51,0.07) 0), conic-gradient(from 90deg at 1px 1px, #0000 90deg, rgba(10,31,51,0.035) 0)",
  backgroundSize: "120px 120px, 24px 24px",
  WebkitMaskImage: "radial-gradient(ellipse 80% 75% at 75% 40%, #000 15%, transparent 72%)",
  maskImage: "radial-gradient(ellipse 80% 75% at 75% 40%, #000 15%, transparent 72%)",
};

/**
 * The light header's graticule, filling the end half on desktop. Used by
 * PageHeader and by the 404 and error views, which build their own sand
 * header. Place inside a `relative isolate` section.
 */
export function LightGraticule() {
  return (
    // Static (no drift) and decorative only.
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 end-0 -z-10 hidden w-[55%] lg:block rtl:-scale-x-100"
      style={LIGHT_GRATICULE}
    />
  );
}
