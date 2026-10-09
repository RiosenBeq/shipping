/**
 * Line-art vessel silhouettes used on desk cards. Pure SVG, inherits
 * `currentColor` for the hull and uses brass for the cargo system.
 */
export function TankerArt({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 320 96" fill="none" aria-hidden="true">
      {/* waterline */}
      <path d="M4 82 H316" stroke="currentColor" strokeOpacity=".18" strokeWidth="1" />
      {/* hull */}
      <path
        d="M14 58 H286 L304 62 L296 80 H30 L14 58 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* deck pipework */}
      <path d="M40 54 H236" stroke="#B8893A" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M40 50 H236" stroke="#B8893A" strokeOpacity=".5" strokeWidth="1" />
      {[60, 90, 120, 150, 180, 210].map((x) => (
        <path key={x} d={`M${x} 50 V58`} stroke="#B8893A" strokeWidth="1.2" />
      ))}
      {/* manifold + crane */}
      <path d="M138 58 V44 L150 36" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      {/* accommodation aft */}
      <path
        d="M246 58 V30 H274 V58"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M250 38 H270 M250 46 H270" stroke="currentColor" strokeOpacity=".5" />
      <path d="M262 30 V18 H270 V30" stroke="currentColor" strokeWidth="1.4" />
      {/* forecastle */}
      <path d="M286 58 V52 H298" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function GasCarrierArt({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 320 96" fill="none" aria-hidden="true">
      <path d="M4 82 H316" stroke="currentColor" strokeOpacity=".18" strokeWidth="1" />
      <path
        d="M14 58 H286 L304 62 L296 80 H30 L14 58 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* trunk deck with cargo domes */}
      <path d="M34 58 V44 H236 V58" stroke="#B8893A" strokeWidth="1.6" strokeLinejoin="round" />
      {[64, 112, 160, 208].map((x) => (
        <g key={x}>
          <path
            d={`M${x - 16} 44 Q ${x} 26 ${x + 16} 44`}
            stroke="#B8893A"
            strokeWidth="1.4"
            fill="none"
          />
          <path d={`M${x} 35 V28`} stroke="#B8893A" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      ))}
      <path
        d="M248 58 V30 H276 V58"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M252 38 H272 M252 46 H272" stroke="currentColor" strokeOpacity=".5" />
      <path d="M264 30 V18 H272 V30" stroke="currentColor" strokeWidth="1.4" />
      <path d="M286 58 V52 H298" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
