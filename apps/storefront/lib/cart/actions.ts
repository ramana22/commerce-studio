'use server'

import { revalidatePath } from 'next/cache'
import { sdk } from '../medusa/client'
import { STORE_CURRENCY } from '../medusa/config'
import { getCartId, setCartId } from './cookies'
import { CART_FIELDS, toCartView, type CartView } from './cart-service'

/** Resolve the region the cart should transact in (USD / United States). */
async function resolveRegionId(): Promise<string> {
  const { regions } = await sdk.store.region.list()
  const region =
    regions.find((r) => r.currency_code === STORE_CURRENCY) ?? regions[0]
  if (!region) {
    throw new Error('No region configured in Medusa — run `pnpm backend:seed`.')
  }
  return region.id
}

/** Return the existing cart id, or create a fresh cart and persist its id. */
async function getOrCreateCartId(): Promise<string> {
  const existing = await getCartId()
  if (existing) {
    try {
      const { cart } = await sdk.store.cart.retrieve(existing)
      if (cart && !cart.completed_at) return cart.id
    } catch {
      // fall through and create a new cart
    }
  }
  const region_id = await resolveRegionId()
  const { cart } = await sdk.store.cart.create({ region_id })
  await setCartId(cart.id)
  return cart.id
}

/** Re-fetch a cart with the full field set and map it for the UI. */
async function fetchView(cartId: string): Promise<CartView> {
  const { cart } = await sdk.store.cart.retrieve(cartId, { fields: CART_FIELDS })
  return toCartView(cart)
}

/** Add a variant to the cart, creating the cart on first add. */
export async function addToCart(
  variantId: string,
  quantity = 1,
): Promise<CartView> {
  const cartId = await getOrCreateCartId()
  await sdk.store.cart.createLineItem(cartId, {
    variant_id: variantId,
    quantity,
  })
  const view = await fetchView(cartId)
  revalidatePath('/cart')
  return view
}

/** Set a line item's quantity; quantities ≤ 0 remove the line. */
export async function updateLineItem(
  lineId: string,
  quantity: number,
): Promise<CartView> {
  const cartId = await getCartId()
  if (!cartId) throw new Error('No active cart')

  if (quantity <= 0) {
    await sdk.store.cart.deleteLineItem(cartId, lineId)
  } else {
    await sdk.store.cart.updateLineItem(cartId, lineId, { quantity })
  }
  const view = await fetchView(cartId)
  revalidatePath('/cart')
  return view
}

/** Remove a line item from the cart. */
export async function removeLineItem(lineId: string): Promise<CartView> {
  const cartId = await getCartId()
  if (!cartId) throw new Error('No active cart')
  await sdk.store.cart.deleteLineItem(cartId, lineId)
  const view = await fetchView(cartId)
  revalidatePath('/cart')
  return view
}
