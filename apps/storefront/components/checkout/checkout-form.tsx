'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckoutSchema, type Address } from '@sugar-store/validators/checkout'
import type { CartView } from '@/lib/cart/cart-service'
import type { ShippingOptionView } from '@/lib/checkout/checkout-service'
import { placeOrder, placeSquareOrder } from '@/lib/checkout/actions'
import {
  isSquareEnabled,
  SQUARE_APPLICATION_ID,
  SQUARE_LOCATION_ID,
  SQUARE_ENVIRONMENT,
} from '@/lib/checkout/payment'
import {
  loadSquareSdk,
  createSquareCard,
  tokenizeSquareCard,
  type SquareCard,
} from '@/lib/checkout/square-client'
import { formatUsd } from '@/lib/medusa/money'

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

  const cardRef = useRef<SquareCard | null>(null)

  // Mount the Square card form (an SDK-managed iframe) when Square is configured.
  useEffect(() => {
    if (!isSquareEnabled) return
    let active = true
    let card: SquareCard | null = null
    void (async () => {
      const ready = await loadSquareSdk(SQUARE_ENVIRONMENT)
      if (!ready || !active) return
      try {
        card = await createSquareCard(
          SQUARE_APPLICATION_ID,
          SQUARE_LOCATION_ID,
          '#card-container',
        )
        if (!active) {
          void card.destroy?.()
          return
        }
        cardRef.current = card
      } catch {
        if (active) setFormError('Could not load the card form. Please refresh.')
      }
    })()
    return () => {
      active = false
      void card?.destroy?.()
      cardRef.current = null
    }
  }, [])

  const selectedShipping = useMemo(
    () => shippingOptions.find((o) => o.id === shippingOptionId),
    [shippingOptions, shippingOptionId],
  )
  const estimatedTotal =
    cart.totals.subtotal_usd + (selectedShipping?.amount_usd ?? 0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    const input = {
      email,
      shipping_address: { ...shipping, country_code: 'us' },
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
      if (isSquareEnabled) {
        const card = cardRef.current
        if (!card) {
          setFormError('The card form is still loading. Please wait a moment.')
          return
        }
        let token: string
        try {
          token = await tokenizeSquareCard(card)
        } catch (err) {
          setFormError((err as Error).message)
          return
        }
        const result = await placeSquareOrder(checkout, shippingOptionId, token)
        if (result.ok) router.push(`/order/confirmed/${result.orderId}`)
        else setFormError(result.error)
      } else {
        const result = await placeOrder(checkout, shippingOptionId)
        if (result.ok) router.push(`/order/confirmed/${result.orderId}`)
        else setFormError(result.error)
      }
    })
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
            {field('postal_code', 'ZIP code')}
          </div>
          <div className="mt-4">{field('phone', 'Phone')}</div>
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
                    {opt.amount_usd === 0 ? 'Free' : formatUsd(opt.amount_usd)}
                  </span>
                </label>
              ))}
            </div>
          )}
        </section>

        {isSquareEnabled ? (
          <section>
            <h2 className="mb-3 font-semibold">Payment</h2>
            <div
              id="card-container"
              className="rounded border border-neutral-300 p-3"
            />
            <p className="mt-2 text-xs text-neutral-400">
              Card details are processed securely by Square.
            </p>
          </section>
        ) : null}
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
              <span className="tabular-nums">{formatUsd(line.total_usd)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-neutral-200 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Subtotal</dt>
            <dd className="tabular-nums">{formatUsd(cart.totals.subtotal_usd)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Shipping</dt>
            <dd className="tabular-nums">
              {selectedShipping
                ? selectedShipping.amount_usd === 0
                  ? 'Free'
                  : formatUsd(selectedShipping.amount_usd)
                : '—'}
            </dd>
          </div>
          <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatUsd(estimatedTotal)}</dd>
          </div>
          <p className="text-xs text-neutral-400">
            Sales tax calculated at checkout.
          </p>
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
            : isSquareEnabled
              ? 'Pay now'
              : 'Place order'}
        </button>
        <p className="mt-2 text-center text-xs text-neutral-400">
          {isSquareEnabled
            ? 'Secure payment via Square.'
            : 'Test checkout — manual payment (set Square keys to enable live payments).'}
        </p>
      </aside>
    </form>
  )
}
