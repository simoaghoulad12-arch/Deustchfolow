import type { Config } from 'tailwindcss';

// Farben als CSS-Variablen (app/globals.css), übernommen aus legacy/index.html.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        panel: 'var(--panel)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        anth: 'var(--anth)',
        anth2: 'var(--anth2)',
        'anth-ink': 'var(--anth-ink)',
        red: 'var(--red)',
        'red-soft': 'var(--red-soft)',
        gold: 'var(--gold)',
        'gold-soft': 'var(--gold-soft)',
        ok: 'var(--ok)',
        'ok-soft': 'var(--ok-soft)',
      },
    },
  },
  plugins: [],
};

export default config;
