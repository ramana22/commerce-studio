import type { HttpTypes } from '@medusajs/types'
import type { CartLine, CartTotals, OrderSummary } from '@sugar-store/types'
import { centsToUsd } from './money'

/** Map Medusa cart line items into the storefront's `CartLine` shape. */
export function mapCartLines(cart: HttpTypes.StoreCart): CartLine[] {
  return (cart.items ?? []).map((item) => {
    const variantMeta = (item.variant?.metadata ?? {}) as Record<string, unknown>
    return {
      id: item.id,
      variant_id: item.variant_id ?? '',
      product_id: item.product_id ?? '',
      title: item.product_title ?? item.title ?? '',
      thumbnail: item.thumbnail ?? null,
      shade_name: item.variant_title ?? null,
      shade_hex:
        typeof variantMeta.shade_hex === 'string' ? variantMeta.shade_hex : null,
      quantity: item.quantity,
      unit_price_usd: centsToUsd(item.unit_price),
      total_usd: centsToUsd(item.total ?? item.unit_price * item.quantity),
    }
  })
}

/** Aggregate a Medusa cart's money lines into display-ready USD totals. */
export function mapCartTotals(cart: HttpTypes.StoreCart): CartTotals {
  const item_count = (cart.items ?? []).reduce((n, i) => n + i.quantity, 0)
  return {
    subtotal_usd: centsToUsd(cart.item_subtotal ?? cart.subtotal),
    shipping_usd: centsToUsd(cart.shipping_total),
    tax_usd: centsToUsd(cart.tax_total),
    discount_usd: centsToUsd(cart.discount_total),
    total_usd: centsToUsd(cart.total),
    item_count,
  }
}

/** Map a completed Medusa order into the confirmation-page summary. */
export function mapOrderSummary(order: HttpTypes.StoreOrder): OrderSummary {
  const item_count = (order.items ?? []).reduce((n, i) => n + i.quantity, 0)
  return {
    id: order.id,
    display_id: order.display_id ?? 0,
    status: order.status ?? 'pending',
    created_at:
      typeof order.created_at === 'string'
        ? order.created_at
        : new Date(order.created_at ?? Date.now()).toISOString(),
    total_usd: centsToUsd(order.total),
    item_count,
    email: order.email ?? '',
  }
}
