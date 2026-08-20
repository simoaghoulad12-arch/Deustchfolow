/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0a0603',
          900: '#120b06',
          800: '#1b120a',
          700: '#241a0f',
        },
        gold: {
          100: '#f8ecd2',
          200: '#f3e2b3',
          300: '#e9cd8a',
          400: '#d9b26a',
          500: '#c69a4e',
          600: '#a87c37',
          700: '#8a642c',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        arabic: ['"Amiri"', 'serif'],
        sans: ['"Jost"', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 60px -10px rgba(217, 178, 106, 0.45)',
        'gold-sm': '0 0 30px -8px rgba(217, 178, 106, 0.5)',
      },
      backgroundImage: {
        'radial-fade': 'radial-gradient(circle at 50% 30%, rgba(217,178,106,0.14), transparent 60%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-18px) translateX(6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
          '50%': { opacity: 0.9, transform: 'scale(1.08)' },
        },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        pulseGlow: 'pulseGlow 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
