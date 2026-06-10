'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import type { ProductDetail } from '@/lib/catalog/types'
import { useCart } from '@/components/cart/cart-context'
import { formatInr } from '@/lib/medusa/money'
import { cn } from '@/lib/utils/cn'

export function PdpActions({ product }: { product: ProductDetail }) {
  const { addItem, isPending } = useCart()
  const firstAvailable =
    product.variants.find((v) => v.in_stock) ?? product.variants[0]
  const [variantId, setVariantId] = useState(firstAvailable?.id ?? '')

  const selected =
    product.variants.find((v) => v.id === variantId) ?? firstAvailable
  const hasShades = product.variants.some((v) => v.shade_name)
  const discount =
    selected?.mrp_inr && selected.mrp_inr > selected.price_inr
      ? Math.round((1 - selected.price_inr / selected.mrp_inr) * 100)
      : null

  return (
    <div className="mt-5 space-y-7">
      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold">
          {formatInr(selected?.price_inr ?? product.price_inr)}
        </span>
        {selected?.mrp_inr && selected.mrp_inr > selected.price_inr ? (
          <>
            <span className="text-lg text-neutral-400 line-through">
              {formatInr(selected.mrp_inr)}
            </span>
            {discount ? (
              <span className="text-sm font-semibold text-green-700">
                {discount}% off
              </span>
            ) : null}
          </>
        ) : null}
      </div>

      {/* Shade selector */}
      {hasShades ? (
        <div>
          <p className="mb-2.5 text-sm font-medium">
            Shade: <span className="text-neutral-600">{selected?.shade_name}</span>
          </p>
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
                    layoutId="shade-ring"
                    className="absolute -inset-1 rounded-full ring-2 ring-pink-600"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                ) : null}
                <span
                  className={cn(
                    'block h-full w-full rounded-full border border-neutral-300',
                  )}
                  style={
                    v.shade_hex ? { backgroundColor: `#${v.shade_hex}` } : undefined
                  }
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Add to bag */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => selected && addItem(selected.id)}
        disabled={isPending || !selected?.in_stock}
        className="w-full rounded-full bg-pink-600 px-6 py-4 font-semibold text-white transition hover:bg-pink-700 disabled:opacity-50 sm:w-auto sm:px-14"
      >
        {!selected?.in_stock
          ? 'Out of stock'
          : isPending
            ? 'Adding…'
            : 'Add to bag'}
      </motion.button>
    </div>
  )
}
