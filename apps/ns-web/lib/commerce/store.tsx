'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartLine } from './types';

/**
 * Client-side cart + wishlist. Persisted per device in localStorage (a
 * convenience only — the order of record will live in the commerce backend
 * once connected). Every storage access is guarded: private mode or blocked
 * storage simply means an in-memory session.
 */

interface StoreValue {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addLine: (line: Omit<CartLine, 'quantity'>, quantity?: number) => void;
  setQuantity: (sku: string, quantity: number) => void;
  removeLine: (sku: string) => void;
  clearCart: () => void;
  wishlist: string[];
  isWished: (slug: string) => boolean;
  toggleWish: (slug: string) => void;
  toast: string | null;
}

const StoreContext = createContext<StoreValue | null>(null);
const CART_KEY = 'natysimo.cart.v2';
const WISH_KEY = 'natysimo.wishlist.v1';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — keep in memory */
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const storedLines = read<CartLine[]>(CART_KEY, []);
    setLines(Array.isArray(storedLines) ? storedLines.filter((l) => l && typeof l.sku === 'string') : []);
    const storedWish = read<string[]>(WISH_KEY, []);
    setWishlist(Array.isArray(storedWish) ? storedWish : []);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) write(CART_KEY, lines);
  }, [lines, hydrated]);

  useEffect(() => {
    if (hydrated) write(WISH_KEY, wishlist);
  }, [wishlist, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const addLine = useCallback<StoreValue['addLine']>((line, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.sku === line.sku);
      if (existing) return prev.map((l) => (l.sku === line.sku ? { ...l, quantity: Math.min(l.quantity + quantity, 10) } : l));
      return [...prev, { ...line, quantity }];
    });
    setCartOpen(true);
  }, []);

  const setQuantity = useCallback((sku: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0 ? prev.filter((l) => l.sku !== sku) : prev.map((l) => (l.sku === sku ? { ...l, quantity: Math.min(quantity, 10) } : l))
    );
  }, []);

  const removeLine = useCallback((sku: string) => setLines((prev) => prev.filter((l) => l.sku !== sku)), []);
  const clearCart = useCallback(() => setLines([]), []);

  const toggleWish = useCallback((slug: string) => {
    setWishlist((prev) => {
      const has = prev.includes(slug);
      setToast(has ? 'Removed from wishlist' : 'Saved to wishlist');
      return has ? prev.filter((s) => s !== slug) : [...prev, slug];
    });
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotalCents: lines.reduce((n, l) => n + l.unitPriceCents * l.quantity, 0),
      cartOpen,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      addLine,
      setQuantity,
      removeLine,
      clearCart,
      wishlist,
      isWished: (slug: string) => wishlist.includes(slug),
      toggleWish,
      toast,
    }),
    [lines, cartOpen, addLine, setQuantity, removeLine, clearCart, wishlist, toggleWish, toast]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
