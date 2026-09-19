'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface CartLine {
  slug: string;
  name: string;
  priceCents: number;
  color: string;
  size: string;
  quantity: number;
  image: string;
}

interface CartContextValue {
  lines: CartLine[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  addLine: (line: Omit<CartLine, 'quantity'>, quantity?: number) => void;
  removeLine: (slug: string, color: string, size: string) => void;
  setQuantity: (slug: string, color: string, size: string, quantity: number) => void;
  subtotalCents: number;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'ns-cart-v1';

function lineKey(slug: string, color: string, size: string): string {
  return `${slug}__${color}__${size}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      // localStorage unavailable (private mode, blocked storage) — cart starts empty.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // storage write can fail silently; cart still works for this session.
    }
  }, [lines, hydrated]);

  const addLine = useCallback<CartContextValue['addLine']>((line, quantity = 1) => {
    setLines((prev) => {
      const key = lineKey(line.slug, line.color, line.size);
      const existing = prev.find((item) => lineKey(item.slug, item.color, item.size) === key);
      if (existing) {
        return prev.map((item) =>
          lineKey(item.slug, item.color, item.size) === key
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...line, quantity }];
    });
    setIsOpen(true);
  }, []);

  const removeLine = useCallback<CartContextValue['removeLine']>((slug, color, size) => {
    const key = lineKey(slug, color, size);
    setLines((prev) => prev.filter((item) => lineKey(item.slug, item.color, item.size) !== key));
  }, []);

  const setQuantity = useCallback<CartContextValue['setQuantity']>((slug, color, size, quantity) => {
    const key = lineKey(slug, color, size);
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((item) => lineKey(item.slug, item.color, item.size) !== key)
        : prev.map((item) =>
            lineKey(item.slug, item.color, item.size) === key ? { ...item, quantity } : item
          )
    );
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const subtotalCents = lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
    const count = lines.reduce((sum, line) => sum + line.quantity, 0);
    return {
      lines,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      addLine,
      removeLine,
      setQuantity,
      subtotalCents,
      count,
    };
  }, [lines, isOpen, addLine, removeLine, setQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
