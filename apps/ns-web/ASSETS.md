# Nattysimo (NS) — brand asset status

This app runs today with placeholder visuals wherever a real asset hasn't
been supplied, and real photography where it has. Drop in files at the
paths below and no code changes are needed.

## Logo — still pending an isolated file

Every reference supplied so far (an embroidered crest photo, garment
close-ups, and AI-generated mood boards) shows the mark in context —
photographed or rendered into a scene — not as a clean, isolated
vector/transparent file. Per the brief's own rule, the logo must never be
redrawn or reinterpreted, so `components/brand/Logo.tsx` intentionally
keeps rendering a generic, clearly-labeled placeholder mark (not an
attempt to recreate the real crown+monogram from photos) until an actual
source file exists.

Reference material saved for whoever produces that file:
`public/brand/reference/` (embroidered crest photo, three mood-board
renders, three flat-lay mockups).

1. Place the official file at `public/brand/logo.svg` (or `.png` with a
   transparent background).
2. In `components/brand/Logo.tsx`, flip `HAS_OFFICIAL_LOGO` to `true` and
   update the `<img>` tag's extension if it's not an `.svg`.

## Product photography — partially real

Two real photos exist (`public/images/real/tanktop-front.png` and
`tanktop-shorts-side.png`) and are already wired into `data/products.ts`
as the hero/gallery images for **NS Tanktop** and **NS Shorts**, and reused
across the homepage (Hero, Floating Garment, Runway, Lookbook).

The other 8 products (T-Shirt, Longsleeve, Hoodie, Zip Hoodie, Jogger,
Cap, Gym Bag, Socks) still fall back to the ghost-mannequin placeholder
silhouette via `components/product/ProductVisual.tsx`. Drop real files in
at the convention below and they'll render automatically — no code
change required:

```
public/images/products/<slug>/
  hero.jpg          — main PDP/shop image
  front.jpg
  back.jpg
  detail-logo.jpg
  fabric.jpg
  editorial.jpg
```

Slugs are in `data/products.ts` (e.g. `ns-tshirt-essential`,
`ns-hoodie-premium`, `ns-zip-hoodie-essential`, `ns-jogger-comfort`,
`ns-cap-signature`, `ns-gym-bag-elite`, `ns-socks-performance`).

## Brand name

The site uses **NS** as the monogram/mark everywhere (as in every photo
and mood board supplied) and **Nattysimo** as the spelled-out brand name
in copy (metadata, intro, footer, about) — confirmed as the correct
spelling over two other variants ("Natysimo", "Natsissimo") that appeared
in earlier AI-generated mood boards.

## Copy taken literally from the mood boards

- Tagline: "Discipline builds freedom." (hero, brand statement, footer, nav)
- Secondary line: "Train / Grow / Evolve / NS" (footer manifesto column)
- Quality strip: "Premium Quality / Performance Wear / Minimal Design /
  Global Mindset" (`components/sections/BrandPillars.tsx`)
- Product line-up and tiering (Tanktop–Performance, T-Shirt–Essential,
  Longsleeve–Compression, Hoodie–Premium, Zip Hoodie–Essential,
  Jogger–Comfort, Shorts–Training, Cap–Signature, Gym Bag–Elite,
  Socks–Performance)

## Material / care / fit copy

`Product.material`, `.care`, and `.fit` are optional and left unset on
purpose — the brief prohibits inventing fabric specs. Fill them in
`data/products.ts` once real, verified data exists; the product page
renders that section automatically when present.
