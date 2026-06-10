import 'server-only'
import type { HttpTypes } from '@medusajs/types'
import type { CartLine, CartTotals } from '@sugar-store/types'
import { sdk } from '../medusa/client'
import { mapCartLines, mapCartTotals } from '../medusa/mappers'
import { getCartId } from './cookies'

/** Fields requested on every cart retrieval so mappers have what they need. */
export const CART_FIELDS = [
  '*items',
  '*items.variant',
  '*items.product',
  '*items.variant.metadata',
  '*shipping_address',
  '*billing_address',
  '*shipping_methods',
  '*payment_collection',
].join(',')

/** Display-ready cart consumed by server components and the cart context. */
export interface CartView {
  id: string
  email: string | null
  lines: CartLine[]
  totals: CartTotals
}

/** Build a `CartView` from a raw Medusa cart. */
export function toCartView(cart: HttpTypes.StoreCart): CartView {
  return {
    id: cart.id,
    email: cart.email ?? null,
    lines: mapCartLines(cart),
    totals: mapCartTotals(cart),
  }
}

/**
 * Retrieve the active cart for the current visitor, or `null` when there is no
 * cart cookie or the referenced cart no longer exists / is already completed.
 * Safe to call during render — it never mutates cookies.
 */
export async function getCart(): Promise<CartView | null> {
  const id = await getCartId()
  if (!id) return null
  try {
    const { cart } = await sdk.store.cart.retrieve(id, { fields: CART_FIELDS })
    if (!cart || cart.completed_at) return null
    return toCartView(cart)
  } catch {
    return null
  }
}
