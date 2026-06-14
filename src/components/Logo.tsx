/**
 * GymPal custom mark — a neon dumbbell glyph drawn as SVG (no emoji, no image asset).
 * `withWordmark` renders the icon plus the "GymPal" wordmark for the desktop nav.
 */

interface LogoProps {
  className?: string
  withWordmark?: boolean
}

export default function Logo({ className, withWordmark = false }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* bar */}
        <rect x="11" y="14.5" width="10" height="3" rx="1.5" fill="var(--primary)" />
        {/* left plates */}
        <rect x="4" y="10" width="3.5" height="12" rx="1.5" fill="var(--primary)" />
        <rect x="8" y="12" width="3" height="8" rx="1.5" fill="var(--primary)" opacity="0.7" />
        {/* right plates */}
        <rect x="24.5" y="10" width="3.5" height="12" rx="1.5" fill="var(--primary)" />
        <rect x="21" y="12" width="3" height="8" rx="1.5" fill="var(--primary)" opacity="0.7" />
      </svg>
      {withWordmark && (
        <span className="text-lg font-bold tracking-tight">
          Gym<span className="text-primary">Pal</span>
        </span>
      )}
    </span>
  )
}
