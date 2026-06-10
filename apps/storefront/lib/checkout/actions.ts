'use server'

import { revalidatePath } from 'next/cache'
import { CheckoutSchema, type CheckoutInput } from '@sugar-store/validators/checkout'
import { sdk } from '../medusa/client'
import { getCartId, clearCartId } from '../cart/cookies'
import { CART_FIELDS, toCartView, type CartView } from '../cart/cart-service'

/** Manual payment provider seeded by `backend:seed`. */
const MANUAL_PAYMENT_PROVIDER = 'pp_system_default'

/** Result of attempting to place an order. */
export type PlaceOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

/** Select a shipping method and return the cart with refreshed totals. */
export async function setShippingMethod(optionId: string): Promise<CartView> {
  const cartId = await getCartId()
  if (!cartId) throw new Error('No active cart')
  await sdk.store.cart.addShippingMethod(cartId, { option_id: optionId })
  const { cart } = await sdk.store.cart.retrieve(cartId, { fields: CART_FIELDS })
  revalidatePath('/checkout')
  return toCartView(cart)
}

/**
 * Validate the checkout form, attach contact + address details, ensure a
 * shipping method and payment session exist, then complete the cart into an
 * order. Payment uses Medusa's manual provider — real Razorpay arrives in
 * Phase 9.
 */
export async function placeOrder(
  input: CheckoutInput,
  shippingOptionId: string,
): Promise<PlaceOrderResult> {
  const parsed = CheckoutSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Please correct the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    }
  }
  const data = parsed.data

  const cartId = await getCartId()
  if (!cartId) return { ok: false, error: 'Your cart has expired.' }

  if (!shippingOptionId) {
    return { ok: false, error: 'Please choose a delivery option.' }
  }

  const shipping = data.shipping_address
  const billing = data.billing_same_as_shipping
    ? data.shipping_address
    : (data.billing_address ?? data.shipping_address)

  try {
    // 1. Contact + addresses
    await sdk.store.cart.update(cartId, {
      email: data.email,
      shipping_address: shipping,
      billing_address: billing,
    })

    // 2. Shipping method (idempotent — replaces any prior selection)
    await sdk.store.cart.addShippingMethod(cartId, {
      option_id: shippingOptionId,
    })

    // 3. Payment session against the manual provider
    await sdk.store.payment.initiatePaymentSession(
      // retrieve a fresh cart object for the payment collection
      (await sdk.store.cart.retrieve(cartId, { fields: CART_FIELDS })).cart,
      { provider_id: MANUAL_PAYMENT_PROVIDER },
    )

    // 4. Complete → order
    const result = await sdk.store.cart.complete(cartId)
    if (result.type !== 'order') {
      return {
        ok: false,
        error:
          (result as { error?: { message?: string } }).error?.message ??
          'We could not complete your order. Please try again.',
      }
    }

    await clearCartId()
    revalidatePath('/cart')
    return { ok: true, orderId: result.order.id }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}
