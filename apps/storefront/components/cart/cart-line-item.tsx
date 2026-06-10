'use client'

import type { CartLine } from '@sugar-store/types'
import { formatInr } from '@/lib/medusa/money'
import { AppImage } from '@/components/ui/app-image'
import { useCart } from './cart-context'

export function CartLineItem({ line }: { line: CartLine }) {
  const { updateItem, removeItem, isPending } = useCart()

  return (
    <li className="flex items-center gap-4 border-b border-neutral-200 py-4">
      {/* Thumbnail */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
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

      {/* Details */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{line.title}</p>
        {line.shade_name ? (
          <p className="flex items-center gap-1.5 text-sm text-neutral-500">
            {line.shade_hex ? (
              <span
                className="inline-block h-3 w-3 rounded-full border border-neutral-300"
                style={{ backgroundColor: `#${line.shade_hex}` }}
              />
            ) : null}
            {line.shade_name}
          </p>
        ) : null}
        <p className="mt-1 text-sm text-neutral-500">
          {formatInr(line.unit_price_inr)} each
        </p>
      </div>

      {/* Quantity stepper */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={isPending}
          onClick={() => updateItem(line.id, line.quantity - 1)}
          className="h-8 w-8 rounded border border-neutral-300 disabled:opacity-50"
        >
          −
        </button>
        <span className="w-6 text-center tabular-nums">{line.quantity}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={isPending}
          onClick={() => updateItem(line.id, line.quantity + 1)}
          className="h-8 w-8 rounded border border-neutral-300 disabled:opacity-50"
        >
          +
        </button>
      </div>

      {/* Line total + remove */}
      <div className="w-24 text-right">
        <p className="font-medium tabular-nums">{formatInr(line.total_inr)}</p>
        <button
          type="button"
          disabled={isPending}
          onClick={() => removeItem(line.id)}
          className="mt-1 text-sm text-neutral-400 underline hover:text-neutral-700 disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </li>
  )
}
