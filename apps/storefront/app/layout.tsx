import type { Metadata } from 'next'
import { MotionConfig } from 'motion/react'
import './globals.css'
import { fontSans, fontDisplay } from '@/lib/fonts'
import { getCart } from '@/lib/cart/cart-service'
import { getAnnouncementBar } from '@/lib/sanity/queries'
import { CartProvider } from '@/components/cart/cart-context'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { SiteHeader } from '@/components/layout/site-header'
import { AnnouncementBar } from '@/components/layout/announcement-bar'
import { cn } from '@/lib/utils/cn'

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
    <html lang="en" className={cn(fontSans.variable, fontDisplay.variable)}>
      <body className="font-sans">
        <MotionConfig reducedMotion="user">
          <CartProvider initialCart={cart}>
            {announcement ? <AnnouncementBar data={announcement} /> : null}
            <SiteHeader />
            {children}
            <CartDrawer />
          </CartProvider>
        </MotionConfig>
      </body>
    </html>
  )
}
