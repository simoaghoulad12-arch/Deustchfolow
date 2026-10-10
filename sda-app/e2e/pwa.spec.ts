import { expect, test } from '@playwright/test';

test('PWA: Manifest, Icons, Offline-Seite und Service Worker sind ohne Anmeldung erreichbar', async ({
  request,
  page,
}) => {
  const manifest = await request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBe(true);
  const m = await manifest.json();
  expect(m.name).toBe('Smart Deutsch Akademie');
  expect(m.display).toBe('standalone');
  expect(m.icons.map((i: { sizes: string }) => i.sizes)).toEqual(
    expect.arrayContaining(['192x192', '512x512']),
  );
  for (const url of [
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/icons/maskable-512.png',
    '/icons/apple-touch-icon.png',
    '/sw.js',
    '/offline.html',
  ]) {
    expect((await request.get(url)).ok(), url).toBe(true);
  }
  // iPhone: Startbildschirm-Icon und App-Modus
  await page.goto('/');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    'href',
    /apple-touch-icon\.png/,
  );
  await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute(
    'content',
    'yes',
  );
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    'href',
    '/manifest.webmanifest',
  );
});

test('Login-Seite: Magic Link, nur für eingeladene Personen', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Anmelden' })).toBeVisible();
  await expect(page.getByText('Nur für eingeladene Personen.')).toBeVisible();
});

test('Tastatur: erster Tab springt zum Inhalt, Menü per Tastatur bedienbar', async ({ page }) => {
  await page.goto('/curriculum');
  await page.waitForLoadState('networkidle');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Zum Inhalt springen' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#inhalt$/);
  if ((page.viewportSize()?.width ?? 0) < 1024) {
    await page.getByRole('button', { name: 'Menü' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Schließen' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Menü' })).toBeFocused();
  }
});
