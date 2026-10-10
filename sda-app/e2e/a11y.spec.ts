import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/** Barrierefreiheit (WCAG 2.1 A/AA): automatische Prüfung der wichtigsten Seiten, hell und dunkel. */
const PAGES = [
  '/',
  '/playbook',
  '/curriculum',
  '/lernziele',
  '/stunde/A1.1.Di',
  '/stunde/A1.1.Di?modus=liste',
  '/fortschritt',
  '/fortschritt/gruppen',
  '/fehler',
  '/hausaufgaben',
  '/dokumentation',
  '/qualitaet',
  '/standard',
  '/betrieb',
  '/entscheidungen',
  '/einstellungen',
  '/suche?q=Perfekt',
  '/login',
];

for (const theme of ['light', 'dark'] as const) {
  test(`Barrierefreiheit (${theme === 'light' ? 'hell' : 'dunkel'})`, async ({ page, context }) => {
    test.setTimeout(300_000);
    await context.addCookies([{ name: 'sda-theme', value: theme, url: 'http://localhost:3210' }]);
    const problems: string[] = [];
    for (const url of PAGES) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      for (const v of result.violations) {
        problems.push(
          `${url}: ${v.id} (${v.impact}) – ${v.nodes
            .slice(0, 3)
            .map((n) => n.target.join(' '))
            .join(' | ')}`,
        );
      }
    }
    expect(problems, problems.join('\n')).toEqual([]);
  });
}

for (const theme of ['light', 'dark'] as const) {
  test(`Barrierefreiheit Lern-App (${theme === 'light' ? 'hell' : 'dunkel'})`, async ({
    page,
    context,
  }) => {
    test.setTimeout(300_000);
    await context.addCookies([
      { name: 'sda-theme', value: theme, url: 'http://localhost:3210' },
      { name: 'sda-dev-role', value: 'student', url: 'http://localhost:3210' },
    ]);
    const problems: string[] = [];
    for (const url of [
      '/lernen',
      '/lernen/modul/A1.1',
      '/lernen/modul/A1.1/test',
      '/lernen/hausaufgaben',
      '/lernen/fehler',
      '/lernen/deutschland',
      '/lernen/einstellungen',
    ]) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      for (const v of result.violations)
        problems.push(
          `${url}: ${v.id} (${v.impact}) – ${v.nodes
            .slice(0, 3)
            .map((n) => n.target.join(' '))
            .join(' | ')}`,
        );
    }
    expect(problems, problems.join('\n')).toEqual([]);
  });
}
