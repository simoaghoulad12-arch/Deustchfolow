import { expect, test, type Page } from '@playwright/test';

async function ready(page: Page) {
  await page.waitForLoadState('networkidle');
}

async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow, `horizontaler Überlauf auf ${page.url()}`).toBeLessThanOrEqual(0);
}

test('Academy Standard, Germany Preparation, Materialien, Onboarding zeigen die Inhalte mit Kennzeichnung', async ({
  page,
}) => {
  await page.goto('/standard');
  await expect(page.getByRole('heading', { name: 'Mission und Ziel' })).toBeVisible();
  await expect(
    page.getByText('Teilnehmer sprechen mindestens 60 % der Zeit, das Team höchstens 40 %.'),
  ).toBeVisible();
  await expect(
    page.getByRole('main').getByText('OFFENE ENTSCHEIDUNG', { exact: true }).first(),
  ).toBeVisible();
  await noHorizontalScroll(page);

  await page.goto('/deutschland');
  const arzt = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: /Arzt, Apotheke und Gesundheit/ }) });
  await expect(arzt.getByRole('link')).toHaveCount(5);
  await arzt.getByRole('link').first().click();
  await expect(page).toHaveURL(/\/stunde\/A1\.7\.Mo/);

  await page.goto('/materialien');
  await expect(page.getByText('Klett: Netzwerk neu (A1 bis B1).')).toBeVisible();
  await page.goto('/onboarding');
  await expect(
    page.getByText('Erstantwort senden (Vorlage 1), spätestens nach 24 Std.'),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Neuer Teilnehmer: von Anfrage bis Onboarding' }).click();
  await expect(page).toHaveURL(/\/stunde\/onb/);
  await expect(page.getByRole('checkbox').first()).toBeVisible();
});

test('Betrieb: Abläufe, Leitfaden, Aktivitäten-Filter, WhatsApp-Vorlage kopieren, Notfallplan', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/betrieb');
  await ready(page);
  for (const name of [
    'Plattformen einrichten',
    'Generalprobe (interne Probe)',
    'Echte Probestunde',
  ]) {
    await expect(
      page.getByRole('link', { name: new RegExp(name.replace(/[()]/g, '\\$&')) }),
    ).toBeVisible();
  }
  await expect(page.getByText('Zoom (Pro-Lizenz für den Host)')).toBeVisible();

  await page.getByText('3. Kreative Aktivitäten (18)').click();
  await page.getByRole('group', { name: 'Niveau' }).getByRole('link', { name: 'A1' }).click();
  await expect(page).toHaveURL(/niveau=A1/);
  await expect(page.getByRole('heading', { name: 'Satzkette' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Debatten-Duell' })).toBeHidden();

  await page.getByText('WhatsApp-Vorlagen').click();
  await page.getByRole('button', { name: 'Text kopieren' }).first().click();
  await expect(page.getByRole('status').filter({ hasText: 'Kopiert' })).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('Smart Deutsch Akademie');

  await page.getByText('Notfallplan').click();
  await expect(
    page.getByText('Lehrkraft 2 übernimmt, Muttersprachler/in unterstützt im Chat.'),
  ).toBeVisible();
  await noHorizontalScroll(page);
});

test('Probestunde: Skript zum Vorlesen', async ({ page }) => {
  await page.goto('/stunde/probe.ps');
  await expect(page.getByRole('tab', { name: 'Skript' })).toHaveAttribute('aria-selected', 'true');
  await expect(
    page.getByText(/Herzlich willkommen zur Probestunde bei Smart Deutsch!/),
  ).toBeVisible();
});

test('Offene Entscheidungen: Leitung trägt eine Entscheidung ein, Status und Datum werden gespeichert', async ({
  page,
}, info) => {
  const text = `Testentscheidung (${info.project.name})`;
  await page.goto('/entscheidungen');
  await ready(page);
  const item = page.locator('li[id="dec#4"]');
  await item.locator('details').evaluate((d: HTMLDetailsElement) => (d.open = true));
  // „entschieden“ ohne Text wird abgelehnt
  await item.getByLabel('Entscheidung').fill('');
  await item.getByLabel('Status').selectOption('entschieden');
  await item.getByRole('button', { name: 'Speichern' }).click();
  await expect(item.getByRole('alert')).toHaveText('Bitte die Entscheidung eintragen.');
  await item.getByLabel('Entscheidung').fill(text);
  await item.getByLabel('Datum').fill('2026-01-15');
  await item.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.locator('li[id="dec#4"]')).toContainText('ENTSCHIEDEN');
  await expect(page.locator('li[id="dec#4"]')).toContainText(text);
  await expect(page.locator('li[id="dec#4"]')).toContainText('Entschieden am 2026-01-15');
  // Zurück auf offen (Testdaten teilen sich den Entwicklungsserver)
  await ready(page);
  const again = page.locator('li[id="dec#4"]');
  await again.locator('details').evaluate((d: HTMLDetailsElement) => (d.open = true));
  await again.getByLabel('Status').selectOption('offen');
  await again.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.locator('li[id="dec#4"]')).not.toContainText('ENTSCHIEDEN');
});

test('Quality Control: Kennzahlen, Warnschwellen nur durch die Leitung', async ({ page }) => {
  await page.goto('/qualitaet');
  await ready(page);
  await expect(page.getByText('Ø Anwesenheit')).toBeVisible();
  await expect(
    page.getByText('Noch keine Schwellen festgelegt – darum keine Warnungen.'),
  ).toBeVisible();
  const days = page.getByLabel('Höchstens Tage ohne Dokumentation');
  // Der Browser lässt ungültige Werte gar nicht erst durch (der Server prüft zusätzlich)
  await days.fill('9999');
  await page.getByRole('button', { name: 'Schwellen speichern' }).click();
  expect(await days.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false);
  // Schwelle festlegen: Schüler ohne Dokumentation werden gemeldet (sofern vorhanden)
  await days.fill('30');
  await page.getByRole('button', { name: 'Schwellen speichern' }).click();
  await expect(
    page.getByText('Noch keine Schwellen festgelegt – darum keine Warnungen.'),
  ).toBeHidden();
  await expect(page.getByLabel('Höchstens Tage ohne Dokumentation')).toHaveValue('30');
  // wieder entfernen
  await ready(page);
  await page.getByLabel('Höchstens Tage ohne Dokumentation').fill('');
  await page.getByRole('button', { name: 'Schwellen speichern' }).click();
  await expect(
    page.getByText('Noch keine Schwellen festgelegt – darum keine Warnungen.'),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Bestehende Kontrollpunkte' })).toBeVisible();
  await noHorizontalScroll(page);
});

test('Suche mit Filter nach Level und Bereich', async ({ page }) => {
  await page.goto('/suche?q=Brief');
  const all = await page.getByRole('main').getByRole('listitem').count();
  await page.goto('/suche?q=Brief&level=B1');
  const b1 = await page.getByRole('main').getByRole('listitem').count();
  expect(b1).toBeGreaterThan(0);
  expect(b1).toBeLessThan(all);
  await page.goto('/suche?q=Arzt&bereich=Deutschland');
  await expect(page.getByRole('status')).toContainText('Treffer');
  await noHorizontalScroll(page);
});
