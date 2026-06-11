'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { searchAction } from '@/lib/catalog/search'
import {
  meiliEnabled,
  meiliSearch,
  type PriceBucket,
  type SortOption,
} from '@/lib/search/meili'
import { formatUsd } from '@/lib/medusa/money'
import { NAV_CATEGORIES } from '@/lib/catalog/nav'
import { bottleImage } from '@/lib/catalog/placeholder'
import { AppImage } from '@/components/ui/app-image'
import { cn } from '@/lib/utils/cn'

const SUGGESTIONS = ['Oud', 'Vanilla', 'Musk', 'For Him', 'Gift Set']
const PRICE_BUCKETS: { key: PriceBucket; label: string }[] = [
  { key: 'lt10', label: 'Under $10' },
  { key: '10to20', label: '$10–$20' },
  { key: 'gt20', label: '$20+' },
]
const GENRE_LABEL = Object.fromEntries(
  NAV_CATEGORIES.map((c) => [c.handle, c.label]),
)

interface Row {
  id: string
  handle: string
  title: string
  thumbnail: string | null
  price_usd: number
  from_price: boolean
}

export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [genreFacets, setGenreFacets] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [meta, setMeta] = useState<{ total: number; tookMs: number } | null>(null)

  // Facet state (Meilisearch only).
  const [genres, setGenres] = useState<string[]>([])
  const [price, setPrice] = useState<PriceBucket | null>(null)
  const [sort, setSort] = useState<SortOption>('relevance')

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => inputRef.current?.focus(), 60)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      clearTimeout(t)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setRows([])
      setGenres([])
      setPrice(null)
      setSort('relevance')
      setMeta(null)
    }
  }, [open])

  const toggleGenre = (h: string) =>
    setGenres((g) => (g.includes(h) ? g.filter((x) => x !== h) : [...g, h]))

  // Debounced search — Meilisearch (instant) when configured, else Medusa.
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setRows([])
      setMeta(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const delay = meiliEnabled ? 120 : 250
    const id = setTimeout(async () => {
      if (meiliEnabled) {
        const r = await meiliSearch(q, { genres, price, sort })
        setRows(
          r.hits.map((h) => ({
            id: h.id,
            handle: h.handle,
            title: h.title,
            thumbnail: h.thumbnail,
            price_usd: h.price_usd,
            from_price: h.from_price,
          })),
        )
        setGenreFacets(r.genreFacets)
        setMeta({ total: r.total, tookMs: r.tookMs })
      } else {
        const found = await searchAction(q)
        setRows(
          found.map((p) => ({
            id: p.id,
            handle: p.handle,
            title: p.title,
            thumbnail: p.thumbnail,
            price_usd: p.price_usd,
            from_price: p.shades.length > 1,
          })),
        )
        setMeta(null)
      }
      setLoading(false)
    }, delay)
    return () => clearTimeout(id)
  }, [query, genres, price, sort])

  const facetChips = useMemo(
    () =>
      NAV_CATEGORIES.filter((c) => genreFacets[c.handle] || genres.includes(c.handle)),
    [genreFacets, genres],
  )

  const showResults = query.trim().length >= 2

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-brand-ink/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-label="Search products"
            className="fixed inset-x-0 top-0 z-50 max-h-[88vh] overflow-y-auto bg-white shadow-xl"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            <div className="mx-auto max-w-3xl px-5 py-6">
              <div className="flex items-center gap-3 border-b-2 border-brand-ink pb-3">
                <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-pink-600" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search fragrances, notes, gifts…"
                  className="h-10 flex-1 bg-transparent text-lg outline-none placeholder:text-neutral-400"
                />
                <button type="button" onClick={onClose} className="text-sm font-medium text-neutral-500 hover:text-brand-ink">
                  Esc
                </button>
              </div>

              {/* Facets (Meilisearch) */}
              {showResults && meiliEnabled ? (
                <div className="mt-4 space-y-2">
                  {facetChips.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {facetChips.map((c) => (
                        <button
                          key={c.handle}
                          type="button"
                          onClick={() => toggleGenre(c.handle)}
                          className={cn(
                            'rounded-full border px-3 py-1 text-xs transition',
                            genres.includes(c.handle)
                              ? 'border-pink-600 bg-pink-600 text-white'
                              : 'border-neutral-200 text-neutral-700 hover:border-pink-400',
                          )}
                        >
                          {c.label}
                          {genreFacets[c.handle] ? (
                            <span className="ml-1 opacity-70">({genreFacets[c.handle]})</span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-2">
                    {PRICE_BUCKETS.map((b) => (
                      <button
                        key={b.key}
                        type="button"
                        onClick={() => setPrice((p) => (p === b.key ? null : b.key))}
                        className={cn(
                          'rounded-full border px-3 py-1 text-xs transition',
                          price === b.key
                            ? 'border-brand-ink bg-brand-ink text-white'
                            : 'border-neutral-200 text-neutral-700 hover:border-pink-400',
                        )}
                      >
                        {b.label}
                      </button>
                    ))}
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortOption)}
                      className="ml-auto rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700 outline-none"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="price_asc">Price: low to high</option>
                      <option value="price_desc">Price: high to low</option>
                    </select>
                  </div>
                </div>
              ) : null}

              {/* Empty state */}
              {!showResults ? (
                <div className="py-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Popular searches</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} type="button" onClick={() => setQuery(s)} className="rounded-full border border-neutral-200 px-4 py-1.5 text-sm text-neutral-700 transition hover:border-pink-400 hover:text-pink-600">
                        {s}
                      </button>
                    ))}
                  </div>
                  <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Browse</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {NAV_CATEGORIES.map((c) => (
                      <Link key={c.slug} href={`/${c.slug}`} onClick={onClose} className="rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium text-brand-ink transition hover:border-pink-400 hover:text-pink-600">
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  {meta ? (
                    <p className="mb-2 text-xs text-neutral-400">
                      {meta.total} result{meta.total === 1 ? '' : 's'} in {meta.tookMs}ms
                    </p>
                  ) : null}
                  {loading && rows.length === 0 ? (
                    <p className="py-8 text-center text-sm text-neutral-400">Searching…</p>
                  ) : rows.length === 0 ? (
                    <p className="py-8 text-center text-sm text-neutral-500">
                      No matches for “{query}”. Try another scent or note.
                    </p>
                  ) : (
                    <ul className="divide-y divide-neutral-100">
                      {rows.map((p) => (
                        <li key={p.id}>
                          <Link href={`/products/${p.handle}`} onClick={onClose} className="flex items-center gap-4 py-3 transition hover:bg-pink-50/60">
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                              {p.thumbnail ? (
                                <AppImage src={p.thumbnail} fallbackSrc={bottleImage(p.handle)} alt={p.title} fill sizes="56px" className="object-cover" />
                              ) : null}
                            </div>
                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-brand-ink">{p.title}</span>
                            <span className="shrink-0 text-sm font-semibold text-brand-ink">
                              {p.from_price ? 'From ' : ''}
                              {formatUsd(p.price_usd)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
