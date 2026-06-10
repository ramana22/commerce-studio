import 'server-only'
import { sdk } from '../medusa/client'
import { centsToUsd } from '../medusa/money'

/** A shipping option the customer can pick during checkout. */
export interface ShippingOptionView {
  id: string
  name: string
  amount_usd: number
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
        amount_usd: centsToUsd((o as { amount?: number }).amount),
      }))
      .sort((a, b) => a.amount_usd - b.amount_usd)
  } catch {
    return []
  }
}
