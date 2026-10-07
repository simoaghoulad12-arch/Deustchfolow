import { expect, test, type Page } from '@playwright/test';

const BASE = 'http://localhost:3210';
const ready = (page: Page) => page.waitForLoadState('networkidle');
const asRole = (page: Page, role: 'admin' | 'student') =>
  page.context().addCookies([{ name: 'sda-dev-role', value: role, url: BASE }]);

test('Prüfungen: Modelltest, „Bereit?“, Anmeldung bestanden → Level 100 %, nächstes Level frei', async ({
  page,
}, info) => {
  test.setTimeout(300_000);
  const name = `Prüfling ${info.project.name}`;
  await asRole(page, 'admin');

  await page.goto('/fortschritt/neu');
  await ready(page);
  await page.getByLabel('Name', { exact: true }).fill(name);
  await page.getByLabel('Level').selectOption('A2');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page).toHaveURL(/\/fortschritt\/[0-9a-f-]{36}$/);
  const studentUrl = page.url();
  await ready(page);

  // Modelltest eintragen
  const exams = page.locator('#pruefungen');
  await exams.getByText('Modelltest-Ergebnis eintragen').click();
  await exams.getByLabel('Lesen: Punkte').fill('24');
  await exams.getByLabel('Lesen: maximal').fill('30');
  await exams.getByLabel('Hören: Punkte').fill('12');
  await exams.getByLabel('Hören: maximal').fill('30');
  await exams.getByLabel('Schreiben: Punkte').fill('31');
  await exams.getByLabel('Schreiben: maximal').fill('25');
  await exams.getByRole('button', { name: 'Ergebnis speichern' }).click();
  await expect(exams.getByRole('alert')).toContainText(
    'Schreiben: bitte Punkte und Höchstpunktzahl eingeben',
  );
  await exams.getByLabel('Schreiben: Punkte').fill('20');
  await exams.getByRole('button', { name: 'Ergebnis speichern' }).click();
  await expect(page.locator('#pruefungen')).toContainText('Schwächster Teil: Hören');
  await expect(
    page.locator('#pruefungen').getByRole('list', { name: 'Ergebnis pro Prüfungsteil' }),
  ).toContainText('80 %');
  await expect(page.locator('#pruefungen')).toContainText('beim Prüfungsanbieter prüfen');

  // Anmeldung mit Ergebnis „bestanden“
  await ready(page);
  await page.locator('#pruefungen').getByText('Prüfungsanmeldung erfassen').click();
  const form = page
    .locator('#pruefungen details')
    .filter({ hasText: 'Prüfungsanmeldung erfassen' });
  await form.getByLabel('Anbieter').fill('Testanbieter');
  await form.getByLabel('Ergebnis').selectOption('bestanden');
  await form.getByRole('button', { name: 'Anmeldung speichern' }).click();
  await expect(page.locator('#pruefungen')).toContainText(
    'A2 · Testanbieter · Datum offen · bestanden',
  );

  await page.goto('/pruefungen');
  const a2 = page.getByRole('row', { name: /^A2/ });
  await expect(a2.getByRole('cell').nth(2)).not.toHaveText('0');
  await expect(page.getByRole('link', { name: new RegExp(name) })).toContainText('bestanden');

  // Schüler: A2 = 100 %, B1 freigeschaltet
  await page.goto(studentUrl);
  await ready(page);
  await page.getByLabel('E-Mail des Schülers').fill('pruefling@example.org');
  await page.getByRole('button', { name: 'Zur Lern-App einladen' }).click();
  await expect(page.getByText('Zugang ist eingerichtet.')).toBeVisible();
  await asRole(page, 'student');
  await page.goto('/lernen');
  await expect(page.getByRole('progressbar', { name: 'Fortschritt A2' })).toHaveAttribute(
    'aria-valuenow',
    '100',
  );
  await expect(page.getByText('Noch nicht freigeschaltet')).toHaveCount(1); // nur noch B2
  await page.goto('/lernen/modul/B1.1');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('B1 · Modul 1');
  await page.goto('/lernen/pruefung?level=A2');
  await expect(page.getByText('Schwächster Teil: Hören')).toBeVisible();
  await expect(page.getByText(/Testanbieter · Datum offen · Ort offen · bestanden/)).toBeVisible();
  await expect(page.getByRole('note')).toContainText('beim Prüfungsanbieter prüfen');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
