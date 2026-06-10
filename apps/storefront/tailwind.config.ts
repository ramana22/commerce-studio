import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'sans-serif'],
      },
      colors: {
        // BodyScent ember — a warm amber/copper brand. Overrides Tailwind's
        // default pink scale so every pink-* utility across the app maps to the
        // brand colour (kept as `pink-*` to avoid churn across components).
        pink: {
          50: '#FCF6EF',
          100: '#F8E7D6',
          200: '#EFC9A9',
          300: '#E3A877',
          400: '#D98A4E',
          500: '#CC6E2C',
          600: '#B5571F',
          700: '#974318',
          800: '#793516',
          900: '#5A2712',
        },
        brand: {
          pink: '#B5571F',
          pinkDark: '#974318',
          ink: '#1A1310',
          cream: '#FBF5EE',
          gold: '#C9923E',
          plum: '#3B2730',
        },
      },
      backgroundImage: {
        'ember-radial':
          'radial-gradient(120% 120% at 0% 0%, #F8E7D6 0%, #EFC9A9 45%, #B5571F 100%)',
        'ember-sheen':
          'linear-gradient(135deg, #1A1310 0%, #3B2730 45%, #B5571F 100%)',
        'gold-line':
          'linear-gradient(90deg, transparent, #C9923E 50%, transparent)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(26,19,16,0.04), 0 8px 24px -12px rgba(26,19,16,0.14)',
        hover: '0 18px 40px -16px rgba(181,87,31,0.45)',
        glow: '0 0 0 1px rgba(201,146,62,0.25), 0 20px 60px -20px rgba(181,87,31,0.5)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-22px) rotate(-3deg)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glow: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.06)' },
        },
        'spin-slow': {
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        'marquee-fast': 'marquee 16s linear infinite',
        shimmer: 'shimmer 1.6s infinite',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 9s ease-in-out infinite',
        'gradient-x': 'gradient-x 9s ease infinite',
        glow: 'glow 5s ease-in-out infinite',
        'spin-slow': 'spin-slow 22s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
