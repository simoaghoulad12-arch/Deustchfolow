import { expect, test, type Page } from '@playwright/test';
import { miniTest } from '../lib/learn';

const BASE = 'http://localhost:3210';

async function ready(page: Page) {
  await page.waitForLoadState('networkidle');
}

async function asRole(page: Page, role: 'admin' | 'student') {
  await page.context().addCookies([{ name: 'sda-dev-role', value: role, url: BASE }]);
}

async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow, `horizontaler Überlauf auf ${page.url()}`).toBeLessThanOrEqual(0);
}

test('Lern-App: Einladung, Mein Weg, Übungen, Mini-Test, Hausaufgabe, Fehler – und strikte Trennung vom Team', async ({
  page,
}, info) => {
  test.setTimeout(300_000);
  const name = `Lernende ${info.project.name}`;
  await asRole(page, 'admin');

  // Team: Schüler anlegen, Hausaufgabe und Fehler erfassen, zur Lern-App einladen
  await page.goto('/fortschritt/neu');
  await ready(page);
  await page.getByLabel('Name', { exact: true }).fill(name);
  await page.getByLabel('Level').selectOption('A1');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page).toHaveURL(/\/fortschritt\/[0-9a-f-]{36}$/);
  const studentUrl = page.url();
  const studentId = studentUrl.split('/').pop()!;

  await page.goto(`/hausaufgaben/neu?schueler=${studentId}`);
  await ready(page);
  await page.getByLabel('Aufgabe').fill('Schreibe 5 Sätze über dich');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page).toHaveURL(/\/hausaufgaben$/);

  await page.goto(`/fehler/neu?schueler=${studentId}`);
  await ready(page);
  await page.getByLabel('Fehler (so wurde es gesagt/geschrieben)').fill('Ich heißen Amal');
  await page.getByLabel('Korrektur').fill('Ich heiße Amal');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page).toHaveURL(/\/fehler$/);

  await page.goto(studentUrl);
  await ready(page);
  await page.getByLabel('E-Mail des Schülers').fill('schueler@example.org');
  await page.getByRole('button', { name: 'Zur Lern-App einladen' }).click();
  await expect(page.getByText('Zugang ist eingerichtet.')).toBeVisible();

  // Schüler: Mein Weg
  await asRole(page, 'student');
  await page.goto('/');
  await expect(page).toHaveURL(/\/lernen$/);
  await expect(page.getByRole('heading', { name: 'Mein Weg', level: 1 })).toBeVisible();
  await expect(page.getByRole('progressbar', { name: 'Gesamt A1 → B2' })).toHaveAttribute(
    'aria-valuenow',
    '0',
  );
  await expect(page.getByText('Noch nicht freigeschaltet')).toHaveCount(3);
  await noHorizontalScroll(page);

  // Modul A1.1: Regeln und Übungen mit Prüfung
  await page.getByRole('link', { name: /Begrüßen & Vorstellen/ }).click();
  await expect(page).toHaveURL(/\/lernen\/modul\/A1\.1$/);
  await ready(page);
  await expect(page.getByRole('heading', { name: 'Regeln und Beispielsätze' })).toBeVisible();
  const q = page.getByLabel('Ich ___ aus Marokko. (kommen)');
  await q.fill('kommst');
  await q.locator('xpath=ancestor::form').getByRole('button', { name: 'Prüfen' }).click();
  await expect(q.locator('xpath=ancestor::form').getByRole('status')).toContainText(
    'Lösung: komme',
  );
  await q.fill('komme');
  await q.locator('xpath=ancestor::form').getByRole('button', { name: 'Prüfen' }).click();
  await expect(q.locator('xpath=ancestor::form').getByRole('status')).toHaveText('Richtig!');
  await noHorizontalScroll(page);

  // Mini-Test: alle Fragen richtig beantworten
  await page.goto('/lernen/modul/A1.1/test');
  await ready(page);
  const questions = miniTest('A1.1');
  for (const [i, x] of questions.entries())
    await page.getByLabel(`${i + 1}. ${x.frage}`, { exact: true }).fill(x.loesung);
  await page.getByRole('button', { name: 'Test abgeben' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Ergebnis' })).toHaveText(
    `Ergebnis: ${questions.length} von ${questions.length} Punkten (100 %)`,
  );

  await page.goto('/lernen');
  const moduleRow = page.getByRole('link', { name: /Begrüßen & Vorstellen/ });
  await expect(moduleRow).not.toContainText(/\b0 %/);

  // Hausaufgabe abgeben
  await page.goto('/lernen/hausaufgaben');
  await ready(page);
  await page.getByLabel('Meine Abgabe').fill('Ich heiße Amal. Ich komme aus Marokko.');
  await page.getByRole('button', { name: 'Abgeben' }).click();
  await expect(page.getByText('Abgegeben. Deine Lehrkraft gibt dir Feedback.')).toBeVisible();

  // Fehler wiederholen
  await page.goto('/lernen/fehler');
  await ready(page);
  await page.getByLabel('Schreibe es richtig:').fill('Ich heiße Amal');
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await expect(page.getByRole('main').getByRole('status')).toHaveText('Richtig!');

  // Strikte Trennung: keine Team-Seiten, keine Skripte, keine höheren Level
  for (const url of [
    '/fortschritt',
    '/stunde/A1.1.Di',
    '/dokumentation',
    '/einstellungen',
    '/playbook',
  ]) {
    await page.goto(url);
    await expect(page, url).toHaveURL(/\/lernen$/);
  }
  await page.goto('/lernen/modul/B1.1');
  await expect(page.getByText('Dieses Modul ist noch nicht freigeschaltet.')).toBeVisible();

  // Team sieht Ergebnis und Abgabe
  await asRole(page, 'admin');
  await page.goto(studentUrl);
  await expect(page.getByText(/A1\.1 Begrüßen & Vorstellen: 8 von 8/)).toBeVisible();
  await page.goto('/hausaufgaben');
  await expect(page.locator('li').filter({ hasText: name })).toContainText(
    'Ich heiße Amal. Ich komme aus Marokko.',
  );
  await expect(page.locator('li').filter({ hasText: name })).toContainText('Abgegeben');
});

test('Team-Bereich bleibt für die Leitung, Lern-App leitet das Team zurück', async ({ page }) => {
  await asRole(page, 'admin');
  await page.goto('/lernen');
  await expect(page).toHaveURL(/\/$/);
});
