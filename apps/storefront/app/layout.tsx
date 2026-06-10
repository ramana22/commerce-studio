import type { Metadata } from 'next'
import './globals.css'
import { getCart } from '@/lib/cart/cart-service'
import { getAnnouncementBar } from '@/lib/sanity/queries'
import { CartProvider } from '@/components/cart/cart-context'
import { SiteHeader } from '@/components/layout/site-header'
import { AnnouncementBar } from '@/components/layout/announcement-bar'

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
  const [cart, announcement] = await Promise.all([
    getCart(),
    getAnnouncementBar(),
  ])

  return (
    <html lang="en">
      <body>
        <CartProvider initialCart={cart}>
          {announcement ? <AnnouncementBar data={announcement} /> : null}
          <SiteHeader />
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
