import type { Metadata } from 'next'
import './globals.css'
import { getCart } from '@/lib/cart/cart-service'
import { CartProvider } from '@/components/cart/cart-context'
import { SiteHeader } from '@/components/layout/site-header'

export const metadata: Metadata = {
  title: {
    default: 'Sugar Cosmetics',
    template: '%s | Sugar Cosmetics',
  },
  description: 'Premium beauty products — lipsticks, eyeshadows, foundations and more.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cart = await getCart()
  return (
    <html lang="en">
      <body>
        <CartProvider initialCart={cart}>
          <SiteHeader />
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
