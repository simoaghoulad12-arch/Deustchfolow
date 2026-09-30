import type { WorldId } from '@/lib/brand';

/**
 * Commerce domain model. Shaped so a real backend (Shopify, Medusa, a custom
 * API…) can be dropped in behind `lib/commerce/provider.ts` without touching
 * UI components. Nothing here claims a live backend exists.
 */

/** Minor units (centimes). 24900 MAD = 249 DH. */
export type Money = { amountCents: number; currency: 'MAD' };

export type ProductCategory =
  'tank' | 'tee' | 'long-sleeve' | 'shorts' | 'hoodie' | 'jogger' | 'cap' | 'bag' | 'socks';

export type ImageRole = 'model' | 'front' | 'back' | 'detail' | 'flatlay' | 'lifestyle';

export interface ProductImage {
  src: string;
  alt: string;
  role: ImageRole;
  /**
   * `photo`   = real photography of the produced product.
   * `render`  = product mock-up / render (the flat lays). Labelled "Product
   *             render"; may differ in detail from the produced garment.
   * `concept` = campaign concept visual from the moodboards. Labelled
   *             "Concept visual".
   */
  kind: 'photo' | 'render' | 'concept';
  width: number;
  height: number;
  position?: string;
}

export type NonEmpty<T> = [T, ...T[]];

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Variant {
  sku: string;
  color: string;
  size: string;
  /**
   * Units available. `null` = not tracked yet (no inventory backend). The UI
   * treats `null` as orderable and `0` as sold out.
   */
  inventory: number | null;
}

export interface Product {
  slug: string;
  name: string;
  world: WorldId;
  category: ProductCategory;
  /** Line tier shown on the product board, e.g. "Performance". */
  line: string;
  price: Money;
  colors: NonEmpty<ProductColor>;
  sizes: NonEmpty<string>;
  variants: Variant[];
  /** Editorial description. Never states unverified material or tech specs. */
  story: string;
  /** Visible design details only — things you can see in the imagery. */
  details: string[];
  /** Confirmed specs. Leave undefined until verified by the brand. */
  specs?: { material?: string; care?: string; fit?: string; origin?: string };
  images: NonEmpty<ProductImage>;
  sizeGuide: 'tops' | 'bottoms' | 'one-size' | 'socks';
  featured?: boolean;
}

export interface CartLine {
  sku: string;
  slug: string;
  name: string;
  world: WorldId;
  color: string;
  size: string;
  unitPriceCents: number;
  quantity: number;
  image: string;
}

export interface ShippingMethod {
  id: string;
  label: string;
  eta: string;
  /** `null` = rate not confirmed yet; shown as "Confirmed at launch". */
  priceCents: number | null;
  /** Free above this subtotal (cents). */
  freeAboveCents?: number;
}

export interface Discount {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
}

export interface Address {
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
  country: string;
  email: string;
  phone?: string;
}

export type OrderStatus =
  'pending_payment' | 'paid' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  number: string;
  createdAt: string;
  status: OrderStatus;
  lines: CartLine[];
  shipping: ShippingMethod;
  discount?: Discount;
  subtotalCents: number;
  totalCents: number;
  address: Address;
}

export interface Customer {
  id: string;
  email: string;
  firstName?: string;
  orders: Order[];
  wishlist: string[];
}
