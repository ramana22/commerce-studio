'use client'

import Link from 'next/link'
import { useCart } from '@/components/cart/cart-context'

export function SiteHeader() {
  const { itemCount } = useCart()

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-4">
      <Link href="/" className="text-xl font-bold tracking-tight text-pink-600">
        SUGAR
      </Link>
      <Link href="/cart" className="relative inline-flex items-center gap-2">
        Bag
        {itemCount > 0 ? (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-600 px-1.5 text-xs font-medium text-white">
            {itemCount}
          </span>
        ) : null}
      </Link>
    </header>
  )
}
