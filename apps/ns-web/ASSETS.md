# NS — pending brand assets

This app runs today with placeholder visuals wherever a real asset hasn't
been supplied. Drop in the files below and no code changes are needed.

## Logo (required)

1. Place the official file at `public/brand/logo.svg`.
2. In `components/brand/Logo.tsx`, flip `HAS_OFFICIAL_LOGO` to `true`.

Every use of the mark (nav, intro sequence, footer) renders through this
one component.

## Product photography

Each product in `data/products.ts` declares an `images.hero` and
`images.gallery` path under `/public/images/products/<slug>/...`. Until a
file exists at that path, `components/product/ProductVisual.tsx`
automatically falls back to a ghost-mannequin placeholder silhouette — no
broken images, no code change required. Naming convention already wired
into the product story layout:

```
public/images/products/<slug>/
  hero.jpg          — main PDP/shop image
  front.jpg
  back.jpg
  detail-logo.jpg
  fabric.jpg
  editorial.jpg
```

## Material / care / fit copy

`Product.material`, `.care`, and `.fit` are optional and left unset on
purpose — the brief prohibits inventing fabric specs. Fill them in
`data/products.ts` once real, verified data exists; the product page
renders that section automatically when present.
