/**
 * Erzeugt die App-Icons (PWA, iPhone) aus einem SVG mit dem Chromium von Playwright.
 * Aufruf: pnpm --filter @sda/app exec tsx scripts/make-icons.ts – Ergebnis wird eingecheckt.
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

/** Anthrazit, weiße Schrift „SD“, roter Balken – Farben wie legacy/index.html. */
function svg(size: number, padding: number): string {
  const inner = size - padding * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#1b1d21"/>
  <g transform="translate(${padding} ${padding})">
    <text x="${inner / 2}" y="${inner * 0.62}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700"
      font-size="${inner * 0.46}" fill="#f4f4f5" letter-spacing="${inner * 0.01}">SD</text>
    <rect x="${inner * 0.2}" y="${inner * 0.74}" width="${inner * 0.6}" height="${inner * 0.06}" fill="#c8102e"/>
  </g>
</svg>`;
}

async function main() {
  const out = path.join(__dirname, '..', 'public', 'icons');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  // Normale Icons füllen die Fläche; „maskable“ lässt 10 % Rand für runde/abgeschnittene Formen.
  const icons: [string, number, number][] = [
    ['icon-192.png', 192, 0],
    ['icon-512.png', 512, 0],
    ['maskable-512.png', 512, 52],
    ['apple-touch-icon.png', 180, 0],
  ];
  for (const [name, size, pad] of icons) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<html><body style="margin:0">${svg(size, pad)}</body></html>`);
    writeFileSync(
      path.join(out, name),
      await page.screenshot({ clip: { x: 0, y: 0, width: size, height: size } }),
    );
  }
  writeFileSync(path.join(out, 'icon.svg'), svg(512, 0));
  await browser.close();
  console.log(`${icons.length} Icons in public/icons`);
}

void main();
