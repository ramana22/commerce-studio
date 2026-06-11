'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { ProductCard as ProductCardData } from '@sugar-store/types'
import {
  INTENSITY_LABELS,
  LONGEVITY_HOURS,
  OCCASION_OPTIONS,
  SCENT_MOODS,
  scentProfile,
  type ScentProfile,
} from '@/lib/catalog/scent'
import { pseudoRating } from '@/lib/catalog/rating'
import { ProductCard } from '@/components/product/product-card'
import { cn } from '@/lib/utils/cn'

type PriceKey = 'lt10' | '10to20' | 'gt20'
type SortKey = 'featured' | 'price_asc' | 'price_desc' | 'rating' | 'new'

const PRICE_OPTIONS: { key: PriceKey; label: string }[] = [
  { key: 'lt10', label: 'Under $10' },
  { key: '10to20', label: '$10 – $20' },
  { key: 'gt20', label: 'Over $20' },
]

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'price_asc', label: 'Price: Low to High' },
  { key: 'price_desc', label: 'Price: High to Low' },
  { key: 'rating', label: 'Top Rated' },
  { key: 'new', label: 'New Arrivals' },
]

interface Filters {
  moods: string[]
  intensities: string[]
  longevities: number[]
  occasions: string[]
  prices: PriceKey[]
}

const EMPTY_FILTERS: Filters = {
  moods: [],
  intensities: [],
  longevities: [],
  occasions: [],
  prices: [],
}

interface Item {
  product: ProductCardData
  profile: ScentProfile
  rating: number
}

function priceMatches(price: number, keys: PriceKey[]): boolean {
  return keys.some(
    (k) =>
      (k === 'lt10' && price < 10) ||
      (k === '10to20' && price >= 10 && price <= 20) ||
      (k === 'gt20' && price > 20),
  )
}

function matches(item: Item, f: Filters): boolean {
  if (f.moods.length && !f.moods.includes(item.profile.mood.slug)) return false
  if (f.intensities.length && !f.intensities.includes(item.profile.intensityLabel))
    return false
  if (f.longevities.length && !f.longevities.includes(item.profile.longevityHours))
    return false
  if (f.occasions.length && !f.occasions.includes(item.profile.occasion)) return false
  if (f.prices.length && !priceMatches(item.product.price_usd, f.prices)) return false
  return true
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-300',
        active
          ? 'border-brand-ink bg-brand-ink text-white'
          : 'border-neutral-300 bg-white text-neutral-600 hover:border-pink-400 hover:text-brand-ink',
      )}
    >
      {children}
    </button>
  )
}

function DrawerSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-neutral-100 py-5">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

/**
 * Premium product listing — sticky filter toolbar, scent-attribute filters
 * (mood, intensity, longevity, occasion, price), sorting and an animated grid.
 * Attributes come from the shared scent profile, so filtering stays consistent
 * with what cards and PDPs display. `lockedMood` pins mood pages to one mood.
 */
