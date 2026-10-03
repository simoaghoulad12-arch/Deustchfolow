# NATYSIMO — asset inventory & rules

`apps/ns-web` is the NATYSIMO storefront (Next.js 14, static). Run it with `pnpm --filter @ns/web dev`
(→ http://localhost:3100). Related docs: `docs/BRAND_AUDIT.md` (Instagram audit),
`docs/PRICING.md`, `docs/DESIGN_SYSTEM.md`, `docs/AI_VISUAL_BRIEF.md`.

## Inventory

Originals are preserved in `brand-source/reference/` (not served). Everything in `public/` is an
optimised copy or crop of them.

### Logos — `public/brand/logos/`
| File | What | Source |
| --- | --- | --- |
| `sports-mark.png` / `sports-lockup.png` | Sports world (silver, angular NS) | logo sheet |
| `clothing-mark.png` / `clothing-lockup.png` | Clothing world + master mark (gold serif NS) | logo sheet |
| `hybrid-mark.png` / `hybrid-lockup.png` | Hybrid world (the sheet's "GYM" mark, forged steel) | logo sheet |
| `app/icon.png`, `app/apple-icon.png` | Favicon (clothing mark, square) | logo sheet |

Each logo is a crop of `brand-source/reference/logo-system-three-worlds.png` with only the black
ground knocked out to alpha. The marks are never redrawn, retyped, recoloured or distorted. Always
render them through `components/brand/Mark.tsx`, on dark surfaces. The `*-lockup` files contain the
sheet's own subtitles (Sports / Clothing / **Gym**), so the Hybrid lockup isn't used in the UI.

Not used as a logo: `logo-crest.png` (ornate lion crest). Reference only.

Observation from real photos: produced pieces carry **two mark variants**:
- the intertwined crown monogram (Performance Tank, Training Shorts);
- a side-by-side "NS" under a crown with the NATYSIMO wordmark (Essential Tee, Crossbody Bag,
  Essential Shorts, Crew Socks).

Both are the brand's own marks; product copy names the right one per product.

### Real photography — `public/images/photo/` (`kind: 'photo'`)
| File | Content |
| --- | --- |
| `gym-tank-mirror.jpg`, `gym-tank-shorts.jpg` | Founder in the Performance Tank + Training Shorts, gym |
| `founder-duesseldorf.jpg` | Founder on Königsallee: Essential Tee, Essential Shorts, Crossbody Bag, Crew Socks |
| `worn-tank-chest.jpg`, `worn-shorts-leg.jpg`, `worn-tee-bag.jpg`, `worn-socks.jpg` | Detail crops of the above |

### Product renders — `public/images/render/` (`kind: 'render'`, tagged "Product render")
The three concrete flat lays (tank + shorts, essential tee, graphic tee) and two detail crops. They
show render tells (synthetic "€09.99" tag, packaging box, an "NS COLLECTION" chest print that differs
from the produced tee). They are treated as mock-ups, not photography. Claims supported only by a
render (hem tab, box, centre-chest monogram) are not made anywhere on the site.

### Concept visuals — `public/images/concept/` (`kind: 'concept'`, tagged "Concept visual")
Small crops (~125–260 px wide) from the AI moodboards, used for pieces without real imagery:
Compression Long Sleeve, Performance Tee, Premium Hoodie, Signature Cap, Jogger, Gym Bag. Crops with
misspelled brand names baked in ("NATSISSIMO", "NATTYSIMO") are excluded. Replacing these is the #1
visual task; see `docs/AI_VISUAL_BRIEF.md`.

### Other
- Fonts: Cormorant Garamond (display), Inter (UI), IBM Plex Mono (technical). All via `next/font`.
- Icons: inline SVG set in `components/ui/Icon.tsx`.
- Video: `Simo.MP4` (70 MB) exists in the owner's Google Drive "Instagram reels" folder. It isn't
  in the repo; it's a candidate for a hero loop once cut to ≤ 8 s and ≤ 2 MB.

Folder = truth: `lib/images.ts#kindOf()` derives the kind from the path, and the tests fail if a
catalog image is labelled differently from its folder.

## Brand facts used on the site
- Name **NATYSIMO**. Instagram **@natty.simo**. "NATTYSIMO"/"Natsissimo" are old or incorrect
  spellings.
- Roots: Morocco · Germany (79.6 % of the audience is in Morocco; the founder is based in Germany).
- Community "20K+" (21,218 followers in the 18 Sep 2026 export). Update it; never round it up.

## Product data rules
- `details` = only what real photos (or, if labelled, renders) show.
- `specs` (fit, material, care) stays empty until verified. The UI says "published at launch".
- Prices: MAD, see `docs/PRICING.md`. Sets have permanent set prices (≤ 12 % saving, tested).
- Inventory: `null` = untracked, shown as "availability confirmed at launch", never as "in stock".

## Commerce — what is real
| Area | Status |
| --- | --- |
| Catalog, variants, SKUs, sets | Live (static) |
| Cart, wishlist | Live, per device (localStorage) |
| Search | Live (client-side over products, sets, worlds) |
| Checkout UI | Live, with a "Preview — not taking payments" banner |
| Payments / orders / COD | **Not connected.** `offlineProvider` returns `not_configured` |
| Delivery rates | Not set (`null`); the UI says "Confirmed at launch" |
| Discounts | Not connected |
| Accounts | Placeholder page |

To go live, implement `CommerceProvider` in `lib/commerce/provider.ts` (e.g. Shopify Storefront, or
a Moroccan PSP such as CMI plus COD via a delivery partner), then set:

```
NEXT_PUBLIC_COMMERCE_PROVIDER=…
NEXT_PUBLIC_PAYMENTS_ENABLED=true
NEXT_PUBLIC_ACCOUNTS_ENABLED=true
NEXT_PUBLIC_SITE_URL=https://natysimo.com
NEXT_PUBLIC_PLAN_URL=<Gumroad plan URL>        # shows "The Training Plan" on /ig
NEXT_PUBLIC_CONTACT_EMAIL=<brand support email> # shown on /legal/contact
NEXT_PUBLIC_WHATSAPP=<digits, e.g. 2126…>       # shown on /legal/contact
NEXT_PUBLIC_SQUAD_URL=<broadcast invite link>   # shows "Join Natty Squad" on /ig
```

## Before taking orders
Imprint (Impressum § 5 DDG), privacy (GDPR + Moroccan law 09-08), terms (AGB) and the returns /
withdrawal policy are marked "Pre-launch page". Supply the real legal details. Nothing legal is
invented.

## Founder tools — `/manager`
The 90-day management system (Natty Simo, 3 Oct 2026) lives in `lib/manager.ts` and renders at
`/manager`: rules, reel slots, DM funnels with copyable replies, the Squad plan, the weekly rhythm,
the "NICHT JETZT" list, a weekly checklist and a log for the five Sunday numbers.

- **Not protected.** It is unlinked, not in the sitemap, disallowed in robots.txt and `noindex`,
  but anyone with the URL can open it. Keep only strategy and aggregate numbers there, never
  personal data.
- Checklist ticks and KPI numbers are stored in the browser (`natysimo.manager.v1`), per device.
- The waitlist has no form: `/ig` sends people to DM `SQUAD` on Instagram. No data is collected
  by the site.
