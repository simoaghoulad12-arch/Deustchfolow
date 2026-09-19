import { cn } from '@/lib/cn';
import type { ProductCategory } from '@/data/products';

const SILHOUETTES: Record<ProductCategory, string> = {
  tee: 'M35 18 L42 12 L58 12 L65 18 L82 26 L74 42 L65 37 L65 88 L35 88 L35 37 L26 42 L18 26 Z',
  hoodie:
    'M50 8 C58 8 64 13 66 20 L82 28 L74 44 L66 39 L66 60 C66 60 70 78 70 88 L30 88 C30 78 34 60 34 60 L34 39 L26 44 L18 28 L34 20 C36 13 42 8 50 8 Z',
  shorts: 'M28 16 L72 16 L74 46 L58 46 L56 88 L46 88 L44 54 L36 54 L34 88 L24 88 L26 46 L28 16 Z',
  pants: 'M32 12 L68 12 L70 50 L60 90 L52 90 L50 52 L48 52 L46 90 L38 90 L30 50 Z',
};

interface PlaceholderArtProps {
  category: ProductCategory;
  className?: string;
  tone?: 'ink' | 'bone';
  showLabel?: boolean;
}

/**
 * Ghost-mannequin style silhouette used wherever real product photography
 * has not been supplied yet. Reads as an intentional design state, not a
 * broken image — swap in real photography via the product data's `images`
 * paths once available.
 */
export function PlaceholderArt({ category, className, tone = 'ink', showLabel = true }: PlaceholderArtProps) {
  const isDark = tone === 'ink';
  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden',
        isDark ? 'bg-ink' : 'bg-bone',
        className
      )}
    >
      <div
        className={cn(
          'absolute inset-0',
          isDark
            ? 'bg-[radial-gradient(circle_at_50%_35%,rgba(183,155,106,0.12),transparent_60%)]'
            : 'bg-[radial-gradient(circle_at_50%_35%,rgba(58,58,56,0.08),transparent_60%)]'
        )}
      />
      <svg
        viewBox="0 0 100 100"
        className="relative h-[70%] w-[70%]"
        aria-hidden="true"
      >
        <path
          d={SILHOUETTES[category]}
          fill="none"
          stroke={isDark ? '#e9e6dd' : '#0a0a0a'}
          strokeOpacity={0.28}
          strokeWidth={1.1}
        />
      </svg>
      {showLabel ? (
        <span
          className={cn(
            'absolute bottom-3 right-3 text-[9px] uppercase tracking-widest2',
            isDark ? 'text-bone/30' : 'text-ink/30'
          )}
        >
          NS &mdash; asset pending
        </span>
      ) : null}
    </div>
  );
}
