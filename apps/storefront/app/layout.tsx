import type { Metadata } from 'next'
import { MotionConfig } from 'motion/react'
import './globals.css'
import { fontSans, fontDisplay } from '@/lib/fonts'
import { getCart } from '@/lib/cart/cart-service'
import { getAnnouncementBar } from '@/lib/sanity/queries'
import { CartProvider } from '@/components/cart/cart-context'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { AnnouncementBar } from '@/components/layout/announcement-bar'
import { PromoBar } from '@/components/layout/promo-bar'
import { cn } from '@/lib/utils/cn'

export const metadata: Metadata = {
  title: {
    default: 'BodyScent — Pure Perfume Oils',
    template: '%s | BodyScent',
  },
  description:
    'Skin-safe, alcohol-free perfume oils inspired by the icons. Long-lasting roll-on fragrances from $8.',
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
      <body className="flex min-h-screen flex-col font-sans">
        <MotionConfig reducedMotion="user">
          <CartProvider initialCart={cart}>
            {announcement ? <AnnouncementBar data={announcement} /> : <PromoBar />}
            <SiteHeader />
            <div className="flex-1">{children}</div>
            <SiteFooter />
            <CartDrawer />
          </CartProvider>
        </MotionConfig>
      </body>
    </html>
  )
}
