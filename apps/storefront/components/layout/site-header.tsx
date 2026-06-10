'use client'

import Link from 'next/link'
import { useCart } from '@/components/cart/cart-context'
import { NAV_CATEGORIES } from '@/lib/catalog/nav'

export function SiteHeader() {
  const { itemCount } = useCart()

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white">
      <div className="flex items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-pink-600"
        >
          SUGAR
        </Link>

        <nav className="hidden gap-5 md:flex">
          {NAV_CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              className="text-sm font-medium text-neutral-700 hover:text-pink-600"
            >
              {c.label}
            </Link>
          ))}
        </nav>

        <Link href="/cart" className="relative inline-flex items-center gap-2">
          Bag
          {itemCount > 0 ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-600 px-1.5 text-xs font-medium text-white">
              {itemCount}
            </span>
          ) : null}
        </Link>
      </div>

      {/* Mobile category scroller */}
      <nav className="flex gap-4 overflow-x-auto border-t border-neutral-100 px-4 py-2 md:hidden">
        {NAV_CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/${c.slug}`}
            className="whitespace-nowrap text-sm font-medium text-neutral-700"
          >
            {c.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
