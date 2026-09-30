import type { Address, CartLine, Discount, Order, ShippingMethod } from './types';

/**
 * Backend connection status. Everything commerce-related that needs a server
 * (payments, orders, accounts, inventory, discounts) goes through here, and
 * every method reports honestly when no backend is configured.
 *
 * To go live: implement `CommerceProvider` against the chosen platform and set
 * NEXT_PUBLIC_COMMERCE_PROVIDER + the platform's server-side credentials.
 */

export const COMMERCE = {
  provider: process.env.NEXT_PUBLIC_COMMERCE_PROVIDER ?? null,
  paymentsEnabled: process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true',
  accountsEnabled: process.env.NEXT_PUBLIC_ACCOUNTS_ENABLED === 'true',
  currency: 'EUR' as const,
  locale: 'de-DE',
};

/**
 * Shipping options shown at checkout. Rates are the brand's planned
 * structure and are flagged "final at launch" in the UI until a shipping
 * backend confirms them.
 */
export const DEFAULT_SHIPPING: ShippingMethod = { id: 'de-standard', label: 'Standard — Germany', eta: '2–4 business days', priceCents: 495, freeAboveCents: 10000 };

export const SHIPPING_METHODS: ShippingMethod[] = [
  DEFAULT_SHIPPING,
  { id: 'eu-standard', label: 'Standard — EU', eta: '4–8 business days', priceCents: 1295 },
];

export type ProviderResult<T> = { ok: true; data: T } | { ok: false; reason: 'not_configured' | 'invalid' | 'error'; message: string };

export interface CommerceProvider {
  validateDiscount(code: string): Promise<ProviderResult<Discount>>;
  createCheckout(input: { lines: CartLine[]; shippingId: string; discount?: string; address?: Address }): Promise<ProviderResult<{ redirectUrl: string }>>;
  getOrders(customerId: string): Promise<ProviderResult<Order[]>>;
}

const NOT_CONFIGURED = {
  ok: false as const,
  reason: 'not_configured' as const,
  message: 'The NATYSIMO store backend is not connected yet.',
};

/** Default provider: no backend. Every call says so — nothing is faked. */
export const offlineProvider: CommerceProvider = {
  async validateDiscount() {
    return { ...NOT_CONFIGURED, message: 'Discount codes activate when the store opens.' };
  },
  async createCheckout() {
    return { ...NOT_CONFIGURED, message: 'Payments are not connected yet. No order has been placed and nothing was charged.' };
  },
  async getOrders() {
    return { ...NOT_CONFIGURED, message: 'Customer accounts open with the Collection 01 launch.' };
  },
};

export function getCommerceProvider(): CommerceProvider {
  // Swap in a real implementation here once credentials exist.
  return offlineProvider;
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat(COMMERCE.locale, { style: 'currency', currency: COMMERCE.currency }).format(cents / 100);
}

export function shippingFor(method: ShippingMethod, subtotalCents: number): number {
  return method.freeAboveCents !== undefined && subtotalCents >= method.freeAboveCents ? 0 : method.priceCents;
}
