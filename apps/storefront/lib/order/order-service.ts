import 'server-only'
import type { OrderSummary } from '@sugar-store/types'
import { sdk } from '../medusa/client'
import { mapOrderSummary } from '../medusa/mappers'

/** Retrieve a placed order for the confirmation page, or `null` if not found. */
export async function getOrder(orderId: string): Promise<OrderSummary | null> {
  try {
    const { order } = await sdk.store.order.retrieve(orderId, {
      fields: '*items,*shipping_address,*shipping_methods',
    })
    if (!order) return null
    return mapOrderSummary(order)
  } catch {
    return null
  }
}
