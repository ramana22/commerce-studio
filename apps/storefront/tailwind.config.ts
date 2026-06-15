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
        // BodyScent — an emerald & champagne-gold botanical-luxury brand.
        // Overrides Tailwind's default pink scale so every pink-* utility across
        // the app maps to the brand emerald (kept as `pink-*` to avoid churn
        // across components — the key name is historical, the colour is emerald).
        pink: {
          50: '#ECF7F1',
          100: '#D2ECE0',
          200: '#A7D9C3',
          300: '#6FBE9F',
          400: '#3AA47C',
          500: '#1A8B62',
          600: '#0E7C5A',
          700: '#0B6147',
          800: '#0A4D3A',
          900: '#08382B',
        },
        brand: {
          pink: '#0E7C5A',
          pinkDark: '#0B6147',
          ink: '#10221B',
          cream: '#F4F8F4',
          gold: '#C8A24A',
          plum: '#15382C',
        },
      },
      backgroundImage: {
        'ember-radial':
          'radial-gradient(120% 120% at 0% 0%, #D2ECE0 0%, #A7D9C3 45%, #0E7C5A 100%)',
        'ember-sheen':
          'linear-gradient(135deg, #10221B 0%, #15382C 45%, #0E7C5A 100%)',
        'gold-line':
          'linear-gradient(90deg, transparent, #C8A24A 50%, transparent)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,34,27,0.04), 0 8px 24px -12px rgba(16,34,27,0.16)',
        hover: '0 18px 40px -16px rgba(14,124,90,0.42)',
        glow: '0 0 0 1px rgba(200,162,74,0.28), 0 20px 60px -20px rgba(14,124,90,0.5)',
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
        // Slow organic drift for aura blobs behind bottles / mood art.
        'aura-drift': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(26px, -18px) scale(1.12)' },
          '66%': { transform: 'translate(-20px, 12px) scale(0.94)' },
        },
        // Mist particles rising through/around a bottle.
        rise: {
          '0%': { transform: 'translateY(40%)', opacity: '0' },
          '20%': { opacity: '0.7' },
          '80%': { opacity: '0.4' },
          '100%': { transform: 'translateY(-120%)', opacity: '0' },
        },
        // Expanding sillage ring (softer than Tailwind's ping).
        'ping-soft': {
          '0%': { transform: 'scale(0.6)', opacity: '0.5' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        'marquee-fast': 'marquee 16s linear infinite',
        'marquee-slow': 'marquee 46s linear infinite',
        shimmer: 'shimmer 1.6s infinite',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 9s ease-in-out infinite',
        'gradient-x': 'gradient-x 9s ease infinite',
        glow: 'glow 5s ease-in-out infinite',
        'spin-slow': 'spin-slow 22s linear infinite',
        aura: 'aura-drift 14s ease-in-out infinite',
        rise: 'rise 7s linear infinite',
        'ping-soft': 'ping-soft 2.6s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}

export default config
