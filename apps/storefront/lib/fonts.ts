import { Manrope, Fraunces } from 'next/font/google'

/** Body / UI typeface. */
export const fontSans = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

/**
 * Display typeface — an elegant, high-contrast serif for an upmarket perfume
 * feel (hero copy, section headings, the wordmark).
 */
export const fontDisplay = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})
