import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        ink: '#060606',
        coal: '#0c0c0c',
        graphite: '#151515',
        ash: '#242424',
        ivory: '#efe8da',
        mist: '#a19d94',
        fog: '#6c6a65',
        gold: { DEFAULT: '#c9a26b', soft: '#e0c596', deep: '#8a6a3f' },
        silver: { DEFAULT: '#cfd3d8', soft: '#e8eaed', deep: '#8b9097' },
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-2': 'rgb(var(--accent-2) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        label: '0.28em',
        wide2: '0.42em',
      },
      transitionTimingFunction: {
        cinematic: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        sheen: {
          '0%': { transform: 'translateX(-120%) skewX(-18deg)' },
          '100%': { transform: 'translateX(220%) skewX(-18deg)' },
        },
        drift: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(6px)' },
        },
      },
      animation: {
        sheen: 'sheen 2.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both',
        drift: 'drift 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
