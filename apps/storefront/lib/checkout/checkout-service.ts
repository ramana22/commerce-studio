import 'server-only'
import { sdk } from '../medusa/client'
import { paiseToInr } from '../medusa/money'

/** A shipping option the customer can pick during checkout. */
export interface ShippingOptionView {
  id: string
  name: string
  amount_inr: number
}

/**
 * List the shipping options available for a cart, sorted cheapest first.
 * Returns an empty list if the fulfillment lookup fails.
 */
export async function getShippingOptions(
  cartId: string,
): Promise<ShippingOptionView[]> {
  try {
    const { shipping_options } = await sdk.store.fulfillment.listCartOptions({
      cart_id: cartId,
    })
    return (shipping_options ?? [])
      .map((o) => ({
        id: o.id,
        name: o.name,
        amount_inr: paiseToInr((o as { amount?: number }).amount),
      }))
      .sort((a, b) => a.amount_inr - b.amount_inr)
  } catch {
    return []
  }
}
