/**
 * Terminal-vision mark for TechDrishti: an AI viewfinder locked on an eye
 * ("drishti" = sight), rendered in the site's CRT/matrix language: a single
 * cut top-right corner (matches .notch-corner), a scanline sweep, and a
 * layered glow built the same way as .text-glow (blurred stroke under a
 * sharp one) instead of an SVG filter, so it stays crisp at small sizes.
 */
export function TechDrishtiIcon({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <polygon
        points="1,1 50,1 63,14 63,63 1,63"
        fill="var(--color-ink-950)"
        stroke="var(--color-ink-700)"
        strokeWidth="1.5"
      />

      <clipPath id="td-clip">
        <polygon points="1,1 50,1 63,14 63,63 1,63" />
      </clipPath>
      <g clipPath="url(#td-clip)" opacity="0.5">
        <rect x="1" y="12" width="62" height="1" fill="var(--color-neon-500)" />
        <rect x="1" y="28" width="62" height="1" fill="var(--color-neon-500)" />
        <rect x="1" y="44" width="62" height="1" fill="var(--color-neon-500)" />
        <rect x="1" y="58" width="62" height="1" fill="var(--color-neon-500)" />
      </g>

      <g strokeLinecap="square">
        <path d="M13 20 V13 H20" stroke="var(--color-neon-400)" strokeWidth="2.5" />
        <path d="M44 13 H51 V20" stroke="var(--color-neon-400)" strokeWidth="2.5" />
        <path d="M13 44 V51 H20" stroke="var(--color-neon-400)" strokeWidth="2.5" />
        <path d="M44 51 H51 V44" stroke="var(--color-neon-400)" strokeWidth="2.5" />
      </g>

      <path
        d="M10 32 C 18 20, 46 20, 54 32 C 46 44, 18 44, 10 32 Z"
        stroke="var(--color-neon-500)"
        strokeWidth="4.5"
        strokeOpacity="0.35"
        fill="none"
      />
      <path
        d="M10 32 C 18 20, 46 20, 54 32 C 46 44, 18 44, 10 32 Z"
        stroke="var(--color-neon-300)"
        strokeWidth="2"
        fill="var(--color-ink-950)"
      />
      <rect x="29" y="29" width="6" height="6" fill="var(--color-neon-500)" />

      <rect x="10" y="31" width="44" height="2" fill="var(--color-neon-200)" opacity="0.65" />
    </svg>
  );
}
