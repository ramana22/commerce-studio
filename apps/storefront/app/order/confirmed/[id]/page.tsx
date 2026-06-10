import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getOrder } from '@/lib/order/order-service'
import { formatUsd } from '@/lib/medusa/money'
import { CartClearer } from '@/components/cart/cart-clearer'

export const metadata: Metadata = { title: 'Order confirmed' }

export default async function OrderConfirmedPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrder(id)
  if (!order) notFound()

  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <CartClearer />

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
        ✓
      </div>
      <h1 className="mt-6 text-2xl font-semibold">Thank you for your order!</h1>
      <p className="mt-2 text-neutral-500">
        Order <span className="font-medium">#{order.display_id}</span> is
        confirmed. A receipt has been sent to{' '}
        <span className="font-medium">{order.email}</span>.
      </p>

      <dl className="mx-auto mt-8 max-w-sm space-y-2 rounded-lg border border-neutral-200 p-6 text-left text-sm">
        <div className="flex justify-between">
          <dt className="text-neutral-500">Items</dt>
          <dd>{order.item_count}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-500">Status</dt>
          <dd className="capitalize">{order.status}</dd>
        </div>
        <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold">
          <dt>Total paid</dt>
          <dd className="tabular-nums">{formatUsd(order.total_usd)}</dd>
        </div>
      </dl>

      <Link
        href="/"
        className="mt-8 inline-block rounded bg-pink-600 px-6 py-3 font-medium text-white"
      >
        Continue shopping
      </Link>
    </main>
  )
}
