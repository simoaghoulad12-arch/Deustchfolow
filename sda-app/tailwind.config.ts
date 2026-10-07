import type { Config } from 'tailwindcss';

// Farben als CSS-Variablen (siehe app/globals.css), übernommen aus legacy/index.html.
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
        red: 'var(--red)',
        gold: 'var(--gold)',
      },
    },
  },
  plugins: [],
};

export default config;
