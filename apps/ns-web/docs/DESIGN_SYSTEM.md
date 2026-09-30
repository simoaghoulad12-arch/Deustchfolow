# NATYSIMO design system

Everything is defined in `tailwind.config.ts` and `app/globals.css`. Components read tokens; no
section invents its own.

## Colour

| Token | Value | Use |
| --- | --- | --- |
| `ink` | #060606 | Page background (primary black) |
| `coal` / `graphite` / `ash` | #0c0c0c / #151515 / #242424 | Alternating sections, image wells, dividers |
| `ivory` | #efe8da | Text, primary buttons |
| `mist` / `fog` | #a19d94 / #6c6a65 | Secondary / tertiary text, section labels |
| `gold` | #d1ad5b | Brand gold (≈ #D4AF37, warmed to sit with the bronze Clothing logo) |
| `silver` | #cfd3d8 | Performance accent |
| `accent` / `accent-2` | per world | Set by `data-world` |

Worlds (`data-world="sports|clothing|hybrid"` on any element):
- **sports** — accent silver, accent-2 white
- **clothing** — accent gold, accent-2 ivory
- **hybrid** (also the master default) — accent gold, accent-2 silver

Gold rule: gold is an accent, never a surface. Section labels are neutral (`text-mist`). Gold is
kept for the hero tagline, the story, the Clothing world and a few italic words. The UI has no
gradients except image scrims and the soft radial glow behind the mark.

## Typography

| Role | Font | Class |
| --- | --- | --- |
| Display (headlines, product names) | Cormorant Garamond 400–600 + italic | `font-display` |
| Body / UI | Inter | `font-sans` |
| Labels (kickers, buttons) | Inter, 10–11 px, uppercase, 0.28em | `.label` |
| Technical (NS/001, indexes, SKUs) | IBM Plex Mono | `.tech` |

Hierarchy: one italic phrase per headline at most.

## Shape, space, depth

- **Radius: 0.** Sharp everywhere, except colour swatches and hotspot dots.
- **Shadows: none.** Depth comes from 1 px hairlines (`border-white/[0.07]`) and background steps.
- Section rhythm: `py-24` mobile / `py-32–36` desktop. Gutters: 20 px mobile, 32 px desktop, max width 1600 px.
- Breakpoints: `sm` 640 · `md` 768 · `lg` 1024 (desktop layout starts here) · `xl` 1280.

## Components

- Buttons: `.btn-solid` (ivory → accent on hover), `.btn-line` (hairline), `.btn-accent`.
  Minimum height 52 px (48 px in sticky bars).
- Cards: `ProductCard` (image 4:5, world label, code, name, line, price, colour dots, wishlist),
  `SetCard`.
- Badges: "Concept visual" (bordered, blurred, 9 px) is the only badge. No "sale", "hot" or "%".
- Inputs: 56 px tall, hairline border, placeholder in `fog`, focus border `accent`.
- Navigation: desktop top bar (Shop · Worlds · Collection 01 · Story · Search · Wishlist · Account
  · Bag); mobile top bar (Menu · mark · Search · Bag) plus a bottom dock (Shop · Worlds · Saved · Bag).

## Motion

The ease is `cubic-bezier(0.16, 1, 0.3, 1)` everywhere. Motion vocabulary: fade-rise reveal, masked
line reveal, curtain image reveal, subtle parallax (≤ 10 %), pinned horizontal rail on desktop, slow
hover scale (1.04). No bounce, no spin. `prefers-reduced-motion` disables all of it.

## Logos

Only through `<Mark world=… />`. Never retyped as text, recoloured or cropped. See `ASSETS.md`.
