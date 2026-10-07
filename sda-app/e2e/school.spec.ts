import { expect, test, type Page } from '@playwright/test';
import { findLesson } from '../content';

const DAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

/** Heute in Europe/Berlin (wie die App). */
function todayBerlin(): { iso: string; day: string } {
  const iso = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  return { iso, day: DAYS[new Date(`${iso}T12:00:00Z`).getUTCDay()]! };
}

/** Im Entwicklungsserver lädt eine frisch kompilierte Seite einmal neu (Fast Refresh) – erst danach ausfüllen. */
async function ready(page: Page) {
  await page.waitForLoadState('networkidle');
}

async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow, `horizontaler Überlauf auf ${page.url()}`).toBeLessThanOrEqual(0);
}

test('Lehren → Dokumentieren → Messen: Gruppe, Schüler, Playbook, Dokumentation, Hausaufgaben, Fehler, Fortschritt', async ({
  page,
}, info) => {
  test.setTimeout(240_000);
  const tag = info.project.name;
  const groupName = `Testgruppe ${tag}`;
  const amal = `Amal ${tag}`;
  const karim = `Karim ${tag}`;
  const today = todayBerlin();

  // 1. Gruppe anlegen, Start heute
  await page.goto('/fortschritt/gruppen');
  await ready(page);
  await page.getByLabel('Name der Gruppe').fill(groupName);
  await page.getByLabel('Level').selectOption('A1');
  await page.getByLabel('Startdatum').fill(today.iso);
  await page.getByRole('button', { name: 'Gruppe anlegen' }).click();
  await page.getByRole('link', { name: new RegExp(groupName) }).click();
  await expect(page).toHaveURL(/\/fortschritt\/gruppen\/[0-9a-f-]{36}$/);
  const groupUrl = page.url();
  const groupId = groupUrl.split('/').pop()!;

  // 2. Zwei Schüler anlegen
  for (const [name, speaking] of [
    [amal, '4'],
    [karim, '2'],
  ] as const) {
    await page.goto(groupUrl);
    await page.getByRole('link', { name: 'Schüler hinzufügen' }).click();
    await expect(page).toHaveURL(/\/fortschritt\/neu/);
    await ready(page);
    await page.getByLabel('Name', { exact: true }).fill(name);
    await expect(page.getByLabel('Gruppe')).toHaveValue(groupId);
    await page.getByLabel('Sprechen').selectOption(speaking);
    await page.getByRole('button', { name: 'Speichern' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(name);
  }
  // Fehlerhafte Eingabe wird abgelehnt
  await page.goto('/fortschritt/neu');
  await ready(page);
  await page.getByLabel('Name', { exact: true }).fill('X');
  await page.getByLabel('Level').selectOption('A2');
  await page.getByLabel('Aktuelles Modul').selectOption('A1.3');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByRole('main').getByRole('alert')).toHaveText(
    'Das Modul passt nicht zum Level.',
  );

  // 3. Playbook zeigt die Stunde von heute laut Startdatum
  const todays = findLesson(`A1.1.${today.day}`)!;
  await page.goto('/playbook');
  const card = page.getByRole('region', { name: new RegExp(groupName) });
  await expect(card).toContainText(`Heute: Woche 1`);
  await expect(card).toContainText(todays.title);
  await expect(card).toContainText(amal);
  await expect(card).toContainText(karim);
  await expect(card).toContainText('Noch keine Dokumentation.');
  await noHorizontalScroll(page);

  // 4. Stunde dokumentieren: vorausgefüllt aus dem Skript, Karim abwesend, Hausaufgabe für Anwesende
  await page.goto(`/dokumentation/neu?gruppe=${groupId}&stunde=A1.1.Mo`);
  await ready(page);
  await expect(page.getByLabel('Heute behandelt')).toHaveValue(
    /^Alphabet, Aussprache & Zahlen 0–20: /,
  );
  await expect(page.getByLabel('Hausaufgabe', { exact: true })).not.toHaveValue('');
  await expect(page.getByLabel('Nächste Stunde')).toHaveValue(
    'Sich vorstellen: Konjugation im Präsens',
  );
  await page.getByRole('checkbox', { name: karim }).uncheck();
  await page.getByLabel('Hausaufgabe für alle Anwesenden im Hausaufgaben-System anlegen').check();
  await page.getByLabel('Wichtige Fehler').fill('Verb nicht auf Position 2');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page).toHaveURL(/\/dokumentation$/);
  const entry = page.locator('li').filter({ hasText: groupName }).first();
  await expect(entry).toContainText(`Anwesend${amal}`);
  await expect(entry).toContainText(`Abwesend${karim}`);
  await noHorizontalScroll(page);

  // 5. Hausaufgabe wurde für Amal angelegt; Status ändern
  await page.goto('/hausaufgaben?status=Offen');
  await ready(page);
  const hw = page.locator('li').filter({ hasText: amal }).first();
  await expect(hw).toContainText('Alphabet, Aussprache & Zahlen 0–20');
  await hw.getByRole('combobox').selectOption('Abgegeben');
  await page.waitForLoadState('networkidle');
  await page.goto('/hausaufgaben?status=Abgegeben');
  await expect(page.locator('li').filter({ hasText: amal }).first()).toBeVisible();

  // 6. Fehler erfassen, filtern, Status ändern
  await page.goto('/fehler');
  await page.getByRole('link', { name: 'Fehler erfassen' }).click();
  await expect(page).toHaveURL(/\/fehler\/neu/);
  await ready(page);
  await page.getByLabel('Schüler').selectOption({ label: `${karim} (A1)` });
  await page.getByLabel('Fehler (so wurde es gesagt/geschrieben)').fill('Ich heißen Karim');
  await page.getByLabel('Korrektur').fill('Ich heiße Karim');
  await page.getByLabel('Kategorie').selectOption('Grammatik');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page).toHaveURL(/\/fehler$/);
  await ready(page);
  await page.getByLabel('Kategorie').selectOption('Grammatik');
  await page.getByLabel('Status', { exact: true }).selectOption('offen');
  await page.getByRole('button', { name: 'Filtern' }).click();
  await expect(
    page.locator('li').filter({ hasText: karim }).getByText('Ich heißen Karim'),
  ).toBeVisible();
  await page.getByLabel('Kategorie').selectOption('Aussprache');
  await page.getByRole('button', { name: 'Filtern' }).click();
  await expect(page.locator('li').filter({ hasText: karim })).toHaveCount(0);

  // 7. Fortschritt: Anwesenheit aus der Dokumentation, Fehler, Hausaufgaben, Fertigkeiten
  await page.goto(`/fortschritt?gruppe=${groupId}`);
  const amalCard = page.locator('li.card').filter({ hasText: amal });
  await expect(amalCard).toContainText('100 % (1 von 1)');
  await expect(amalCard).toContainText('1 gesamt · 0 offen · 1 abgegeben');
  await expect(amalCard.getByRole('meter', { name: 'Sprechen' })).toHaveAttribute(
    'aria-valuenow',
    '4',
  );
  const karimCard = page.locator('li.card').filter({ hasText: karim });
  await expect(karimCard).toContainText('0 % (0 von 1)');
  await expect(karimCard).toContainText(/Offene Fehler\s*1/);
  await noHorizontalScroll(page);

  // 8. Playbook zeigt jetzt die letzte Dokumentation und offene Fehler
  await page.goto('/playbook');
  await expect(card).toContainText('Ich heißen Karim → Ich heiße Karim');
  await expect(card).not.toContainText('Noch keine Dokumentation.');

  // 9. Schüler löschen mit Bestätigung
  await page.goto(`/fortschritt?gruppe=${groupId}`);
  await karimCard.getByRole('link', { name: 'Bearbeiten' }).click();
  await expect(page).toHaveURL(/\/fortschritt\/[0-9a-f-]{36}$/);
  await ready(page);
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Schüler löschen' }).click();
  await expect(page).toHaveURL(/\/fortschritt$/);
  await expect(page.getByText(karim)).toBeHidden();
});

test('Stunde dokumentieren aus der Stunden-Ansicht', async ({ page }) => {
  await page.goto('/stunde/A2.3.Di');
  await page.getByRole('link', { name: 'Stunde dokumentieren' }).click();
  await expect(page).toHaveURL(/\/dokumentation\/neu\?stunde=A2\.3\.Di/);
  await expect(page.getByRole('heading', { name: 'Stunde dokumentieren' })).toBeVisible();
});

test('Dashboard: Lernweg und Kennzahlen', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Lernweg' })).toBeVisible();
  for (const k of ['A1', 'A2', 'B1', 'B2'])
    await expect(page.getByRole('progressbar', { name: `Fortschritt ${k}` })).toBeVisible();
  const main = page.getByRole('main');
  await expect(main.getByRole('link', { name: /Student Progress/ })).toBeVisible();
  await expect(main.getByRole('link', { name: /Error Tracking/ })).toBeVisible();
  await noHorizontalScroll(page);
});
