# NATYSIMO — brand, asset & launch notes

`apps/ns-web` is the NATYSIMO storefront (Next.js 14, static, `pnpm --filter @ns/web dev` → http://localhost:3100).

## Brand name

**NATYSIMO** everywhere (metadata, copy, headings). The older spellings that
appear in some AI moodboards ("Nattysimo", "Natsissimo") are wrong; any
moodboard crop that has one of them baked into the image is excluded from the site.

## Three worlds

| World    | Palette                  | Logo file                         |
| -------- | ------------------------ | --------------------------------- |
| Sports   | black · silver · white   | `public/brand/logos/sports-*.png` |
| Clothing | black · gold · ivory     | `public/brand/logos/clothing-*`   |
| Hybrid   | black · gold · silver    | `public/brand/logos/hybrid-*`     |

Defined once in `lib/brand.ts`; CSS theming via `data-world` in `app/globals.css`.
The gold Clothing monogram doubles as the master NATYSIMO mark (nav, favicon,
footer) because it matches the monogram printed on the real garments.

Note: the source sheet labels the third logo **GYM** ("Stronger than
yesterday"). The site uses that mark for the **Hybrid** world. The `*-lockup.png`
files contain the sheet's baked-in "GYM" subtitle and are not used for Hybrid in the UI.

## Logos — never redrawn

Source: `brand-source/reference/logo-system-three-worlds.png`. Each file in
`public/brand/logos/` is a crop of that sheet with only the black ground
knocked out to transparency (alpha = luminance above ground level, colour
un-premultiplied). Composited on black it reproduces the source pixels
exactly. `components/brand/Mark.tsx` is the only way the UI renders a logo.
Keep marks on dark surfaces. When vector (SVG) masters exist, replace the
PNGs and update the dimensions in `lib/brand.ts`.

## Photography

`public/images/photo/` — real photography (gym mirror shots, Düsseldorf
founder shot, three flat lays) plus high-res detail crops taken from the flat lays.

`public/images/concept/` — small crops from the brand's AI moodboards, used
for pieces that have no real photography yet (Compression Long Sleeve,
Performance Tee, Premium Hoodie, Signature Cap, Jogger, Gym Bag). The
product page tags them **"Concept visual"**. They are low resolution
(~240 px wide). **Replacing them is the #1 visual upgrade.** Update the image
entries in `lib/commerce/catalog.ts` (`IMG` map); set `kind: 'photo'`.

Recommended shot list per product: model front, model back, flat front,
flat back, logo detail, fabric detail. 4:5 portrait, ≥ 2000 px long edge.

## Product data — what is and isn't claimed

- `details` lists only what is visible in the imagery.
- `specs` (material, care, fit, origin) is empty on purpose. The product
  page says full composition is published at launch. Fill it in once verified.
- **Prices are placeholders.** Set real prices in `catalog.ts`.
- The size guide shows standard body measurements, not garment measurements.
- Shipping rates in `lib/commerce/provider.ts` are marked "estimated" in the UI.
- "Designed in Düsseldorf" / `BRAND.origin` is based on the Königsallee
  photo. Confirm it, or change it in `lib/brand.ts`.

## Commerce — what is real

| Area                 | Status                                                                   |
| -------------------- | ------------------------------------------------------------------------ |
| Catalog, variants, SKUs | Live (static, `lib/commerce/catalog.ts`)                              |
| Cart, wishlist       | Live, stored per device in localStorage (`lib/commerce/store.tsx`)       |
| Inventory            | Modelled (`Variant.inventory`, `null` = untracked, `0` = sold out)       |
| Checkout UI          | Live, shows a clear "Preview — not taking payments" banner               |
| Payments / orders    | **Not connected.** `offlineProvider` returns `not_configured` and the UI says so |
| Discounts            | Not connected; the UI says codes activate at launch                      |
| Accounts             | Placeholder page                                                          |

To go live, implement `CommerceProvider` (`lib/commerce/provider.ts`) against
the chosen backend (Shopify Storefront API, Stripe Checkout, Medusa…), then set:

```
NEXT_PUBLIC_COMMERCE_PROVIDER=shopify
NEXT_PUBLIC_PAYMENTS_ENABLED=true
NEXT_PUBLIC_ACCOUNTS_ENABLED=true
NEXT_PUBLIC_SITE_URL=https://natysimo.com
NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/<handle>
NEXT_PUBLIC_INSTAGRAM_HANDLE=@<handle>
```

## Before taking orders (Germany)

`/legal/*` pages are structural placeholders. Impressum (§ 5 DDG), privacy
policy, AGB and withdrawal/returns policy must be supplied and reviewed.

## Instagram

No Instagram access was available while building this. The handle defaults
to `@natysimo` via `SOCIAL` in `lib/brand.ts`. **Confirm the real handle.**
The site's visual direction comes from the supplied photos: the founder's own
gym mirror shots, Königsallee lifestyle, dark concrete flat lays.
