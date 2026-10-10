import { expect, test, type Browser, type Page } from '@playwright/test';
import { miniTest } from '../lib/learn';
import { loadLegacy } from '../scripts/legacy-runtime';
import { latestLink } from './mail';

/**
 * Probelauf der Schritte aus STATUS/Abschlussbericht mit echtem Supabase:
 * Leitung anmelden → Team einladen → Daten aus der alten Version importieren → Gruppe und Schüler →
 * Lehrkraft dokumentiert (sieht nur ihre Gruppe) → Leitung entscheidet → Schüler lernt in der Lern-App.
 * Alle Namen sind als Probe gekennzeichnet; nichts davon sind echte Akademie-Daten.
 */
const ADMIN = process.env.PROBE_ADMIN ?? 'leitung@probe.test';
const TEACHER = 'lehrkraft@probe.test';
const STUDENT = 'schueler@probe.test';
const SHOTS = process.env.PROBE_SHOTS;

async function shot(page: Page, name: string) {
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false });
}

async function signInWithLink(browser: Browser, email: string, after: number): Promise<Page> {
  const page = await (await browser.newContext()).newPage();
  await page.goto(await latestLink(email, after));
  await page.waitForURL((u) => !u.pathname.startsWith('/auth') && !u.pathname.startsWith('/login'));
  return page;
}

const ready = (page: Page) => page.waitForLoadState('networkidle');
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin' }).format(new Date());

