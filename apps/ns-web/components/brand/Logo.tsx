'use client';

import { cn } from '@/lib/cn';

/**
 * Swap point for the real NS mark: drop the official file at
 * /public/brand/logo.svg and flip this to true. Nothing else changes —
 * every call site (nav, intro, footer) renders through this component.
 */
export const HAS_OFFICIAL_LOGO = false;

interface LogoProps {
  className?: string;
  /** Visual weight — intro uses "hero", nav/footer use "mark". */
  variant?: 'mark' | 'hero';
}

export function Logo({ className, variant = 'mark' }: LogoProps) {
  if (HAS_OFFICIAL_LOGO) {
    // eslint-disable-next-line @next/next/no-img-element -- brand SVG, no next/image processing needed
    return <img src="/brand/logo.svg" alt="NS" className={className} />;
  }

  return <PlaceholderMark className={className} variant={variant} />;
}

/**
 * Temporary monogram — not the final brand mark. Deliberately plain so it
 * reads as "pending asset" rather than a real logo design.
 */
function PlaceholderMark({ className, variant }: { className?: string; variant: 'mark' | 'hero' }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('overflow-visible', className)}
      role="img"
      aria-label="NS"
    >
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke="currentColor"
        strokeWidth={variant === 'hero' ? 0.75 : 1}
        opacity={0.5}
      />
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="38"
        fontWeight={500}
        letterSpacing="-1"
        fill="currentColor"
      >
        NS
      </text>
      <path
        d="M38 26 L44 34 L50 24 L56 34 L62 26"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gold"
        opacity={0.85}
      />
    </svg>
  );
}
