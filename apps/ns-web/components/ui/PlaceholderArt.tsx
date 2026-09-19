import { cn } from '@/lib/cn';
import type { ProductCategory } from '@/data/products';

const SILHOUETTES: Record<ProductCategory, string> = {
  tanktop: 'M40 14 L44 9 L56 9 L60 14 L60 22 L68 26 L64 34 L60 30 L60 88 L40 88 L40 30 L36 34 L32 26 L40 22 Z',
  tee: 'M35 18 L42 12 L58 12 L65 18 L82 26 L74 42 L65 37 L65 88 L35 88 L35 37 L26 42 L18 26 Z',
  longsleeve:
    'M35 18 L42 12 L58 12 L65 18 L82 26 L74 84 L64 80 L64 40 L60 40 L60 88 L40 88 L40 40 L36 40 L36 80 L26 84 L18 26 Z',
  hoodie:
    'M50 8 C58 8 64 13 66 20 L82 28 L74 44 L66 39 L66 60 C66 60 70 78 70 88 L30 88 C30 78 34 60 34 60 L34 39 L26 44 L18 28 L34 20 C36 13 42 8 50 8 Z',
  pants: 'M32 12 L68 12 L70 50 L60 90 L52 90 L50 52 L48 52 L46 90 L38 90 L30 50 Z',
  shorts: 'M28 16 L72 16 L74 46 L58 46 L56 88 L46 88 L44 54 L36 54 L34 88 L24 88 L26 46 L28 16 Z',
  cap: 'M30 48 C30 30 70 30 70 48 L70 53 L30 53 Z M20 53 L80 53 L84 61 L46 66 L20 61 Z',
  bag: 'M26 38 Q26 28 36 28 L64 28 Q74 28 74 38 L74 74 Q74 84 64 84 L36 84 Q26 84 26 74 Z M40 28 Q40 16 50 16 Q60 16 60 28',
  socks:
    'M38 10 L62 10 L62 54 Q62 64 72 67 L82 71 Q86 73 86 79 L86 88 L45 88 Q40 88 40 82 L40 54 Z',
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
      {/* Spotlight — reads as a lit podium rather than empty flat space. */}
      <div
        className={cn(
          'absolute inset-0',
          isDark
            ? 'bg-[radial-gradient(ellipse_60%_55%_at_50%_42%,rgba(183,155,106,0.16),transparent_70%)]'
            : 'bg-[radial-gradient(ellipse_60%_55%_at_50%_42%,rgba(58,58,56,0.1),transparent_70%)]'
        )}
      />
      <div
        className={cn(
          'absolute inset-0',
          isDark
            ? 'bg-[radial-gradient(circle_at_50%_50%,transparent_45%,rgba(0,0,0,0.55)_100%)]'
            : 'bg-[radial-gradient(circle_at_50%_50%,transparent_45%,rgba(0,0,0,0.08)_100%)]'
        )}
      />
      <svg
        viewBox="0 0 100 100"
        className="relative h-[85%] w-[85%]"
        aria-hidden="true"
      >
        <ellipse cx="50" cy="92" rx="26" ry="4" fill={isDark ? '#000000' : '#0a0a0a'} opacity={isDark ? 0.5 : 0.12} />
        <path
          d={SILHOUETTES[category]}
          fill="none"
          stroke={isDark ? '#e9e6dd' : '#0a0a0a'}
          strokeOpacity={0.32}
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
