import { expect, test, type Page } from '@playwright/test';

async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow, `horizontaler Überlauf auf ${page.url()}`).toBeLessThanOrEqual(0);
}

/** Häkchen der Stunde zurücksetzen (Testdaten leben im Speicher des Entwicklungsservers). */
async function resetLesson(page: Page, id: string) {
  await page.goto(`/stunde/${id}?modus=liste`);
  const reset = page.getByRole('button', { name: 'Diese Stunde zurücksetzen' });
  page.once('dialog', (d) => d.accept());
  await reset.click();
  await expect(page.getByText(/^0 \/ \d+$/)).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: /^Gespeichert$/ })).toBeVisible();
}

async function choosePerson(page: Page, name: string) {
  await page.goto('/einstellungen');
  await page.getByRole('button', { name, exact: true }).click();
  await expect(page.getByRole('button', { name, exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
}

test('Curriculum: Level, Filter nach Bereich und Status, Lernziele pro Modul', async ({ page }) => {
  await page.goto('/curriculum');
  await expect(page.getByRole('heading', { name: 'A1 – Anfänger' })).toBeVisible();
  await expect(page.getByText('Am Ende dieser Einheit kann der Schüler:').first()).toBeVisible();
  await noHorizontalScroll(page);

  await page.getByRole('navigation', { name: 'Level' }).getByRole('link', { name: 'B1' }).click();
  await expect(page).toHaveURL(/level=B1/);
  await expect(page.getByRole('heading', { name: /^B1/ })).toBeVisible();
  await expect(page.locator('section[id^="B1."]')).toHaveCount(10);

  await page
    .getByRole('group', { name: 'Bereich' })
    .getByRole('link', { name: 'Deutschland' })
    .click();
  await expect(page).toHaveURL(/bereich=Deutschland/);
  const modules = page.locator('section[id^="B1."]');
  expect(await modules.count()).toBeGreaterThan(0);
  expect(await modules.count()).toBeLessThan(10);
  // Gefilterte Module sind aufgeklappt und zeigen nur passende Stunden
  await expect(modules.first().locator('details')).toHaveAttribute('open', '');

  await page
    .getByRole('group', { name: 'Status' })
    .getByRole('link', { name: 'Abgeschlossen' })
    .click();
  await expect(page).toHaveURL(/status=Abgeschlossen/);
  await expect(page.getByText('Keine Stunden für diesen Filter.')).toBeVisible();
});

test('Lernziele: Grammatik, Wortschatz, Kommunikation, Praxis pro Modul', async ({ page }) => {
  await page.goto('/lernziele?level=A2');
  const first = page.locator('details[id="A2.1"]');
  await expect(first).toHaveAttribute('open', '');
  for (const term of ['Grammatik', 'Wortschatz', 'Kommunikation', 'Praxis']) {
    await expect(first.getByText(term, { exact: true })).toBeVisible();
  }
  await noHorizontalScroll(page);
});

test('Stunde: Skript zum Vorlesen mit Darija-Hinweis und Lösungen', async ({ page }) => {
  await choosePerson(page, 'Alle Aufgaben');
  await page.goto('/stunde/A1.1.Di');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Sich vorstellen: Konjugation im Präsens',
  );
  await expect(page.getByRole('tab', { name: 'Skript' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('heading', { name: /20–55\s*Neues Thema/ })).toBeVisible();
  await expect(page.getByText('Das Verb hat eine Grundform, den Infinitiv')).toBeVisible();
  await expect(page.getByText('بالدارجة:').first()).toBeVisible();
  // Lösung aufklappen
  const solution = page.getByText('A-M-A-L', { exact: true });
  await expect(solution).toBeHidden();
  await page.getByText('Lösung').first().click();
  await expect(solution).toBeVisible();
  await expect(page.getByText('Lernziel der Einheit')).toBeVisible();
  await noHorizontalScroll(page);
});

test('Stunde: Schritte und Liste speichern Häkchen pro Person', async ({ page }) => {
  await choosePerson(page, 'Alle Aufgaben');
  await resetLesson(page, 'A1.1.Mo');
  const total = Number((await page.getByText(/^0 \/ \d+$/).innerText()).split('/')[1]);

  await page.getByRole('tab', { name: 'Schritte' }).click();
  await expect(page.getByText(`Schritt 1 / ${total}`)).toBeVisible();
  await page.getByRole('button', { name: '✓ Erledigt' }).click();
  await expect(page.getByText(`Schritt 2 / ${total}`)).toBeVisible();
  await expect(page.getByText(`1 / ${total}`, { exact: true })).toBeVisible();

  await page.getByRole('tab', { name: 'Liste' }).click();
  const boxes = page.getByRole('checkbox');
  await expect(boxes).toHaveCount(total);
  await expect(boxes.first()).toBeChecked();
  await boxes.nth(1).check();
  await expect(page.getByText(`2 / ${total}`, { exact: true })).toBeVisible();

  // Nach dem Neuladen noch gespeichert (erst, wenn die App „Gespeichert“ meldet)
  await expect(page.getByRole('status').filter({ hasText: /^Gespeichert$/ })).toBeVisible();
  await page.reload();
  await page.getByRole('tab', { name: 'Liste' }).click();
  await expect(page.getByText(`2 / ${total}`, { exact: true })).toBeVisible();
  await noHorizontalScroll(page);

  // Fortschritt erscheint im Curriculum
  await page.goto('/curriculum?level=A1');
  await expect(
    page
      .locator('section[id="A1.1"]')
      .getByText(/^[1-9]\d? %$/)
      .first(),
  ).toBeVisible();
  await resetLesson(page, 'A1.1.Mo');
});

test('Stunden-Timer zeigt, was laut Minute dran ist', async ({ page }) => {
  await page.goto('/stunde/A1.1.Mo?modus=liste');
  await page.getByRole('button', { name: /Stunden-Timer starten/ }).click();
  const timer = page.getByRole('region', { name: 'Stunden-Timer' });
  await expect(timer).toContainText('Minute 0 / 120');
  await expect(timer).toContainText('Begrüßen und Frage des Tages stellen');
  await expect(timer).toContainText('Ab Minute 10');
  // Timer bleibt nach dem Neuladen erhalten
  await page.reload();
  await expect(page.getByRole('region', { name: 'Stunden-Timer' })).toBeVisible();
  await page.getByRole('button', { name: 'Timer stoppen' }).click();
  await expect(page.getByRole('button', { name: /Stunden-Timer starten/ })).toBeVisible();
});

test('Feld „Im Lehrbuch“ wird für die Stunde gespeichert', async ({ page }, info) => {
  const value = `Lektion 1, S. 10 (${info.project.name})`;
  await page.goto('/stunde/A1.1.Mi');
  const field = page.getByLabel('Im Lehrbuch (Seite / Lektion)');
  await field.fill(value);
  await page.getByRole('button', { name: 'Speichern', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Gespeichert' })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Im Lehrbuch (Seite / Lektion)')).toHaveValue(value);
});

test('Rollen pro Wochentag: Aufgaben je Person, Plan durch die Leitung änderbar', async ({
  page,
}) => {
  // Vorschlag: Dienstag ist Lehrkraft 2 Hauptlehrkraft
  await choosePerson(page, 'Lehrkraft 2');
  await page.goto('/stunde/A1.1.Di?modus=liste');
  await expect(page.getByText('Deine Rolle heute: Hauptlehrkraft')).toBeVisible();
  await expect(page.getByText('Hauptlehrkraft heute: Lehrkraft 2')).toBeVisible();
  // Aufgabe der Hauptlehrkraft sichtbar, Aufgabe der Assistenz nicht
  await expect(page.getByText('Folien/Tafel vorbereiten: Regel, Tabelle, Beispiele')).toBeVisible();
  await expect(page.getByText('Anwesenheit notieren', { exact: true })).toBeHidden();

  await choosePerson(page, 'Lehrkraft 1');
  await page.goto('/stunde/A1.1.Di?modus=liste');
  await expect(page.getByText('Deine Rolle heute: Assistenz')).toBeVisible();
  await expect(page.getByText('Anwesenheit notieren', { exact: true })).toBeVisible();
  await expect(page.getByText('Folien/Tafel vorbereiten: Regel, Tabelle, Beispiele')).toBeHidden();

  await choosePerson(page, 'Muttersprachler/in');
  await page.goto('/stunde/A1.1.Fr?modus=liste');
  await expect(page.getByText('Deine Rolle heute: Muttersprachler/in')).toBeVisible();

  // Leitung ändert den Plan: Dienstag Lehrkraft 1 = Hauptlehrkraft
  await page.goto('/einstellungen');
  await page.getByLabel('Dienstag, Lehrkraft 1').selectOption('H');
  await page.getByLabel('Dienstag, Lehrkraft 2').selectOption('A');
  await page.getByRole('button', { name: 'Speichern', exact: true }).click();
  await choosePerson(page, 'Lehrkraft 1');
  await page.goto('/stunde/A1.1.Di?modus=liste');
  await expect(page.getByText('Deine Rolle heute: Hauptlehrkraft')).toBeVisible();
  await expect(page.getByText('Hauptlehrkraft heute: Lehrkraft 1')).toBeVisible();

  // Vorschlag wiederherstellen
  await page.goto('/einstellungen');
  await page.getByLabel('Dienstag, Lehrkraft 1').selectOption('A');
  await page.getByLabel('Dienstag, Lehrkraft 2').selectOption('H');
  await page.getByRole('button', { name: 'Speichern', exact: true }).click();
  await expect(page.getByLabel('Dienstag, Lehrkraft 2')).toHaveValue('H');
  await choosePerson(page, 'Alle Aufgaben');
});