test('Probelauf mit echtem Supabase', async ({ browser }) => {
  const start = Date.now();
  let admin!: Page;
  let teacher!: Page;
  let student!: Page;
  let groupId = '';
  let amalUrl = '';

  await test.step('1. Leitung nimmt die Einladung an und meldet sich per Magic Link an', async () => {
    admin = await signInWithLink(browser, ADMIN, 0);
    await expect(admin.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
    await shot(admin, '01-leitung-dashboard');
    // Abmelden und mit Anmeldelink wieder anmelden
    await admin.getByRole('button', { name: 'Menü' }).click();
    await admin.getByRole('dialog').getByRole('button', { name: 'Abmelden' }).click();
    await expect(admin).toHaveURL(/\/login$/);
    const t0 = Date.now();
    await admin.getByLabel('E-Mail').fill(ADMIN);
    await admin.getByRole('button', { name: 'Anmeldelink senden' }).click();
    await expect(admin.getByRole('status')).toContainText('Wenn diese Adresse eingeladen ist');
    await admin.goto(await latestLink(ADMIN, t0));
    await expect(admin.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
  });

  await test.step('2. Nicht eingeladene Adresse bekommt keinen Zugang', async () => {
    const page = await (await browser.newContext()).newPage();
    await page.goto('/login');
    await page.getByLabel('E-Mail').fill('fremd@probe.test');
    await page.getByRole('button', { name: 'Anmeldelink senden' }).click();
    // gleiche Antwort wie für Eingeladene (verrät nichts), aber es wird kein Konto angelegt
    await expect(page.getByRole('status')).toContainText('Wenn diese Adresse eingeladen ist');
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
  });

  await test.step('3. Leitung lädt eine Lehrkraft ein', async () => {
    await admin.goto('/admin/team');
    await ready(admin);
    await admin.getByLabel('Name').fill('Probe Lehrkraft');
    await admin.getByLabel('E-Mail').fill(TEACHER);
    await admin.getByLabel('Rolle').selectOption('teacher');
    await admin.getByRole('button', { name: 'Einladen' }).click();
    await expect(admin.getByRole('status')).toContainText(`Einladung an ${TEACHER} gesendet.`);
    await admin.reload();
    await expect(admin.getByText(TEACHER)).toBeVisible();
    await shot(admin, '02-team-und-zugaenge');
  });

  await test.step('4. Daten aus der alten Version importieren', async () => {
    const exportText = loadLegacy().run<string>(`(function(){
      putRec("students",{id:"p1",name:"Probe Import (alte Version)",level:"A2",start:"2026-01-05",module:"2",skills:{gr:3,sp:4},strengths:"",weaknesses:"",goals:""});
      putRec("docs",{id:"q1",date:"2026-01-06",teacher:"Lehrkraft 1",level:"A2",lessonId:"A2.2.Mo",present:["p1"],absent:[],covered:"Probe",canNow:"",errors:"",homework:"",next:"",material:"",problems:""});
      putRec("errors",{id:"r1",student:"p1",date:"2026-01-06",error:"Probe-Fehler",correction:"Probe-Korrektur",category:"Grammatik",status:"offen"});
      return JSON.stringify(DATA);
    })()`);
    await admin.goto('/einstellungen');
    await ready(admin);
    await admin.getByLabel('Export aus der alten Version').fill(exportText);
    await admin.getByRole('button', { name: 'Prüfen' }).click();
    await expect(admin.getByRole('status').filter({ hasText: 'Wird übernommen' })).toContainText(
      '1 Schüler, 1 Dokumentationen, 1 Fehler',
    );
    admin.once('dialog', (d) => d.accept());
    await admin.getByRole('button', { name: 'Importieren' }).click();
    await expect(admin.getByRole('status').filter({ hasText: 'Übernommen:' })).toBeVisible();
  });

  await test.step('5. Gruppe mit Startdatum heute, Lehrkraft zuordnen, zwei Schüler anlegen', async () => {
    await admin.goto('/fortschritt/gruppen');
    await ready(admin);
    await admin.getByLabel('Name der Gruppe').fill('Probegruppe A1');
    await admin.getByLabel('Startdatum').fill(today);
    await admin.getByRole('button', { name: 'Gruppe anlegen' }).click();
    await admin.getByRole('link', { name: /Probegruppe A1/ }).click();
    await admin.waitForURL(/\/fortschritt\/gruppen\/[0-9a-f-]{36}$/);
    groupId = admin.url().split('/').pop()!;
    await ready(admin);
    await admin.getByRole('checkbox', { name: /Probe Lehrkraft/ }).check();
    await admin.getByRole('button', { name: 'Team speichern' }).click();
    await expect(admin.getByRole('checkbox', { name: /Probe Lehrkraft/ })).toBeChecked();
    for (const name of ['Probe Amal', 'Probe Karim']) {
      await admin.goto(`/fortschritt/neu?gruppe=${groupId}`);
      await ready(admin);
      await admin.getByLabel('Name', { exact: true }).fill(name);
      await admin.getByRole('button', { name: 'Speichern' }).click();
      await admin.waitForURL(/\/fortschritt\/[0-9a-f-]{36}$/);
      if (name === 'Probe Amal') amalUrl = admin.url();
    }
  });

  await test.step('6. Lehrkraft nimmt die Einladung an und sieht nur ihre eigene Gruppe', async () => {
    teacher = await signInWithLink(browser, TEACHER, start);
    await teacher.goto('/fortschritt');
    await expect(teacher.getByRole('link', { name: 'Probe Amal' })).toBeVisible();
    await expect(teacher.getByRole('link', { name: 'Probe Karim' })).toBeVisible();
    // Importierter Schüler gehört zur Gruppe „Übernommen A2“ – nicht ihre Gruppe (Standard: nur eigene Gruppen)
    await expect(teacher.getByText('Probe Import (alte Version)')).toHaveCount(0);
    await teacher.goto('/admin/team');
    await expect(teacher).toHaveURL(/\/$/); // Team-Verwaltung nur für die Leitung
  });

  await test.step('7. Lehrkraft: Playbook „Heute“ und Stunde dokumentieren', async () => {
    await teacher.goto('/playbook');
    await expect(teacher.getByRole('region', { name: /Probegruppe A1/ })).toContainText(
      'Heute: Woche 1',
    );
    await shot(teacher, '03-lehrkraft-playbook');
    await teacher.goto(`/dokumentation/neu?gruppe=${groupId}&stunde=A1.1.Mo`);
    await ready(teacher);
    await expect(teacher.getByLabel('Heute behandelt')).toHaveValue(
      /^Alphabet, Aussprache & Zahlen 0–20: /,
    );
    await teacher.getByRole('checkbox', { name: 'Probe Karim' }).uncheck();
    await teacher
      .getByLabel('Hausaufgabe für alle Anwesenden im Hausaufgaben-System anlegen')
      .check();
    await shot(teacher, '04-stunde-dokumentieren');
    await teacher.getByRole('button', { name: 'Speichern' }).click();
    await expect(teacher).toHaveURL(/\/dokumentation$/);
    await expect(teacher.locator('li').filter({ hasText: 'Probegruppe A1' }).first()).toContainText(
      'AnwesendProbe Amal',
    );
  });

  await test.step('8. Leitung trägt eine Entscheidung ein (Probe)', async () => {
    await admin.goto('/entscheidungen');
    await ready(admin);
    const item = admin.locator('li[id="dec#4"]');
    await item.locator('details').evaluate((d: HTMLDetailsElement) => (d.open = true));
    await item.getByLabel('Status').selectOption('entschieden');
    await item.getByLabel('Entscheidung').fill('PROBE – kein echter Beschluss');
    await item.getByRole('button', { name: 'Speichern' }).click();
    await expect(admin.locator('li[id="dec#4"]')).toContainText('ENTSCHIEDEN');
    // Lehrkraft sieht die Entscheidung, kann aber selbst nichts entscheiden
    await teacher.goto('/entscheidungen');
    await expect(teacher.locator('li[id="dec#4"]')).toContainText('PROBE – kein echter Beschluss');
    await expect(teacher.getByText('Entscheidung eintragen')).toHaveCount(0);
  });

  await test.step('9. Schüler wird eingeladen und lernt in der Lern-App', async () => {
    const t0 = Date.now();
    await teacher.goto(amalUrl);
    await ready(teacher);
    await teacher.getByLabel('E-Mail des Schülers').fill(STUDENT);
    await teacher.getByRole('button', { name: 'Zur Lern-App einladen' }).click();
    await expect(teacher.getByText('Zugang ist eingerichtet.')).toBeVisible();

    student = await signInWithLink(browser, STUDENT, t0);
    await expect(student).toHaveURL(/\/lernen$/);
    await expect(student.getByRole('heading', { name: 'Mein Weg', level: 1 })).toBeVisible();
    await shot(student, '05-schueler-mein-weg');
    // Team-Seiten gesperrt
    for (const url of ['/fortschritt', '/stunde/A1.1.Di', '/dokumentation']) {
      await student.goto(url);
      await expect(student, url).toHaveURL(/\/lernen$/);
    }
    // Mini-Test
    await student.goto('/lernen/modul/A1.1/test');
    await ready(student);
    const qs = miniTest('A1.1');
    for (const [i, x] of qs.entries())
      await student.getByLabel(`${i + 1}. ${x.frage}`, { exact: true }).fill(x.loesung);
    await student.getByRole('button', { name: 'Test abgeben' }).click();
    await expect(student.getByRole('status').filter({ hasText: 'Ergebnis' })).toContainText(
      `${qs.length} von ${qs.length}`,
    );
    // Hausaufgabe aus der Dokumentation abgeben
    await student.goto('/lernen/hausaufgaben');
    await ready(student);
    await student.getByLabel('Meine Abgabe').fill('Probe-Abgabe: Ich heiße Amal.');
    await student.getByRole('button', { name: 'Abgeben' }).click();
    await expect(student.getByText('Abgegeben. Deine Lehrkraft gibt dir Feedback.')).toBeVisible();
    await student.goto('/lernen');
    await expect(student.getByRole('link', { name: /Begrüßen & Vorstellen/ })).not.toContainText(
      /^0 %/,
    );
    await shot(student, '06-schueler-nach-test');
  });

  await test.step('10. Lehrkraft sieht Ergebnis und Abgabe', async () => {
    await teacher.goto(amalUrl);
    await expect(teacher.getByText(/A1\.1 Begrüßen & Vorstellen: 8 von 8/)).toBeVisible();
    await teacher.goto('/hausaufgaben');
    await expect(teacher.locator('li').filter({ hasText: 'Probe Amal' }).first()).toContainText(
      'Probe-Abgabe: Ich heiße Amal.',
    );
    // Anwesenheit aus der Dokumentation
    await teacher.goto(`/fortschritt?gruppe=${groupId}`);
    await expect(teacher.locator('li.card').filter({ hasText: 'Probe Amal' })).toContainText(
      '100 % (1 von 1)',
    );
    await expect(teacher.locator('li.card').filter({ hasText: 'Probe Karim' })).toContainText(
      '0 % (0 von 1)',
    );
  });
});
