import { Manrope, Syne } from 'next/font/google'

/** Body / UI typeface. */
export const fontSans = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

/** Display typeface for headings and hero copy. */
export const fontDisplay = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})
