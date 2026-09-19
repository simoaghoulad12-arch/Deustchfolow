import { cn } from '@/lib/cn';

interface LogoProps {
  className?: string;
}

/**
 * The official NS mark — the intertwined N/S monogram with crown, cropped
 * directly from the supplied brand reference (public/brand/reference/) and
 * used unaltered everywhere the brand mark appears. Never redraw,
 * simplify, or substitute the ornate crest variant here — see ASSETS.md.
 */
export function Logo({ className }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- fixed brand asset, no responsive/optimized variants needed
    <img
      src="/brand/logo.png"
      alt="NS"
      className={cn('h-full w-full object-contain', className)}
    />
  );
}
