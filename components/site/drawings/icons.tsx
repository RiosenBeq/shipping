import type { SVGProps } from "react";

/**
 * Business icons in the drawings' language: brass line glyphs on the lucide 24px grid (same
 * props, so they drop in where a lucide icon was: `strokeWidth`, `aria-hidden`, `className`).
 * UI chrome — arrows, menus, mail, phone, alerts — stays lucide.
 */
export type DrawnIcon = (props: SVGProps<SVGSVGElement>) => JSX.Element;

function glyph(name: string, body: JSX.Element): DrawnIcon {
  const Icon = ({ strokeWidth = 1.5, className, ...rest }: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ? `dw-icon dw-icon--${name} ${className}` : `dw-icon dw-icon--${name}`}
      {...rest}
    >
      {body}
    </svg>
  );
  Icon.displayName = `Icon(${name})`;
  return Icon;
}

const FILL = { fill: "currentColor", stroke: "none" } as const;

/** Crude: a drop with the level of a dark cargo in it. */
export const CrudeIcon = glyph(
  "crude",
  <>
    <path d="M12 3.2S6 9.9 6 14.1a6 6 0 0 0 12 0C18 9.9 12 3.2 12 3.2Z" />
    <path d="M8.1 14.9q1.95-1.3 3.9 0t3.9 0" />
    <path d="M8.6 17.3q1.7.9 3.4.9t3.4-.9" {...FILL} fillOpacity={0.35} />
  </>
);

/** Clean products: a distillation column with its trays and side draws. */
export const CleanIcon = glyph(
  "clean",
  <>
    <rect x={8.5} y={2.8} width={6} height={18} rx={3} />
    <path d="M8.5 8.2h6M8.5 12.2h6M8.5 16.2h6" strokeOpacity={0.6} />
    <path d="M14.5 6.4h3.2v2.4M14.5 10.4h3.2v2.4M14.5 14.4h3.2v2.4" />
    <path d="M5.5 21.2h13" />
  </>
);

/** LPG: a horizontal Type C pressure vessel on its saddles, a relief valve on the dome. */
export const LpgIcon = glyph(
  "lpg",
  <>
    <path d="M7 8.2h10a3.9 3.9 0 0 1 0 7.8H7a3.9 3.9 0 0 1 0-7.8Z" />
    <path d="M7.4 8.6v7M16.6 8.6v7" strokeOpacity={0.55} />
    <path d="M12 8.2V5.6M10.5 5.6h3" />
    <path d="M7.2 16v3.4M16.8 16v3.4M5 19.6h4.4M14.6 19.6h4.4" />
  </>
);

/** Ammonia: NH₃ — nitrogen with its lone pair over three hydrogens (the front bond dashed). */
export const AmmoniaIcon = glyph(
  "ammonia",
  <>
    <circle cx={12} cy={10.4} r={2.5} />
    <path d="M10.3 5.4q1.7-1.2 3.4 0" />
    <path d="M10 12l-4 3.3M14 12l4 3.3" />
    <path d="M12 12.9v4.4" strokeDasharray="1.2 1.6" />
    <circle cx={5} cy={16.4} r={1.5} />
    <circle cx={19} cy={16.4} r={1.5} />
    <circle cx={12} cy={19.4} r={1.5} />
  </>
);

/** Turkish Straits: the narrow channel between two shores and a suspension bridge across. */
export const StraitsIcon = glyph(
  "straits",
  <>
    <path d="M3.4 3.2c2.2 2.8 1.6 6 3.6 9.2 1.6 2.6 1.4 5.4 3.2 8.4" strokeOpacity={0.7} />
    <path d="M20.6 3.2c-2.2 2.8-1.6 6-3.6 9.2-1.6 2.6-1.4 5.4-3.2 8.4" strokeOpacity={0.7} />
    <path d="M3.4 14h17.2M7 10.4v5.6M17 10.4v5.6" />
    <path d="M3.4 13.4 7 10.4q5 4.6 10 0l3.6 3" />
  </>
);

/** Spot: one voyage, port to port. */
export const SpotIcon = glyph(
  "spot",
  <>
    <circle cx={4.6} cy={18} r={1.8} />
    <circle cx={19.4} cy={6} r={1.8} {...FILL} />
    <path d="M6.2 16.6C8.6 10.8 12.6 8 17.2 6.6" strokeDasharray="2 1.9" />
    <path d="m13.9 5.4 3.3 1.2-2.2 2.8" />
  </>
);

/** Time charter: the ship and the clock that runs while she is on hire. */
export const TimeCharterIcon = glyph(
  "tc",
  <>
    <circle cx={15.6} cy={8} r={5.2} />
    <path d="M15.6 5.3V8l1.9 1.3" />
    <path d="M2.6 15.2h11.6l-1.7 3.6H4.2Z" />
    <path d="M4.2 15.2v-2.6h2.6v2.6" />
    <path d="M1.8 21h13.6" strokeOpacity={0.55} />
  </>
);

/** COA: a programme of cargoes — the round voyage, repeated, with its liftings. */
export const CoaIcon = glyph(
  "coa",
  <>
    <path d="M19.2 12a7.2 7.2 0 1 1-2.1-5.1" />
    <path d="M17.6 3.9v3.3h-3.3" />
    <circle cx={5.1} cy={14.4} r={1.15} {...FILL} />
    <circle cx={12} cy={19.2} r={1.15} {...FILL} />
    <circle cx={18.9} cy={14.4} r={1.15} {...FILL} />
  </>
);

/** Offices: the globe with Istanbul, London and Singapore marked. */
export const OfficesIcon = glyph(
  "offices",
  <>
    <circle cx={12} cy={12} r={8.6} />
    <path
      d="M12 3.4c-2.6 2.4-3.8 5.4-3.8 8.6s1.2 6.2 3.8 8.6M12 3.4c2.6 2.4 3.8 5.4 3.8 8.6s-1.2 6.2-3.8 8.6M3.4 12h17.2"
      strokeOpacity={0.55}
    />
    <circle cx={9.7} cy={7.6} r={1.25} {...FILL} />
    <circle cx={13.4} cy={9.2} r={1.25} {...FILL} />
    <circle cx={17.3} cy={14.6} r={1.25} {...FILL} />
  </>
);

/** Inquiry: signal flag K — "I wish to communicate with you". */
export const InquiryIcon = glyph(
  "inquiry",
  <>
    <path d="M5 21V3.2" />
    <path d="M5 4.4h14v9H5" />
    <path d="M12 4.4v9" />
    <path d="M12 4.4h7v9h-7Z" {...FILL} fillOpacity={0.32} />
  </>
);

/** Anchor: a stockless bower anchor, as drawn on the GA's bow. */
export const AnchorIcon = glyph(
  "anchor",
  <>
    <circle cx={12} cy={4.3} r={1.7} />
    <path d="M12 6v13.6M9 8.6h6" />
    <path d="M6.6 14.6q1.6 4.6 5.4 5t5.4-5" />
    <path d="m6.6 14.6-.9 2.2M17.4 14.6l.9 2.2" />
  </>
);

/** Tanker: a profile — accommodation and funnel aft, the deck, the waterline. */
export const TankerIcon = glyph(
  "tanker",
  <>
    <path d="M2.4 13.6h16.4l.6-.9h2.2l-1.8 5.5H4.1Z" />
    <path d="M4 13.6V9.4h3.6v4.2" />
    <path d="m4.5 9.4.4-2.6h1.7l-.2 2.6" />
    <path d="M9.4 12.6h8" strokeOpacity={0.6} />
    <path d="M1.6 20.6h20.8" strokeOpacity={0.55} />
  </>
);
