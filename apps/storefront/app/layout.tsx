import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Sugar Cosmetics',
    template: '%s | Sugar Cosmetics',
  },
  description: 'Premium beauty products — lipsticks, eyeshadows, foundations and more.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
