/**
 * MarcosLogoMark  compact icon badge that works from 24px to 48px.
 * Uses CSS custom properties so it adapts to light/dark themes automatically.
 *
 * MarcosLogotype  horizontal full lockup: icon + "Marcos Music / Agenda" text.
 */

interface LogoProps {
  size?: number;
  className?: string;
}

export function MarcosLogoMark({ size = 36, className = '' }: LogoProps) {
  const id = `mm-grad-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      aria-label="Marcos Music Agenda"
      className={className}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent-gradient-from)" />
          <stop offset="100%" stopColor="var(--accent-gradient-to)" />
        </linearGradient>
      </defs>

      {/* Background pill */}
      <rect width="36" height="36" rx="10" fill={`url(#${id})`} />

      {/* Staff lines  three thin horizontal lines, bottom area */}
      <line x1="3"  y1="25" x2="33" y2="25" stroke="white" strokeWidth="0.75" opacity="0.35" />
      <line x1="3"  y1="29" x2="33" y2="29" stroke="white" strokeWidth="0.75" opacity="0.35" />
      <line x1="3"  y1="33" x2="33" y2="33" stroke="white" strokeWidth="0.75" opacity="0.35" />

      {/* Bold italic "M"  main focal point */}
      <text
        x="3"
        y="28"
        fill="white"
        fontSize="24"
        fontWeight="900"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
      >
        M
      </text>

      {/* Quarter note  top-right accent */}
      <text
        x="25"
        y="14"
        fill="white"
        fontSize="12"
        opacity="0.88"
        fontFamily="serif"
      >
        ♪
      </text>
    </svg>
  );
}

interface LogotypeProps {
  iconSize?: number;
  className?: string;
}

export function MarcosLogotype({ iconSize = 36, className = '' }: LogotypeProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <MarcosLogoMark size={iconSize} />
      <div className="leading-none">
        <p
          className="font-black tracking-tight whitespace-nowrap"
          style={{ color: 'var(--text)', fontSize: iconSize * 0.36 }}
        >
          Marcos Music
        </p>
        <p
          className="font-bold uppercase tracking-widest whitespace-nowrap"
          style={{ color: 'var(--accent-600)', fontSize: iconSize * 0.24 }}
        >
          Agenda
        </p>
      </div>
    </div>
  );
}
