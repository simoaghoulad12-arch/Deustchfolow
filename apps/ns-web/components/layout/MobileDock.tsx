'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/commerce/store';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

/**
 * Thumb-zone navigation for phones — most traffic arrives from Instagram on
 * an iPhone, so the four things people reach for live at the bottom edge.
 * Hidden on product pages (they carry their own sticky purchase bar) and at
 * checkout.
 */
export function MobileDock() {
  const pathname = usePathname();
  const { count, openCart, wishlist } = useStore();
  if (pathname.startsWith('/product/') || pathname.startsWith('/checkout')) return null;

  const item = (active: boolean) =>
    cn(
      'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[9px] font-medium uppercase tracking-[0.2em] transition-colors',
      active ? 'text-accent' : 'text-ivory/70',
    );

  return (
    <nav
      aria-label="Quick navigation"
      className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.07] bg-ink/85 backdrop-blur-xl lg:hidden"
    >
      <div className="flex">
        <Link href="/shop" className={item(pathname.startsWith('/shop'))}>
          <Icon name="grid" className="h-[18px] w-[18px]" />
          Shop
        </Link>
        <button
          type="button"
          className={item(pathname.startsWith('/worlds'))}
          onClick={() => window.dispatchEvent(new Event('natysimo:open-menu'))}
        >
          <Icon name="crown" className="h-[18px] w-[18px]" />
          Worlds
        </button>
        <Link href="/wishlist" className={item(pathname.startsWith('/wishlist'))}>
          <Icon name="heart" className="h-[18px] w-[18px]" />
          Saved {wishlist.length > 0 ? wishlist.length : ''}
        </Link>
        <button
          type="button"
          onClick={openCart}
          className={item(false)}
          aria-label={`Open bag, ${count} items`}
        >
          <Icon name="bag" className="h-[18px] w-[18px]" />
          Bag {count > 0 ? count : ''}
        </button>
      </div>
    </nav>
  );
}
