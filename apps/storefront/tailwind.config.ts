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
      },
      colors: {
        // Brand palette — filled out in Phase 7
        brand: {
          pink: '#E91E8C',
          dark: '#1A1A1A',
        },
      },
    },
  },
  plugins: [],
}

export default config
