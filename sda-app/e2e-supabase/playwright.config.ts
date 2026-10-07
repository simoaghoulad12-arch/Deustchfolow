import { defineConfig, devices } from '@playwright/test';

/**
 * Probelauf gegen ein echtes Supabase (lokal mit `supabase start`) und einen Produktions-Build der App.
 * Kein Testzugang: echte Einladungen, echte Anmeldelinks (aus Mailpit), echte Zugriffsregeln.
 * Ablauf und Voraussetzungen: e2e-supabase/README.md. Nicht Teil der CI.
 */
export default defineConfig({
  testDir: '.',
  timeout: 300_000,
  expect: { timeout: 20_000 },
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.PROBE_URL ?? 'http://localhost:3000',
    locale: 'de-DE',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'probelauf',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
