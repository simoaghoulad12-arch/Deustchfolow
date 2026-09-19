import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        ink: '#0a0a0a',
        void: '#000000',
        bone: '#f2f0ea',
        paper: '#e9e6dd',
        stone: '#3a3a38',
        smoke: '#8a8a86',
        gold: {
          DEFAULT: '#b79b6a',
          soft: '#c9b691',
          dim: '#8a7550',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.35em',
      },
      transitionTimingFunction: {
        cinematic: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-1%, -2%)' },
          '30%': { transform: 'translate(2%, 1%)' },
          '50%': { transform: 'translate(-2%, 2%)' },
          '70%': { transform: 'translate(1%, -1%)' },
          '90%': { transform: 'translate(-1%, 1%)' },
        },
      },
      animation: {
        grain: 'grain 8s steps(10) infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
