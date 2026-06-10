'use client'

import { useCart } from './cart-context'

export function AddToCartButton({
  variantId,
  className,
}: {
  variantId: string | null
  className?: string
}) {
  const { addItem, isPending } = useCart()

  if (!variantId) {
    return (
      <button
        type="button"
        disabled
        className={className ?? 'rounded bg-neutral-200 px-4 py-2 text-sm'}
      >
        Unavailable
      </button>
    )
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => addItem(variantId)}
      className={
        className ??
        'rounded bg-pink-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50'
      }
    >
      {isPending ? 'Adding…' : 'Add to bag'}
    </button>
  )
}
