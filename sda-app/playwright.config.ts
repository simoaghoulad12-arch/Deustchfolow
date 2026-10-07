import { defineConfig, devices } from '@playwright/test';

const PORT = 3210;

/**
 * Playwright: wichtige Abläufe auf Handy-Größe (390 px) und Desktop.
 * Läuft gegen `next dev` mit Testzugang (SDA_DEV_MEMBER_ROLE, nur in der Entwicklung wirksam),
 * weil für Tests kein Supabase-Projekt nötig sein soll.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    locale: 'de-DE',
  },
  projects: [
    {
      name: 'handy-390',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: `pnpm exec next dev -p ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { SDA_DEV_MEMBER_ROLE: 'admin', NEXT_TELEMETRY_DISABLED: '1' },
  },
});
