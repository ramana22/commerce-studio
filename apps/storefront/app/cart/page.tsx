'use client'

import Link from 'next/link'
import { formatInr } from '@/lib/medusa/money'
import { useCart } from '@/components/cart/cart-context'
import { CartLineItem } from '@/components/cart/cart-line-item'

export default function CartPage() {
  const { cart, isPending } = useCart()

  if (!cart || cart.lines.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Your bag is empty</h1>
        <p className="mt-2 text-neutral-500">
          Add some products to get started.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded bg-pink-600 px-6 py-3 font-medium text-white"
        >
          Continue shopping
        </Link>
      </main>
    )
  }

  const { totals } = cart

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">
        Your bag ({totals.item_count})
      </h1>

      <ul className={isPending ? 'opacity-60 transition-opacity' : undefined}>
        {cart.lines.map((line) => (
          <CartLineItem key={line.id} line={line} />
        ))}
      </ul>

      <dl className="mt-6 space-y-2">
        <div className="flex justify-between text-sm">
          <dt className="text-neutral-500">Subtotal</dt>
          <dd className="tabular-nums">{formatInr(totals.subtotal_inr)}</dd>
        </div>
        {totals.discount_inr > 0 ? (
          <div className="flex justify-between text-sm text-green-700">
            <dt>Discount</dt>
            <dd className="tabular-nums">−{formatInr(totals.discount_inr)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-neutral-200 pt-2 text-lg font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatInr(totals.total_inr)}</dd>
        </div>
        <p className="text-right text-xs text-neutral-400">
          Shipping &amp; taxes calculated at checkout
        </p>
      </dl>

      <Link
        href="/checkout"
        className="mt-6 block rounded bg-pink-600 px-6 py-4 text-center font-medium text-white"
      >
        Proceed to checkout
      </Link>
    </main>
  )
}