export function FilteredProducts({
  products,
  lockedMood,
}: {
  products: ProductCardData[]
  lockedMood?: string
}) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [sort, setSort] = useState<SortKey>('featured')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const items = useMemo<Item[]>(
    () =>
      products.map((product) => {
        const profile = scentProfile(product.handle || product.id)
        const rating =
          product.rating_count && product.rating_count > 0
            ? (product.rating_average ?? 0)
            : pseudoRating(product.id).rating
        return { product, profile, rating }
      }),
    [products],
  )

  const visible = useMemo(() => {
    const filtered = items.filter((i) => matches(i, filters))
    const sorted = [...filtered]
    if (sort === 'price_asc') sorted.sort((a, b) => a.product.price_usd - b.product.price_usd)
    else if (sort === 'price_desc')
      sorted.sort((a, b) => b.product.price_usd - a.product.price_usd)
    else if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating)
    else if (sort === 'new')
      sorted.sort(
        (a, b) => Number(b.product.is_new_launch) - Number(a.product.is_new_launch),
      )
    return sorted
  }, [items, filters, sort])

  const activeCount =
    filters.moods.length +
    filters.intensities.length +
    filters.longevities.length +
    filters.occasions.length +
    filters.prices.length

  const activeChips: { label: string; remove: () => void }[] = [
    ...filters.moods.map((m) => ({
      label: SCENT_MOODS.find((x) => x.slug === m)?.label ?? m,
      remove: () => setFilters((f) => ({ ...f, moods: toggle(f.moods, m) })),
    })),
    ...filters.intensities.map((v) => ({
      label: v,
      remove: () => setFilters((f) => ({ ...f, intensities: toggle(f.intensities, v) })),
    })),
    ...filters.longevities.map((v) => ({
      label: `${v}h wear`,
      remove: () => setFilters((f) => ({ ...f, longevities: toggle(f.longevities, v) })),
    })),
    ...filters.occasions.map((v) => ({
      label: v,
      remove: () => setFilters((f) => ({ ...f, occasions: toggle(f.occasions, v) })),
    })),
    ...filters.prices.map((v) => ({
      label: PRICE_OPTIONS.find((p) => p.key === v)?.label ?? v,
      remove: () => setFilters((f) => ({ ...f, prices: toggle(f.prices, v) })),
    })),
  ]

  // Lock page scroll while the drawer is open.
  useEffect(() => {
    if (!drawerOpen) return
    const { style } = document.documentElement
    const prev = style.overflow
    style.overflow = 'hidden'
    return () => {
      style.overflow = prev
    }
  }, [drawerOpen])

  return (
    <div>
      {/* Sticky toolbar */}
      <div className="sticky top-[var(--header-h)] z-20 -mx-6 border-b border-neutral-200/80 bg-white/90 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3 py-3">
          <p className="hidden shrink-0 text-sm text-neutral-500 sm:block">
            <span className="font-semibold text-brand-ink">{visible.length}</span>{' '}
            {visible.length === 1 ? 'fragrance' : 'fragrances'}
          </p>

          {/* Quick mood chips (hidden on mood-locked pages) */}
          {!lockedMood ? (
            <div className="no-scrollbar mx-1 flex flex-1 gap-2 overflow-x-auto sm:border-l sm:border-neutral-200 sm:pl-4">
              {SCENT_MOODS.map((m) => (
                <FilterChip
                  key={m.slug}
                  active={filters.moods.includes(m.slug)}
                  onClick={() =>
                    setFilters((f) => ({ ...f, moods: toggle(f.moods, m.slug) }))
                  }
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: m.aura }}
                  />
                  {m.label}
                </FilterChip>
              ))}
            </div>
          ) : (
            <div className="flex-1" />
          )}

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold text-brand-ink transition-colors hover:border-pink-500 hover:text-pink-600"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
            >
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            Filters
            {activeCount > 0 ? (
              <span className="grid h-[1.125rem] min-w-[1.125rem] place-items-center rounded-full bg-pink-600 px-1 text-[10px] font-bold text-white">
                {activeCount}
              </span>
            ) : null}
          </button>

          <label className="relative shrink-0">
            <span className="sr-only">Sort products</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="cursor-pointer appearance-none rounded-full border border-neutral-300 bg-white py-2 pl-4 pr-8 text-xs font-semibold text-brand-ink outline-none transition-colors hover:border-pink-500 focus:border-pink-500"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">
              ▾
            </span>
          </label>
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 ? (
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-3">
            {activeChips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={chip.remove}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-pink-50 px-3 py-1.5 text-xs font-medium text-pink-700 transition-colors hover:bg-pink-100"
              >
                {chip.label}
                <span aria-hidden>×</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="shrink-0 text-xs font-semibold text-neutral-400 underline-offset-2 hover:text-brand-ink hover:underline"
            >
              Clear all
            </button>
          </div>
        ) : null}
      </div>

      {/* Grid */}
      {visible.length > 0 ? (
        <motion.div layout className="grid grid-cols-2 gap-4 pt-8 sm:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {visible.map(({ product }) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="mx-auto max-w-md py-24 text-center">
          <p className="font-display text-2xl font-semibold text-brand-ink">
            Nothing matches that blend
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            Try removing a filter or two — your signature scent is in here somewhere.
          </p>
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="mt-6 rounded-full bg-brand-ink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-pink-700"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Filter drawer */}
      <AnimatePresence>
        {drawerOpen ? (
          <div className="fixed inset-0 z-50">
            <motion.button
              type="button"
              aria-label="Close filters"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 h-full w-full cursor-default bg-brand-ink/45 backdrop-blur-sm"
            />
            <motion.aside
              role="dialog"
              aria-label="Filter fragrances"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
                <p className="font-display text-xl font-semibold text-brand-ink">
                  Refine your scent
                </p>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setDrawerOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-brand-ink"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6">
                {!lockedMood ? (
                  <DrawerSection title="Scent mood">
                    {SCENT_MOODS.map((m) => (
                      <FilterChip
                        key={m.slug}
                        active={filters.moods.includes(m.slug)}
                        onClick={() =>
                          setFilters((f) => ({ ...f, moods: toggle(f.moods, m.slug) }))
                        }
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: m.aura }}
                        />
                        {m.label}
                      </FilterChip>
                    ))}
                  </DrawerSection>
                ) : null}

                <DrawerSection title="Intensity">
                  {INTENSITY_LABELS.map((v) => (
                    <FilterChip
                      key={v}
                      active={filters.intensities.includes(v)}
                      onClick={() =>
                        setFilters((f) => ({
                          ...f,
                          intensities: toggle(f.intensities, v),
                        }))
                      }
                    >
                      {v}
                    </FilterChip>
                  ))}
                </DrawerSection>

                <DrawerSection title="Longevity">
                  {LONGEVITY_HOURS.map((v) => (
                    <FilterChip
                      key={v}
                      active={filters.longevities.includes(v)}
                      onClick={() =>
                        setFilters((f) => ({
                          ...f,
                          longevities: toggle(f.longevities, v),
                        }))
                      }
                    >
                      Up to {v} hours
                    </FilterChip>
                  ))}
                </DrawerSection>

                <DrawerSection title="Occasion">
                  {OCCASION_OPTIONS.map((v) => (
                    <FilterChip
                      key={v}
                      active={filters.occasions.includes(v)}
                      onClick={() =>
                        setFilters((f) => ({ ...f, occasions: toggle(f.occasions, v) }))
                      }
                    >
                      {v}
                    </FilterChip>
                  ))}
                </DrawerSection>

                <DrawerSection title="Price">
                  {PRICE_OPTIONS.map((p) => (
                    <FilterChip
                      key={p.key}
                      active={filters.prices.includes(p.key)}
                      onClick={() =>
                        setFilters((f) => ({ ...f, prices: toggle(f.prices, p.key) }))
                      }
                    >
                      {p.label}
                    </FilterChip>
                  ))}
                </DrawerSection>
              </div>

              <div className="flex items-center gap-3 border-t border-neutral-100 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  disabled={activeCount === 0}
                  className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-ink disabled:opacity-40"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 rounded-full bg-brand-ink px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-pink-700"
                >
                  Show {visible.length}{' '}
                  {visible.length === 1 ? 'fragrance' : 'fragrances'}
                </button>
              </div>
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
