'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { useCart } from '@/components/cart/cart-context'
import { NAV_CATEGORIES } from '@/lib/catalog/nav'
import { cn } from '@/lib/utils/cn'

export function SiteHeader() {
  const { itemCount, openCart } = useCart()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-30 transition-all duration-300',
        scrolled
          ? 'border-b border-neutral-200 bg-white/80 backdrop-blur-md'
          : 'border-b border-transparent bg-white',
      )}
    >
      <div className="flex items-center justify-between px-4 py-3.5">
        <Link
          href="/"
          className="font-display text-2xl font-extrabold tracking-tight text-pink-600"
        >
          SUGAR
        </Link>

        <nav className="hidden gap-6 md:flex">
          {NAV_CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              className="group relative text-sm font-medium text-neutral-700 transition-colors hover:text-pink-600"
            >
              {c.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-pink-600 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={openCart}
          className="relative inline-flex items-center gap-2 text-sm font-medium"
          aria-label={`Open bag, ${itemCount} items`}
        >
          Bag
          <AnimatePresence>
            {itemCount > 0 ? (
              <motion.span
                key={itemCount}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-600 px-1.5 text-xs font-semibold text-white"
              >
                {itemCount}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile category scroller */}
      <nav className="no-scrollbar flex gap-4 overflow-x-auto border-t border-neutral-100 px-4 py-2 md:hidden">
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
