'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import type { ProductDetail } from '@/lib/catalog/types'
import { useCart } from '@/components/cart/cart-context'
import { formatUsd } from '@/lib/medusa/money'
import { cn } from '@/lib/utils/cn'

export function PdpActions({ product }: { product: ProductDetail }) {
  const { addItem, isPending } = useCart()
  const firstAvailable =
    product.variants.find((v) => v.in_stock) ?? product.variants[0]
  const [variantId, setVariantId] = useState(firstAvailable?.id ?? '')
  const [qty, setQty] = useState(1)

  const selected =
    product.variants.find((v) => v.id === variantId) ?? firstAvailable
  // Colour cosmetics carry a hex per variant; perfumes use size options.
  const isColor = product.variants.some((v) => v.shade_hex)
  const hasOptions = product.variants.length > 1
  const optionLabel = isColor ? 'Shade' : 'Size'
  const discount =
    selected?.msrp_usd && selected.msrp_usd > selected.price_usd
      ? Math.round((1 - selected.price_usd / selected.msrp_usd) * 100)
      : null

  return (
    <div className="mt-6 space-y-7">
      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="font-display text-3xl font-semibold text-brand-ink">
          {formatUsd(selected?.price_usd ?? product.price_usd)}
        </span>
        {selected?.msrp_usd && selected.msrp_usd > selected.price_usd ? (
          <>
            <span className="text-lg text-neutral-400 line-through">
              {formatUsd(selected.msrp_usd)}
            </span>
            {discount ? (
              <span className="rounded-full bg-pink-100 px-2 py-0.5 text-sm font-semibold text-pink-700">
                {discount}% off
              </span>
            ) : null}
          </>
        ) : null}
      </div>

      {/* Variant selector */}
      {hasOptions ? (
        <div>
          <p className="mb-2.5 text-sm font-medium text-brand-ink">
            {optionLabel}:{' '}
            <span className="text-neutral-500">
              {isColor ? selected?.shade_name : selected?.title}
            </span>
          </p>

          {isColor ? (
            <div className="flex flex-wrap gap-3">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  disabled={!v.in_stock}
                  onClick={() => setVariantId(v.id)}
                  title={v.shade_name ?? v.title}
                  className="relative h-10 w-10 rounded-full disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {v.id === variantId ? (
                    <motion.span
                      layoutId="variant-ring"
                      className="absolute -inset-1 rounded-full ring-2 ring-pink-600"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  ) : null}
                  <span
                    className="block h-full w-full rounded-full border border-neutral-300"
                    style={
                      v.shade_hex ? { backgroundColor: `#${v.shade_hex}` } : undefined
                    }
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  disabled={!v.in_stock}
                  onClick={() => setVariantId(v.id)}
                  className={cn(
                    'rounded-xl border px-4 py-2.5 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-40',
                    v.id === variantId
                      ? 'border-brand-ink bg-brand-ink text-white'
                      : 'border-neutral-300 text-brand-ink hover:border-pink-400',
                  )}
                >
                  <span className="block font-medium">{v.title}</span>
                  <span
                    className={cn(
                      'block text-xs',
                      v.id === variantId ? 'text-white/70' : 'text-neutral-500',
                    )}
                  >
                    {formatUsd(v.price_usd)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Quantity + add to bag */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="inline-flex items-center rounded-full border border-neutral-300">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid h-12 w-12 place-items-center text-lg text-brand-ink"
          >
            −
          </button>
          <span className="w-8 text-center tabular-nums">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => Math.min(10, q + 1))}
            className="grid h-12 w-12 place-items-center text-lg text-brand-ink"
          >
            +
          </button>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => selected && addItem(selected.id, qty)}
          disabled={isPending || !selected?.in_stock}
          className="flex-1 rounded-full bg-pink-600 px-8 py-4 font-semibold text-white shadow-hover transition hover:bg-pink-700 disabled:opacity-50"
        >
          {!selected?.in_stock
            ? 'Out of stock'
            : isPending
              ? 'Adding…'
              : `Add to bag · ${formatUsd((selected?.price_usd ?? 0) * qty)}`}
        </motion.button>
      </div>

      {/* Trust row */}
      <ul className="grid grid-cols-3 gap-3 border-t border-neutral-100 pt-5 text-center text-xs text-neutral-500">
        {[
          ['Free shipping', 'over $50'],
          ['12-hour wear', 'concentrated oil'],
          ['Cruelty-free', 'vegan & skin-safe'],
        ].map(([a, b]) => (
          <li key={a}>
            <p className="font-semibold text-brand-ink">{a}</p>
            <p>{b}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
