'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { useCart } from '@/components/cart/cart-context'
import { SearchOverlay } from '@/components/search/search-overlay'
import { NAV_CATEGORIES } from '@/lib/catalog/nav'
import { SCENT_MOODS, moodHref } from '@/lib/catalog/scent'
import { cn } from '@/lib/utils/cn'

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full text-brand-ink transition-colors hover:bg-pink-50 hover:text-pink-600"
    >
      {children}
    </button>
  )
}

export function SiteHeader() {
  const { itemCount, openCart } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const active = NAV_CATEGORIES.find((c) => c.slug === hovered)

  return (
    <header
      onMouseLeave={() => setHovered(null)}
      className={cn(
        'sticky top-0 z-30 transition-all duration-300',
        scrolled
          ? 'border-b border-neutral-200 bg-white/85 backdrop-blur-md'
          : 'border-b border-transparent bg-white',
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5">
        {/* Wordmark */}
        <Link
          href="/"
          onMouseEnter={() => setHovered(null)}
          className="relative z-40 flex items-center gap-2"
          aria-label="BodyScent home"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-ember-sheen text-sm font-bold text-white shadow-glow">
            B
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight text-brand-ink">
            BODY<span className="text-gradient-ember">SCENT</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          <Link
            href="/shop"
            onMouseEnter={() => setHovered(null)}
            className="relative py-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-neutral-700 transition-colors hover:text-pink-600"
          >
            Shop All
          </Link>
          {NAV_CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              onMouseEnter={() => setHovered(c.slug)}
              className="group relative py-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-neutral-700 transition-colors hover:text-pink-600"
            >
              {c.label}
              <span
                className={cn(
                  'absolute -bottom-0.5 left-0 h-0.5 bg-pink-600 transition-all duration-300',
                  hovered === c.slug ? 'w-full' : 'w-0 group-hover:w-full',
                )}
              />
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <IconButton label="Search" onClick={() => setSearchOpen(true)}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
          </IconButton>
          <IconButton label="Account">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" strokeLinecap="round" />
            </svg>
          </IconButton>
          <button
            type="button"
            onClick={openCart}
            aria-label={`Open bag, ${itemCount} items`}
            className="relative grid h-9 w-9 place-items-center rounded-full text-brand-ink transition-colors hover:bg-pink-50 hover:text-pink-600"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M6 8h12l-1 12H7L6 8z" />
              <path d="M9 8a3 3 0 016 0" strokeLinecap="round" />
            </svg>
            <AnimatePresence>
              {itemCount > 0 ? (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-600 px-1.5 text-xs font-semibold text-white"
                >
                  {itemCount}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Desktop category dropdown */}
      <AnimatePresence>
        {active ? (
          <motion.div
            key={active.slug}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-full hidden border-b border-neutral-200 bg-white/95 shadow-card backdrop-blur md:block"
          >
            <div className="mx-auto flex max-w-7xl items-center gap-8 px-4 py-6">
              <div
                className="h-28 w-44 shrink-0 rounded-2xl bg-grain"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${active.accent?.[0] ?? '#ECF7F1'}, ${active.accent?.[1] ?? '#0E7C5A'})`,
                }}
              />
              <div>
                <p className="font-display text-2xl font-semibold text-brand-ink">
                  {active.label}
                </p>
                <p className="mt-1 text-sm text-neutral-500">{active.tagline}</p>
                <Link
                  href={`/${active.slug}`}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-pink-600 hover:gap-2"
                >
                  Shop {active.label} →
                </Link>
              </div>

              {/* Mood shortcuts — fragrance is shopped by feeling first. */}
              <div className="ml-auto hidden max-w-xs border-l border-neutral-100 pl-8 lg:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                  Or shop by mood
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SCENT_MOODS.map((m) => (
                    <Link
                      key={m.slug}
                      href={moodHref(m.slug)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:border-pink-400 hover:text-pink-600"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: m.aura }}
                      />
                      {m.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Mobile category scroller */}
      <nav className="no-scrollbar flex gap-4 overflow-x-auto border-t border-neutral-100 px-4 py-2 md:hidden">
        <Link
          href="/shop"
          className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-neutral-700"
        >
          Shop All
        </Link>
        {NAV_CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/${c.slug}`}
            className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-neutral-700"
          >
            {c.label}
          </Link>
        ))}
      </nav>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
