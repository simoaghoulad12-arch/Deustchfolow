'use client';

import { useStore } from '@/lib/commerce/store';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

export function WishButton({ slug, name, className }: { slug: string; name: string; className?: string }) {
  const { isWished, toggleWish } = useStore();
  const active = isWished(slug);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWish(slug);
      }}
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      className={cn('flex h-11 w-11 items-center justify-center transition-colors', active ? 'text-gold' : 'text-ivory/80 hover:text-ivory', className)}
    >
      <Icon name="heart" filled={active} />
    </button>
  );
}
