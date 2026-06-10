'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckoutSchema, type Address } from '@sugar-store/validators/checkout'
import type { CartView } from '@/lib/cart/cart-service'
import type { ShippingOptionView } from '@/lib/checkout/checkout-service'
import { placeOrder, startRazorpayPayment, finalizeOrder } from '@/lib/checkout/actions'
import { isRazorpayEnabled } from '@/lib/checkout/payment'
import {
  loadRazorpayScript,
  openRazorpayCheckout,
} from '@/lib/checkout/razorpay-client'
import { formatInr } from '@/lib/medusa/money'

type AddressForm = Omit<Address, 'country_code'>

const EMPTY_ADDRESS: AddressForm = {
  first_name: '',
  last_name: '',
  address_1: '',
  address_2: '',
  city: '',
  province: '',
  postal_code: '',
  phone: '',
}

export function CheckoutForm({
  cart,
  shippingOptions,
}: {
  cart: CartView
  shippingOptions: ShippingOptionView[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [email, setEmail] = useState('')
  const [shipping, setShipping] = useState<AddressForm>(EMPTY_ADDRESS)
  const [shippingOptionId, setShippingOptionId] = useState(
    shippingOptions[0]?.id ?? '',
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const selectedShipping = useMemo(
    () => shippingOptions.find((o) => o.id === shippingOptionId),
    [shippingOptions, shippingOptionId],
  )
  const estimatedTotal =
    cart.totals.subtotal_inr + (selectedShipping?.amount_inr ?? 0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    const input = {
      email,
      shipping_address: { ...shipping, country_code: 'in' },
      billing_same_as_shipping: true,
    }

    const parsed = CheckoutSchema.safeParse(input)
    if (!parsed.success) {
      const next: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        next[issue.path.join('.')] = issue.message
      }
      setErrors(next)
      return
    }
    setErrors({})

    if (!shippingOptionId) {
      setFormError('Please choose a delivery option.')
      return
    }

    const checkout = parsed.data
    startTransition(async () => {
      if (isRazorpayEnabled) {
        await payWithRazorpay(checkout)
      } else {
        const result = await placeOrder(checkout, shippingOptionId)
        if (result.ok) router.push(`/order/confirmed/${result.orderId}`)
        else setFormError(result.error)
      }
    })
  }

  async function payWithRazorpay(checkout: ReturnType<typeof CheckoutSchema.parse>) {
    const started = await startRazorpayPayment(checkout, shippingOptionId)
    if (!started.ok) {
      setFormError(started.error)
      return
    }
    const ready = await loadRazorpayScript()
    if (!ready) {
      setFormError('Could not load the payment gateway. Please retry.')
      return
    }
    try {
      await openRazorpayCheckout({
        key: started.data.key_id,
        amount: started.data.amount,
        currency: 'INR',
        name: 'SUGAR Cosmetics',
        description: 'Order payment',
        order_id: started.data.razorpay_order_id,
        prefill: {
          name: `${checkout.shipping_address.first_name} ${checkout.shipping_address.last_name}`.trim(),
          email: checkout.email,
          contact: checkout.shipping_address.phone,
        },
        theme: { color: '#FF0F7B' },
      })
    } catch {
      setFormError('Payment was cancelled.')
      return
    }
    const finalized = await finalizeOrder()
    if (finalized.ok) router.push(`/order/confirmed/${finalized.orderId}`)
    else setFormError(finalized.error)
  }

  function field(name: keyof AddressForm, label: string, required = true) {
    const key = `shipping_address.${name}`
    return (
      <label className="block">
        <span className="text-sm text-neutral-600">
          {label}
          {required ? ' *' : ''}
        </span>
        <input
          value={shipping[name]}
          onChange={(e) =>
            setShipping((s) => ({ ...s, [name]: e.target.value }))
          }
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
        />
        {errors[key] ? (
          <span className="text-xs text-red-600">{errors[key]}</span>
        ) : null}
      </label>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-10 md:grid-cols-[1fr_20rem]"
    >
      {/* ── Left: contact + address + delivery ── */}
      <div className="space-y-8">
        <section>
          <h2 className="mb-3 font-semibold">Contact</h2>
          <label className="block">
            <span className="text-sm text-neutral-600">Email *</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
            />
            {errors.email ? (
              <span className="text-xs text-red-600">{errors.email}</span>
            ) : null}
          </label>
        </section>

        <section>
          <h2 className="mb-3 font-semibold">Shipping address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {field('first_name', 'First name')}
            {field('last_name', 'Last name')}
          </div>
          <div className="mt-4 space-y-4">
            {field('address_1', 'Address')}
            {field('address_2', 'Apartment, suite, etc.', false)}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {field('city', 'City')}
            {field('province', 'State')}
            {field('postal_code', 'PIN code')}
          </div>
          <div className="mt-4">{field('phone', 'Mobile number')}</div>
        </section>

        <section>
          <h2 className="mb-3 font-semibold">Delivery</h2>
          {shippingOptions.length === 0 ? (
            <p className="text-sm text-red-600">
              No delivery options available. Run the backend seed to configure
              shipping.
            </p>
          ) : (
            <div className="space-y-2">
              {shippingOptions.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center justify-between rounded border border-neutral-300 px-4 py-3"
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping_option"
                      checked={shippingOptionId === opt.id}
                      onChange={() => setShippingOptionId(opt.id)}
                    />
                    {opt.name}
                  </span>
                  <span className="tabular-nums">
                    {opt.amount_inr === 0 ? 'Free' : formatInr(opt.amount_inr)}
                  </span>
                </label>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Right: order summary ── */}
      <aside className="h-fit rounded-lg border border-neutral-200 p-6">
        <h2 className="mb-4 font-semibold">Order summary</h2>
        <ul className="space-y-2 text-sm">
          {cart.lines.map((line) => (
            <li key={line.id} className="flex justify-between gap-2">
              <span className="truncate">
                {line.title}
                {line.shade_name ? ` · ${line.shade_name}` : ''} ×{' '}
                {line.quantity}
              </span>
              <span className="tabular-nums">{formatInr(line.total_inr)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-neutral-200 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Subtotal</dt>
            <dd className="tabular-nums">{formatInr(cart.totals.subtotal_inr)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Shipping</dt>
            <dd className="tabular-nums">
              {selectedShipping
                ? selectedShipping.amount_inr === 0
                  ? 'Free'
                  : formatInr(selectedShipping.amount_inr)
                : '—'}
            </dd>
          </div>
          <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatInr(estimatedTotal)}</dd>
          </div>
        </dl>

        {formError ? (
          <p className="mt-4 text-sm text-red-600">{formError}</p>
        ) : null}

        <button
          type="submit"
          disabled={isPending || shippingOptions.length === 0}
          className="mt-6 w-full rounded-full bg-pink-600 px-6 py-3.5 font-semibold text-white transition hover:bg-pink-700 disabled:opacity-50"
        >
          {isPending
            ? 'Processing…'
            : isRazorpayEnabled
              ? 'Pay now'
              : 'Place order'}
        </button>
        <p className="mt-2 text-center text-xs text-neutral-400">
          {isRazorpayEnabled
            ? 'Secure payment via Razorpay.'
            : 'Test checkout — manual payment (set Razorpay keys to enable live payments).'}
        </p>
      </aside>
    </form>
  )
}
