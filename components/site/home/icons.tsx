import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  ListChecks,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import {
  AnchorIcon,
  LpgIcon,
  OfficesIcon,
  SpotIcon,
  type DrawnIcon,
} from "@/components/site/drawings/icons";
import type { FactIcon } from "@/lib/content/options";
import { ICON_STROKE } from "@/components/site/iconStroke";

export { ICON_STROKE };

/** The business marks are the drawings' own icons (anchor, gas, offices, lanes); the rest lucide. */
const FACT_ICON: Record<FactIcon, LucideIcon | DrawnIcon> = {
  anchor: AnchorIcon,
  flame: LpgIcon,
  broker: UserRound,
  numbers: ListChecks,
  shield: ShieldCheck,
  clock: Clock,
  globe: OfficesIcon,
  route: SpotIcon,
};

/** A fact's line icon for the 46px outlined circle (§4.3). */
export function FactGlyph({ icon }: { icon: FactIcon }) {
  const Icon = FACT_ICON[icon] ?? AnchorIcon;
  return <Icon aria-hidden="true" strokeWidth={ICON_STROKE.ring} />;
}

/** The navy arrow badge of a brass CTA (`.lv-btn__arrow`). */
export function BtnArrow() {
  return (
    <span className="lv-btn__arrow" aria-hidden="true">
      <ArrowRight strokeWidth={ICON_STROKE.cta} />
    </span>
  );
}

export function Arrow() {
  return <ArrowRight aria-hidden="true" strokeWidth={ICON_STROKE.cta} />;
}

export function ArrowOut() {
  return <ArrowUpRight aria-hidden="true" strokeWidth={ICON_STROKE.cta} />;
}

/** Chat bubble with a handset: reads as WhatsApp without the brand mark. */
export function WhatsAppGlyph({ weight = "inline" }: { weight?: keyof typeof ICON_STROKE }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={ICON_STROKE[weight]}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      <path
        d="M15.6 13.9v1.2a.8.8 0 0 1-.9.8 7.9 7.9 0 0 1-3.4-1.2 7.8 7.8 0 0 1-2.4-2.4 7.9 7.9 0 0 1-1.2-3.5.8.8 0 0 1 .8-.8h1.2a.8.8 0 0 1 .8.7c.05.4.15.77.28 1.12a.8.8 0 0 1-.18.85l-.5.5a6.4 6.4 0 0 0 2.4 2.4l.5-.5a.8.8 0 0 1 .85-.18c.35.13.73.23 1.12.28a.8.8 0 0 1 .7.81z"
        strokeWidth="1.2"
      />
    </svg>
  );
}

/** The brass stamp on the letter: FIRST REPLY · 60 MIN · ISTANBUL around the mark (§7.9). */
export function Stamp({ text }: { text: string }) {
  return (
    <svg className="letter__stamp" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <defs>
        <path id="stamp-ring" d="M50 50 m-36 0 a36 36 0 1 1 72 0 a36 36 0 1 1 -72 0" />
      </defs>
      <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="50" cy="50" r="27" fill="none" stroke="currentColor" strokeWidth="1" />
      <text fontSize="8.6" fontWeight="500" fill="currentColor" className="letter__stamp-text">
        <textPath href="#stamp-ring" textLength="224" lengthAdjust="spacing">
          {text}
        </textPath>
      </text>
      <g transform="translate(34 34)">
        <circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M2 18 Q 9 18 14 17.6 Q 20 17.1 22 13.5 Q 25 12.8 30 12"
          stroke="currentColor"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
