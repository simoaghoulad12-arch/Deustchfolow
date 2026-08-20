# Asal Achifa – عسل الشفاء

Animierte One-Page-Website für das Premium-Naturprodukt „Asal Achifa" (Heilhonig
mit Schwarzkümmel & Schwarzkümmelöl). React + TypeScript + Tailwind CSS +
Framer Motion, vollständig responsive (mobile-first).

## Highlights

- **Scroll-Story im Hero**: Eine SVG-Honigflasche ist während des ersten Scrollens
  gepinnt. Der Deckel öffnet sich (Rotation/Abheben), Honig fließt sichtbar heraus,
  Schwarzkümmelsamen verteilen sich – jeweils begleitet von Glassmorphism-Textboxen,
  die am Bildschirmrand erscheinen. Komplett CSS/SVG-basiert (Framer Motion
  `useScroll`/`useTransform`), keine Video-Assets.
- **Dunkles Luxus-Design**: Schwarz/Dunkelbraun mit Gold-Akzenten, Cormorant
  Garamond (Serif) + Amiri (Arabisch) + Jost (Sans) via Google Fonts.
- **Sticky „Jetzt bestellen"-Button**, der nach dem Hero erscheint und vor dem
  Footer wieder ausblendet (dort gibt es einen eigenen CTA).
- Alle Inhalte lt. Vorgabe: Honig, Schwarzkümmel (inkl. Hadith), weitere Zutaten
  (Kurkuma, Ingwer, Propolis), Marke/Herkunft (Mohammed Agoulat, Salé), Kontakt/Footer.

## Entwicklung

```bash
npm install
npm run dev       # Dev-Server (http://localhost:5173)
npm run build     # Production-Build nach dist/
npm run preview   # Production-Build lokal testen
```

## Struktur

```
src/
  components/
    ScrollStory.tsx       Hero + gepinnte Scroll-Animation (Kernstück)
    HoneyBottle.tsx        SVG-Flasche: Deckel, Honigfluss, Etikett
    SeedParticles.tsx       Schwarzkümmel-Partikel-Dispersion
    ParticleField.tsx       Schwebende Gold-Lichtpunkte (Hintergrund)
    HoneySection.tsx        Abschnitt 2 – Der Honig
    BlackSeedSection.tsx    Abschnitt 3 – Die Schwarzkümmel
    IngredientsSection.tsx  Abschnitt 4 – Weitere Zutaten
    AboutSection.tsx        Abschnitt 5 – Über die Marke
    ContactFooter.tsx       Abschnitt 6 – Kontakt/Footer
    StickyOrderButton.tsx   Sticky CTA
    Reveal.tsx               Wiederverwendbarer Scroll-Reveal-Wrapper
    Icons.tsx                 Inline-SVG-Icon-Set
```

## Anpassen

- Farben/Gold-Palette: `tailwind.config.js`
- Texte/Inhalte: direkt in den jeweiligen `src/components/*Section.tsx`
- E-Mail/Kontakt: `src/components/ContactFooter.tsx`
