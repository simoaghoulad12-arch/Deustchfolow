import { expect, test, type Page } from '@playwright/test';
import { NAV_ITEMS } from '../lib/nav';

const isPhone = (page: Page) => (page.viewportSize()?.width ?? 0) < 1024;

const NAMES = {
  de: { menu: 'Menü', nav: 'Hauptnavigation' },
  ar: { menu: 'القائمة', nav: 'التنقل الرئيسي' },
};

async function openNav(page: Page, lang: 'de' | 'ar' = 'de') {
  const n = NAMES[lang];
  if (isPhone(page)) {
    await page.getByRole('button', { name: n.menu }).click();
    return page.getByRole('dialog', { name: n.nav });
  }
  return page.getByRole('navigation', { name: n.nav });
}

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow, `horizontaler Überlauf auf ${page.url()}`).toBeLessThanOrEqual(0);
}

test('alle Seiten sind über die Navigation erreichbar, ohne seitliches Scrollen', async ({
  page,
}) => {
  test.setTimeout(300_000);
  await page.goto('/');
  for (const item of NAV_ITEMS) {
    const nav = await openNav(page);
    await nav.getByRole('link', { name: item.label.de, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${item.href === '/' ? '/$' : item.href}$`));
    await expect(page.getByRole('heading', { level: 1 })).toContainText(item.label.de);
    // Aktiver Eintrag ist markiert
    const navAfter = isPhone(page)
      ? null
      : page.getByRole('navigation', { name: 'Hauptnavigation' });
    if (navAfter)
      await expect(
        navAfter.getByRole('link', { name: item.label.de, exact: true }),
      ).toHaveAttribute('aria-current', 'page');
    await expectNoHorizontalScroll(page);
  }
});

test('Handy: untere Leiste und Menü; Desktop: Seitenleiste', async ({ page }) => {
  await page.goto('/');
  const bottom = page.getByRole('navigation', { name: 'Schnellzugriff' });
  if (isPhone(page)) {
    await expect(bottom).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Hauptnavigation' })).toBeHidden();
    await bottom.getByRole('link', { name: 'Curriculum' }).click();
    await expect(page).toHaveURL(/\/curriculum$/);
    await expect(bottom.getByRole('link', { name: 'Curriculum' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    // Menü schließt mit Escape
    await page.getByRole('button', { name: 'Menü' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    // Tippflächen mindestens 44 px hoch
    for (const link of await bottom.getByRole('link').all()) {
      expect((await link.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
  } else {
    await expect(bottom).toBeHidden();
    await expect(page.getByRole('navigation', { name: 'Hauptnavigation' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Menü' })).toBeHidden();
  }
});

test('Suche in der Kopfzeile findet Inhalte', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('searchbox', { name: 'Suche' }).first();
  await search.fill('Perfekt');
  await search.press('Enter');
  await expect(page).toHaveURL(/\/suche\?q=Perfekt/);
  await expect(page.getByRole('status')).toContainText('Treffer');
  await expect(page.getByRole('link', { name: /Perfekt/ }).first()).toBeVisible();
});

test('Arabisch schaltet die Oberfläche auf RTL, Inhalte bleiben Deutsch', async ({ page }) => {
  await page.goto('/einstellungen');
  await page.getByRole('button', { name: 'Arabisch (Darija)' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('الإعدادات والبيانات');
  const nav = await openNav(page, 'ar');
  await expect(nav.getByRole('link', { name: 'المنهج', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  // Unterrichtsinhalt (Lesson System) bleibt Deutsch und links nach rechts
  await page.goto('/lesson-system');
  await expect(page.getByText('CHECK-IN')).toBeVisible();
  await expect(page.locator('ol.de-content')).toHaveCSS('direction', 'ltr');
  await expectNoHorizontalScroll(page);
  // Zurück auf Deutsch
  await page.goto('/einstellungen');
  await page.getByRole('button', { name: 'الألمانية' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
});

test('Hell- und Dunkelmodus', async ({ page }) => {
  await page.goto('/einstellungen');
  await page.getByRole('button', { name: 'Dunkel' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const dark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.getByRole('button', { name: 'Hell' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const light = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(dark).toBe('rgb(17, 18, 20)');
  expect(light).toBe('rgb(244, 244, 245)');
});

test('Kennzeichnungen werden angezeigt', async ({ page }) => {
  await page.goto('/entscheidungen');
  await expect(
    page.locator('main').getByText('OFFENE ENTSCHEIDUNG', { exact: true }).first(),
  ).toBeVisible();
  // 21 offene Entscheidungen aus legacy, jede mit Kennzeichnung (dazu die Überschrift)
  await expect(page.locator('main ol > li')).toHaveCount(21);
  await expect(page.locator('main').getByText('OFFENE ENTSCHEIDUNG', { exact: true })).toHaveCount(
    22,
  );
  await page.goto('/lesson-system');
  await expect(
    page.locator('main').getByText('IMPROVEMENT', { exact: true }).first(),
  ).toBeVisible();
});

test('Handy-Menü liegt über der unteren Leiste: Abmelden und letzte Einträge sind antippbar', async ({
  page,
}) => {
  test.skip((page.viewportSize()?.width ?? 0) >= 1024, 'nur Handy');
  await page.goto('/');
  await page.getByRole('button', { name: 'Menü' }).click();
  const dialog = page.getByRole('dialog', { name: 'Hauptnavigation' });
  // Element am Mittelpunkt des Knopfs muss der Knopf selbst sein (nicht die untere Leiste)
  for (const target of [
    dialog.getByRole('button', { name: 'Abmelden' }),
    dialog.getByRole('link', { name: 'Einstellungen & Daten' }),
  ]) {
    await target.scrollIntoViewIfNeeded();
    const hit = await target.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!top && (el === top || el.contains(top));
    });
    expect(hit).toBe(true);
  }
});
