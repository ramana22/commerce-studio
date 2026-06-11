import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getCart } from '@/lib/cart/cart-service'
import { getShippingOptions } from '@/lib/checkout/checkout-service'
import { CheckoutForm } from '@/components/checkout/checkout-form'
import { TrackEvent } from '@/components/analytics/track-event'

export const metadata: Metadata = { title: 'Checkout' }

export default async function CheckoutPage() {
  const cart = await getCart()
  if (!cart || cart.lines.length === 0) {
    redirect('/cart')
  }

  const shippingOptions = await getShippingOptions(cart.id)

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <TrackEvent
        event="checkout_started"
        payload={{ value_usd: cart.totals.total_usd, items: cart.totals.item_count }}
      />
      <h1 className="mb-8 text-2xl font-semibold">Checkout</h1>
      <CheckoutForm cart={cart} shippingOptions={shippingOptions} />
    </main>
  )
}
