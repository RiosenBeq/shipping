/**
 * Line-art vessel silhouettes (side profile, bow to the right). Pure SVG:
 * structure inherits `currentColor`, the cargo system is drawn in brass.
 * Decorative by default (aria-hidden); pass `title` to expose it as an image.
 */

const BRASS = "#B8893A";

type ArtProps = { className?: string; title?: string };

function a11y(title?: string) {
  return title ? { role: "img", "aria-label": title } : { "aria-hidden": true as const };
}

/** Sea surface and a few receding swell lines. */
function Sea() {
  return (
    <g stroke="currentColor" strokeLinecap="round">
      <path d="M2 74 H318" strokeOpacity=".28" />
      <path d="M26 80 h24 M74 80 h44 M146 80 h20 M196 80 h38 M258 80 h22" strokeOpacity=".16" />
      <path d="M48 86 h16 M104 86 h30 M176 86 h14 M226 86 h26" strokeOpacity=".08" />
    </g>
  );
}

/**
 * Hull above the waterline: transom stern, raised poop and forecastle, raked
 * stem with a little sheer, plus the boot-top line and hawse pipe.
 */
function Hull() {
  return (
    <g stroke="currentColor">
      <path
        d="M14 50 H64 L68 55 H262 L266 50 H292 Q300 49.5 308 46 L300 74 H22 L18 66 Q15 60 14 50 Z"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M20 69 H301" strokeOpacity=".35" />
      <circle cx="297" cy="55.5" r="1.6" strokeOpacity=".6" />
    </g>
  );
}

/** Aft accommodation block, wheelhouse with radar mast, raked funnel with brass band. */
function Accommodation() {
  return (
    <g stroke="currentColor" strokeLinejoin="round">
      <path d="M20 50 V31 H58 V50" strokeWidth="1.4" />
      <path d="M36 31 V23 H60 V31" strokeWidth="1.3" />
      <path d="M34 23 H63" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M39 27 H57" strokeDasharray="3 1.6" strokeOpacity=".7" />
      <path d="M23 36.5 H55 M23 42.5 H55" strokeDasharray="2.2 2.2" strokeOpacity=".5" />
      <path d="M54 23 V12.5 M50.5 15.5 H57.5" strokeLinecap="round" />
      <path d="M22 31 L24.5 13.5 H34.5 L35 31" strokeWidth="1.4" />
      <path d="M23.9 18.5 H34.7" stroke={BRASS} strokeWidth="2.2" />
    </g>
  );
}

/** Forecastle foremast with a masthead light. */
function Foremast() {
  return (
    <path
      d="M290 50 V35 M287 38.5 H293"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  );
}

/** Product / crude tanker: flush cargo deck with pipe rack, midships manifold and hose crane. */
export function TankerArt({ className, title }: ArtProps) {
  const supports = Array.from({ length: 14 }, (_, i) => 78 + i * 13.5);
  return (
    <svg className={className} viewBox="0 0 320 96" fill="none" {...a11y(title)}>
      {title && <title>{title}</title>}
      <Sea />
      <Hull />
      <Accommodation />
      {/* deck pipe rack */}
      <g stroke={BRASS} strokeLinecap="round">
        <path d="M72 52.5 H258" strokeWidth="1.4" />
        <path d="M72 50.3 H258" strokeOpacity=".55" />
        {supports.map((x) => (
          <path key={x} d={`M${x} 50.3 V55`} strokeOpacity=".7" strokeWidth=".9" />
        ))}
      </g>
      {/* midships manifold */}
      <path
        d="M157 55 V44.5 M163 55 V44.5 M169 55 V44.5 M154 44.5 H172"
        stroke={BRASS}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      {/* hose-handling crane */}
      <g stroke="currentColor" strokeLinecap="round">
        <path d="M181 55 V33" strokeWidth="1.3" />
        <path d="M181 35 L202 27.5" strokeWidth="1.1" />
        <path d="M202 27.5 V37" strokeOpacity=".5" strokeWidth=".8" />
      </g>
      <Foremast />
    </svg>
  );
}

/** Fully-refrigerated LPG carrier: trunk deck over the tanks, cargo domes with vent masts. */
export function GasCarrierArt({ className, title }: ArtProps) {
  const domes = [113, 155, 197, 239];
  return (
    <svg className={className} viewBox="0 0 320 96" fill="none" {...a11y(title)}>
      {title && <title>{title}</title>}
      <Sea />
      <Hull />
      <Accommodation />
      {/* trunk deck + cargo compressor house */}
      <g stroke="currentColor" strokeLinejoin="round">
        <path d="M74 55 V47 H260 V55" strokeWidth="1.4" />
        <path d="M78 47 V39.5 H91 V47" strokeWidth="1.2" />
        <path d="M81 43 H88" strokeOpacity=".5" />
      </g>
      {/* cargo domes, vapour line and vent masts */}
      <g stroke={BRASS} strokeLinecap="round" strokeLinejoin="round">
        <path d="M94 44.6 H256" strokeOpacity=".55" />
        {domes.map((x) => (
          <g key={x}>
            <path
              d={`M${x - 7} 47 V43 Q${x - 7} 39.5 ${x - 3.5} 39.5 H${x + 3.5} Q${x + 7} 39.5 ${x + 7} 43 V47`}
              strokeWidth="1.3"
            />
            <path d={`M${x + 11} 47 V22.5 M${x + 9.5} 22.5 H${x + 12.5}`} strokeOpacity=".85" />
          </g>
        ))}
      </g>
      {/* manifold crane */}
      <g stroke="currentColor" strokeLinecap="round">
        <path d="M176 47 V31" strokeWidth="1.3" />
        <path d="M176 33 L194 26.5" strokeWidth="1.1" />
        <path d="M194 26.5 V34" strokeOpacity=".5" strokeWidth=".8" />
      </g>
      <Foremast />
    </svg>
  );
}

/**
 * Fully pressurised LPG coaster: horizontal cylindrical (bullet) tanks sitting
 * on deck saddles, joined by a vapour line, each with a relief-valve mast.
 */
export function PressurisedGasArt({ className, title }: ArtProps) {
  const tanks = [78, 138, 198];
  const w = 52;
  return (
    <svg className={className} viewBox="0 0 320 96" fill="none" {...a11y(title)}>
      {title && <title>{title}</title>}
      <Sea />
      <Hull />
      <Accommodation />
      {/* deck saddles */}
      <g stroke="currentColor" strokeLinecap="round" strokeOpacity=".7">
        {tanks.map((x) => (
          <path key={x} d={`M${x + 12} 52.5 V55 M${x + w - 12} 52.5 V55`} strokeWidth="1.2" />
        ))}
      </g>
      {/* cylindrical tanks with brass end caps, vapour line and relief-valve masts */}
      <g stroke={BRASS} strokeLinecap="round" strokeLinejoin="round">
        {tanks.map((x) => (
          <g key={x}>
            <rect x={x} y="42" width={w} height="10.5" rx="5.25" strokeWidth="1.3" />
            <path d={`M${x + 5.5} 42.6 V51.9 M${x + w - 5.5} 42.6 V51.9`} strokeOpacity=".55" />
            <path d={`M${x + w / 2} 42 V38.5`} strokeOpacity=".85" />
            <path
              d={`M${x + w - 10} 42 V29 M${x + w - 11.5} 29 H${x + w - 8.5}`}
              strokeOpacity=".85"
            />
          </g>
        ))}
        <path d={`M${tanks[0] + w / 2} 38.5 H${tanks[2] + w / 2}`} strokeOpacity=".55" />
      </g>
      <Foremast />
    </svg>
  );
}
