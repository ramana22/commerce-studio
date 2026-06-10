'use client'

import { useState } from 'react'
import type { ProductDetail } from '@/lib/catalog/types'
import { useCart } from '@/components/cart/cart-context'
import { formatInr } from '@/lib/medusa/money'

export function PdpActions({ product }: { product: ProductDetail }) {
  const { addItem, isPending } = useCart()
  const firstAvailable =
    product.variants.find((v) => v.in_stock) ?? product.variants[0]
  const [variantId, setVariantId] = useState(firstAvailable?.id ?? '')
  const [added, setAdded] = useState(false)

  const selected =
    product.variants.find((v) => v.id === variantId) ?? firstAvailable
  const hasShades = product.variants.some((v) => v.shade_name)

  function handleAdd() {
    if (!selected) return
    addItem(selected.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="mt-4 space-y-6">
      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-semibold">
          {formatInr(selected?.price_inr ?? product.price_inr)}
        </span>
        {selected?.mrp_inr && selected.mrp_inr > selected.price_inr ? (
          <span className="text-lg text-neutral-400 line-through">
            {formatInr(selected.mrp_inr)}
          </span>
        ) : null}
      </div>

      {/* Shade selector */}
      {hasShades ? (
        <div>
          <p className="mb-2 text-sm font-medium">
            Shade:{' '}
            <span className="text-neutral-600">{selected?.shade_name}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={!v.in_stock}
                onClick={() => setVariantId(v.id)}
                title={v.shade_name ?? v.title}
                className={`h-9 w-9 rounded-full border-2 transition disabled:cursor-not-allowed disabled:opacity-30 ${
                  v.id === variantId
                    ? 'border-pink-600 ring-2 ring-pink-200'
                    : 'border-neutral-300'
                }`}
                style={
                  v.shade_hex ? { backgroundColor: `#${v.shade_hex}` } : undefined
                }
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Add to bag */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={isPending || !selected?.in_stock}
        className="w-full rounded bg-pink-600 px-6 py-4 font-medium text-white transition hover:bg-pink-700 disabled:opacity-50 sm:w-auto sm:px-12"
      >
        {!selected?.in_stock
          ? 'Out of stock'
          : added
            ? 'Added to bag ✓'
            : isPending
              ? 'Adding…'
              : 'Add to bag'}
      </button>
    </div>
  )
}
