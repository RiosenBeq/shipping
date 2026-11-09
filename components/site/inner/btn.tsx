import { ArrowRight } from "lucide-react";
import { ICON_STROKE } from "@/components/site/iconStroke";

/*
 * Button and link arrows, in a module of their own: client components (the freight
 * calculator) import them from here, so their bundles never pull in ./ui's media manifest.
 */

/** Label + arrow badge: the inside of a `.lv-btn--cta` (brass) or `.lv-btn--ink` button. */
export function BtnLabel({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span>{children}</span>
      <span className="lv-btn__arrow" aria-hidden="true">
        <ArrowRight strokeWidth={ICON_STROKE.cta} />
      </span>
    </>
  );
}

/** Inline arrow for `.lv-link` text links: `<a className="lv-link"><span>…</span><LinkArrow/></a>`. */
export function LinkArrow() {
  return <ArrowRight aria-hidden="true" strokeWidth={ICON_STROKE.cta} />;
}
