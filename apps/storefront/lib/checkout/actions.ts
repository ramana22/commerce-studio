'use server'

import { revalidatePath } from 'next/cache'
import { CheckoutSchema, type CheckoutInput } from '@sugar-store/validators/checkout'
import { sdk } from '../medusa/client'
import { getCartId, clearCartId } from '../cart/cookies'
import { CART_FIELDS, toCartView, type CartView } from '../cart/cart-service'
import {
  MANUAL_PROVIDER_ID,
  RAZORPAY_PROVIDER_ID,
  isRazorpayEnabled,
  type RazorpaySessionData,
} from './payment'

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

/** Apply contact details, addresses, and the chosen shipping method. */
async function applyContactAndShipping(
  cartId: string,
  data: CheckoutInput,
  shippingOptionId: string,
): Promise<void> {
  const shipping = data.shipping_address
  const billing = data.billing_same_as_shipping
    ? data.shipping_address
    : (data.billing_address ?? data.shipping_address)

  await sdk.store.cart.update(cartId, {
    email: data.email,
    shipping_address: shipping,
    billing_address: billing,
  })
  await sdk.store.cart.addShippingMethod(cartId, { option_id: shippingOptionId })
}

/**
 * Manual checkout (test/dev): set details, create a manual payment session, and
 * complete the cart into an order in a single step.
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
  const cartId = await getCartId()
  if (!cartId) return { ok: false, error: 'Your cart has expired.' }
  if (!shippingOptionId) {
    return { ok: false, error: 'Please choose a delivery option.' }
  }

  try {
    await applyContactAndShipping(cartId, parsed.data, shippingOptionId)

    const { cart } = await sdk.store.cart.retrieve(cartId, {
      fields: CART_FIELDS,
    })
    await sdk.store.payment.initiatePaymentSession(cart, {
      provider_id: MANUAL_PROVIDER_ID,
    })

    return completeCart(cartId)
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

/**
 * Razorpay step 1 — set details and initiate a Razorpay payment session.
 * Returns the data the client needs to open Razorpay Checkout.
 */
export async function startRazorpayPayment(
  input: CheckoutInput,
  shippingOptionId: string,
): Promise<
  | { ok: true; data: RazorpaySessionData }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
> {
  if (!isRazorpayEnabled) {
    return { ok: false, error: 'Razorpay is not configured.' }
  }
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
  const cartId = await getCartId()
  if (!cartId) return { ok: false, error: 'Your cart has expired.' }
  if (!shippingOptionId) {
    return { ok: false, error: 'Please choose a delivery option.' }
  }

  try {
    await applyContactAndShipping(cartId, parsed.data, shippingOptionId)

    const { cart } = await sdk.store.cart.retrieve(cartId, {
      fields: CART_FIELDS,
    })
    const { payment_collection } =
      await sdk.store.payment.initiatePaymentSession(cart, {
        provider_id: RAZORPAY_PROVIDER_ID,
      })

    const session = payment_collection.payment_sessions?.find(
      (s) => s.provider_id === RAZORPAY_PROVIDER_ID,
    )
    const data = session?.data as Partial<RazorpaySessionData> | undefined
    if (!data?.razorpay_order_id || !data.key_id) {
      return { ok: false, error: 'Could not start the Razorpay payment.' }
    }

    return {
      ok: true,
      data: {
        razorpay_order_id: data.razorpay_order_id,
        key_id: data.key_id,
        amount: Number(data.amount ?? 0),
      },
    }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

/**
 * Razorpay step 2 — complete the cart after the customer has paid. The provider
 * authorizes the payment by verifying its status with Razorpay server-side.
 */
export async function finalizeOrder(): Promise<PlaceOrderResult> {
  const cartId = await getCartId()
  if (!cartId) return { ok: false, error: 'Your cart has expired.' }
  return completeCart(cartId)
}

/** Complete a cart into an order and clear the cart cookie on success. */
async function completeCart(cartId: string): Promise<PlaceOrderResult> {
  try {
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
