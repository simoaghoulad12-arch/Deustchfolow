# AI visual production brief — Collection 01

**Status:** no AI images have been generated. This build environment has no image-generation
model, and the site doesn't fake it. Six products currently use small crops from the AI moodboards,
labelled "Concept visual" on the site. This brief is for producing their replacements, in an image
tool or with a photographer.

## Rules (non-negotiable)

- The product is the source of truth: black garments; the crown NS monogram exactly as on the real
  garments (serif N/S under a five-point crown, white or tonal); silver twin contour lines only where
  the real product has them. Never generate the logo from scratch. Composite the real mark in post
  if the model distorts it.
- No invented pockets, zips, sleeve lengths, colours or text. No random lettering.
- Realistic athletic build, not bodybuilder-exaggerated. Natural skin, correct hands, true fabric
  folds.
- Environments: dark industrial gym, raw concrete, Casablanca / Marrakech streets and architecture,
  European city streets, clean charcoal studio. No fake luxury (yachts, supercars, marble).
- One grade for the whole collection: low-key, neutral-cool shadows, 5600 K key light, deep blacks
  lifted slightly (no crushed detail), muted saturation (−25 %), fine grain.

## Image system per product (4:5, ≥ 2400 px long edge)

| # | Shot | Direction |
| --- | --- | --- |
| 01 | Hero | Model, three-quarter body, garment centred, dark gym or concrete |
| 02 | Front / back | Same model and light, straight front and back |
| 03 | Detail | Macro on the monogram / contour line / fabric texture |
| 04 | Lifestyle | Street (Casablanca medina edge, modern Casablanca, Düsseldorf) |
| 05 | Movement | Mid-rep or walking; fit under tension |
| 06 | Product only | Flat lay on grey concrete (matches the existing flat lays) or ghost mannequin |

## Priority and prompt seeds

1. **Premium Hoodie (ivory + black)** — "editorial sportswear campaign photo, athletic Moroccan man
   late 20s, oversized heavyweight hoodie in ivory, small tonal crown monogram at left chest, black
   tapered joggers, raw concrete underpass, soft overcast light, muted cinematic grade, 85 mm,
   shallow depth of field, realistic skin texture, no text"
2. **Jogger** — same model, black tapered cuffed jogger, monogram at left thigh, walking, city street
   at dusk.
3. **Compression Long Sleeve** — black, close-fitting, monogram at chest, dark industrial gym, cable
   machine, rim light.
4. **Performance Tee** — black athletic-cut tee, monogram at chest, training shorts, mid-set on a
   bench, gym.
5. **Signature Cap** — black cap, crown monogram on the front panel, macro and on-model street
   portrait.
6. **Gym Bag** — black holdall, crown monogram front, on a gym floor beside plates; carry shot on
   the street.

Negative prompt: `text, watermark, extra fingers, distorted logo, extra zipper, pockets, bright
colours, plastic skin, oversaturated, HDR, bodybuilder proportions, luxury car, gold chains`.

## Delivery

Save as `public/images/products/<slug>/01-hero.jpg … 06-product.jpg` and update the `IMG` map in
`lib/commerce/catalog.ts`.

- Real photography of the produced garment → `kind: 'photo'`. The "Concept visual" tag disappears.
- AI-generated images stay `kind: 'concept'` (still labelled) unless they are verified against the
  physically produced garment and approved by the brand.
