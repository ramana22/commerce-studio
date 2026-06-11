import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { REVIEW_MODULE } from '../modules/review'

interface ReviewRow {
  rating: number
}
interface ReviewService {
  listReviews(filters: Record<string, unknown>): Promise<ReviewRow[]>
}
interface ProductService {
  retrieveProduct(
    id: string,
    config?: { select?: string[] },
  ): Promise<{ id: string; metadata?: Record<string, unknown> | null }>
  updateProducts(
    id: string,
    update: { metadata: Record<string, unknown> },
  ): Promise<unknown>
}

/**
 * True when `email` has an order containing `productId` — the gate for
 * "verified purchaser" review submission.
 */
export async function hasPurchased(
  container: MedusaContainer,
  email: string,
  productId: string,
): Promise<boolean> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: 'order',
    fields: ['id', 'email', 'items.product_id'],
    filters: { email },
  })
  return (data as Array<{ items?: Array<{ product_id?: string }> }>).some((o) =>
    (o.items ?? []).some((it) => it.product_id === productId),
  )
}

/**
 * Recompute a product's aggregate rating from its approved reviews and
 * denormalise it onto the product's metadata, so cards, the PDP, and the
 * JSON-LD all read a single up-to-date value without N extra queries.
 */
export async function recalcProductRating(
  container: MedusaContainer,
  productId: string,
): Promise<{ average: number; count: number }> {
  const reviewService = container.resolve(REVIEW_MODULE) as ReviewService
  const approved = await reviewService.listReviews({
    product_id: productId,
    status: 'approved',
  })
  const count = approved.length
  const average = count
    ? Math.round((approved.reduce((s, r) => s + Number(r.rating), 0) / count) * 10) / 10
    : 0

  const productService = container.resolve(Modules.PRODUCT) as ProductService
  const product = await productService.retrieveProduct(productId, {
    select: ['id', 'metadata'],
  })
  await productService.updateProducts(productId, {
    metadata: {
      ...(product.metadata ?? {}),
      rating_average: average,
      rating_count: count,
    },
  })
  return { average, count }
}
