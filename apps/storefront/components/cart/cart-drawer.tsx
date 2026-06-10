'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { formatUsd } from '@/lib/medusa/money'
import { AppImage } from '@/components/ui/app-image'
import { useCart } from './cart-context'

export function CartDrawer() {
  const { cart, isOpen, closeCart, updateItem, removeItem, isPending } =
    useCart()

  // Lock body scroll and close on Escape while the drawer is open.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeCart])

  const lines = cart?.lines ?? []
  const totals = cart?.totals

  // Free-shipping incentive ($50 threshold, matching the seed shipping copy).
  const FREE_SHIP = 50
  const subtotal = totals?.subtotal_usd ?? 0
  const remaining = Math.max(0, FREE_SHIP - subtotal)
  const progress = Math.min(100, (subtotal / FREE_SHIP) * 100)

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            aria-hidden
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-xl"
            role="dialog"
            aria-label="Shopping bag"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <h2 className="font-display text-lg font-bold">
                Your bag{totals ? ` (${totals.item_count})` : ''}
              </h2>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close bag"
                className="text-2xl leading-none text-neutral-500 hover:text-brand-ink"
              >
                ×
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-brand-cream text-pink-600">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.6}>
                    <path d="M6 8h12l-1 12H7L6 8z" />
                    <path d="M9 8a3 3 0 016 0" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-neutral-500">Your bag is empty.</p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="rounded-full bg-pink-600 px-6 py-3 font-medium text-white transition hover:bg-pink-700"
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              <>
                {/* Free-shipping progress */}
                <div className="border-b border-neutral-100 px-5 py-3">
                  <p className="text-xs text-neutral-600">
                    {remaining > 0 ? (
                      <>
                        You&apos;re{' '}
                        <span className="font-semibold text-brand-ink">
                          {formatUsd(remaining)}
                        </span>{' '}
                        away from free shipping
                      </>
                    ) : (
                      <span className="font-semibold text-pink-700">
                        🎉 You&apos;ve unlocked free shipping!
                      </span>
                    )}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                    <motion.div
                      className="h-full rounded-full bg-pink-600"
                      initial={false}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>

                <ul className="flex-1 overflow-y-auto px-5">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => (
                      <motion.li
                        key={line.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-3 border-b border-neutral-100 py-4"
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                          {line.thumbnail ? (
                            <AppImage
                              src={line.thumbnail}
                              alt={line.title}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="truncate text-sm font-medium">
                            {line.title}
                          </p>
                          {line.shade_name ? (
                            <p className="text-xs text-neutral-500">
                              {line.shade_name}
                            </p>
                          ) : null}
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                aria-label="Decrease quantity"
                                disabled={isPending}
                                onClick={() =>
                                  updateItem(line.id, line.quantity - 1)
                                }
                                className="h-7 w-7 rounded border border-neutral-300 disabled:opacity-50"
                              >
                                −
                              </button>
                              <span className="w-5 text-center text-sm tabular-nums">
                                {line.quantity}
                              </span>
                              <button
                                type="button"
                                aria-label="Increase quantity"
                                disabled={isPending}
                                onClick={() =>
                                  updateItem(line.id, line.quantity + 1)
                                }
                                className="h-7 w-7 rounded border border-neutral-300 disabled:opacity-50"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-sm font-semibold tabular-nums">
                              {formatUsd(line.total_usd)}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label="Remove item"
                          disabled={isPending}
                          onClick={() => removeItem(line.id)}
                          className="self-start text-neutral-300 hover:text-brand-ink"
                        >
                          ×
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <footer className="border-t border-neutral-200 px-5 py-4">
                  <div className="mb-3 flex justify-between font-semibold">
                    <span>Subtotal</span>
                    <span className="tabular-nums">
                      {formatUsd(totals?.subtotal_usd ?? 0)}
                    </span>
                  </div>
                  <p className="mb-3 text-xs text-neutral-400">
                    Shipping &amp; taxes calculated at checkout
                  </p>
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="block rounded-full bg-pink-600 px-6 py-3.5 text-center font-medium text-white transition hover:bg-pink-700"
                  >
                    Checkout
                  </Link>
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="mt-2 block text-center text-sm text-neutral-500 underline"
                  >
                    View full bag
                  </Link>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}
