'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import type { ProductCard } from '@sugar-store/types'
import { searchAction } from '@/lib/catalog/search'
import { formatUsd } from '@/lib/medusa/money'
import { NAV_CATEGORIES } from '@/lib/catalog/nav'
import { AppImage } from '@/components/ui/app-image'

const SUGGESTIONS = ['Oud', 'Vanilla', 'Musk', 'For Him', 'Gift Set']

export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ProductCard[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Lock scroll + close on Escape, and focus the input when opened.
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

  // Reset state whenever the overlay closes.
  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
    }
  }, [open])

  // Debounced search.
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    const id = setTimeout(async () => {
      const found = await searchAction(q)
      setResults(found)
      setLoading(false)
    }, 250)
    return () => clearTimeout(id)
  }, [query])

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
            className="fixed inset-x-0 top-0 z-50 max-h-[85vh] overflow-y-auto bg-white shadow-xl"
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
                <button
                  type="button"
                  onClick={onClose}
                  className="text-sm font-medium text-neutral-500 hover:text-brand-ink"
                >
                  Esc
                </button>
              </div>

              {/* Empty state — suggestions + categories */}
              {query.trim().length < 2 ? (
                <div className="py-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                    Popular searches
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setQuery(s)}
                        className="rounded-full border border-neutral-200 px-4 py-1.5 text-sm text-neutral-700 transition hover:border-pink-400 hover:text-pink-600"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                    Browse
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {NAV_CATEGORIES.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/${c.slug}`}
                        onClick={onClose}
                        className="rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium text-brand-ink transition hover:border-pink-400 hover:text-pink-600"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  {loading ? (
                    <p className="py-8 text-center text-sm text-neutral-400">Searching…</p>
                  ) : results.length === 0 ? (
                    <p className="py-8 text-center text-sm text-neutral-500">
                      No matches for “{query}”. Try another scent or note.
                    </p>
                  ) : (
                    <ul className="divide-y divide-neutral-100">
                      {results.map((p) => (
                        <li key={p.id}>
                          <Link
                            href={`/products/${p.handle}`}
                            onClick={onClose}
                            className="flex items-center gap-4 py-3 transition hover:bg-pink-50/60"
                          >
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                              {p.thumbnail ? (
                                <AppImage src={p.thumbnail} alt={p.title} fill sizes="56px" className="object-cover" />
                              ) : null}
                            </div>
                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-brand-ink">
                              {p.title}
                            </span>
                            <span className="shrink-0 text-sm font-semibold text-brand-ink">
                              {p.shades.length > 1 ? 'From ' : ''}
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
