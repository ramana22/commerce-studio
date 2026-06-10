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
        // Sugar magenta — overrides Tailwind's default pink scale so every
        // pink-* utility across the app maps to the brand colour.
        pink: {
          50: '#FFF0F7',
          100: '#FFE3EF',
          200: '#FFC6DF',
          300: '#FF9DC7',
          400: '#FF5CA3',
          500: '#FF2A8C',
          600: '#FF0F7B',
          700: '#E0006A',
          800: '#B80057',
          900: '#8A0042',
        },
        brand: {
          pink: '#FF0F7B',
          pinkDark: '#E0006A',
          ink: '#0E0E10',
          cream: '#FFF6F2',
        },
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(14,14,16,0.04), 0 8px 24px -12px rgba(14,14,16,0.12)',
        hover: '0 8px 20px -6px rgba(255,15,123,0.25)',
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
      },
      animation: {
        marquee: 'marquee 24s linear infinite',
        shimmer: 'shimmer 1.6s infinite',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}

export default config
