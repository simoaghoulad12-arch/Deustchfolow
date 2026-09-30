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
  /** Primary market: Morocco (79.6 % of the audience, see docs/BRAND_AUDIT.md). */
  currency: 'MAD' as const,
  locale: 'fr-MA',
};

/**
 * Delivery options. Rates and delivery times are NOT confirmed yet (no
 * carrier contract in the project), so `priceCents` is `null` and the UI says
 * "Confirmed at launch" instead of showing an invented number.
 */
export const DEFAULT_SHIPPING: ShippingMethod = {
  id: 'ma-standard',
  label: 'Delivery — Morocco',
  eta: 'All cities · timing confirmed at launch',
  priceCents: null,
};

export const SHIPPING_METHODS: ShippingMethod[] = [
  DEFAULT_SHIPPING,
  {
    id: 'eu-standard',
    label: 'Delivery — Europe',
    eta: 'Germany & EU · timing confirmed at launch',
    priceCents: null,
  },
];

export type ProviderResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: 'not_configured' | 'invalid' | 'error'; message: string };

export interface CommerceProvider {
  validateDiscount(code: string): Promise<ProviderResult<Discount>>;
  createCheckout(input: {
    lines: CartLine[];
    shippingId: string;
    discount?: string;
    address?: Address;
  }): Promise<ProviderResult<{ redirectUrl: string }>>;
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
    return {
      ...NOT_CONFIGURED,
      message: 'Payments are not connected yet. No order has been placed and nothing was charged.',
    };
  },
  async getOrders() {
    return { ...NOT_CONFIGURED, message: 'Customer accounts open with the Collection 01 launch.' };
  },
};

export function getCommerceProvider(): CommerceProvider {
  // Swap in a real implementation here once credentials exist.
  return offlineProvider;
}

/** 24900 → "249 DH". Whole dirhams are shown without decimals. */
export function formatPrice(cents: number): string {
  const dh = cents / 100;
  const text = new Intl.NumberFormat(COMMERCE.locale, {
    minimumFractionDigits: Number.isInteger(dh) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(dh);
  return `${text.replace(/\u202f|\u00a0/g, ' ')} DH`;
}

/** Shipping cost for a method, or `null` when the rate is not confirmed. */
export function shippingFor(method: ShippingMethod, subtotalCents: number): number | null {
  if (method.priceCents === null) return null;
  return method.freeAboveCents !== undefined && subtotalCents >= method.freeAboveCents
    ? 0
    : method.priceCents;
}
