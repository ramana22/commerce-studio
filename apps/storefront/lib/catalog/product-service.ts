import 'server-only'
import { sdk } from '../medusa/client'
import { STORE_CURRENCY } from '../medusa/config'
import { paiseToInr } from '../medusa/money'

/**
 * Minimal product shape for the Phase 5 demo grid. Phase 7 replaces this with
 * the full catalog (listing pages, PDP, Sanity-driven merchandising).
 */
export interface DemoProduct {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  /** Default (first) variant — what the demo "Add to bag" button adds. */
  variantId: string | null
  price_inr: number
}

export async function getDemoProducts(limit = 12): Promise<DemoProduct[]> {
  try {
    const { regions } = await sdk.store.region.list()
    const region =
      regions.find((r) => r.currency_code === STORE_CURRENCY) ?? regions[0]
    if (!region) return []

    const { products } = await sdk.store.product.list({
      region_id: region.id,
      fields:
        'id,title,handle,thumbnail,metadata,*variants,*variants.calculated_price',
      limit,
    })

    return products.map((p) => {
      const variant = p.variants?.[0]
      const amount = variant?.calculated_price?.calculated_amount ?? 0
      const meta = (p.metadata ?? {}) as Record<string, unknown>
      const mainImage =
        typeof meta.main_image === 'string' ? meta.main_image : null
      return {
        id: p.id,
        title: p.title,
        handle: p.handle ?? '',
        thumbnail: p.thumbnail ?? mainImage,
        variantId: variant?.id ?? null,
        price_inr: paiseToInr(amount),
      }
    })
  } catch {
    return []
  }
}
