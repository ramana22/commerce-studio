import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import {
  searchEnabled,
  toSearchDoc,
  indexProducts,
  deleteProductDoc,
  type IndexableProduct,
} from '../lib/search'
import { captureError } from '../lib/observability'

type Log = { info(m: string): void; warn(m: string): void; debug(m: string): void }
type Query = {
  graph(config: {
    entity: string
    filters?: Record<string, unknown>
    fields: string[]
  }): Promise<{ data: IndexableProduct[] }>
}

const PRODUCT_FIELDS = [
  'id',
  'handle',
  'title',
  'description',
  'thumbnail',
  'status',
  'metadata',
  'variants.manage_inventory',
  'variants.prices.amount',
  'variants.prices.currency_code',
  'categories.name',
  'categories.handle',
]

/**
 * Keep the Meilisearch index in sync with the catalog. On create/update we
 * (re)index published products and remove unpublished ones; on delete we drop
 * the document. No-ops when search isn't configured.
 */
export default async function productSearchIndexHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>): Promise<void> {
  if (!searchEnabled()) return
  const logger = container.resolve<Log>(ContainerRegistrationKeys.LOGGER)
  const id = event.data.id

  try {
    if (event.name === 'product.deleted') {
      await deleteProductDoc(id)
      logger.debug(`[search] removed product ${id} from index`)
      return
    }

    const query = container.resolve<Query>(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: 'product',
      filters: { id },
      fields: PRODUCT_FIELDS,
    })
    const product = data[0]

    if (!product || product.status !== 'published') {
      await deleteProductDoc(id)
      return
    }
    await indexProducts([toSearchDoc(product)])
    logger.debug(`[search] indexed product ${product.handle ?? id}`)
  } catch (err) {
    logger.warn(`[search] indexing failed for ${id} — ${(err as Error).message}`)
    await captureError(err, { scope: 'subscriber/product-search-index', product_id: id })
  }
}

export const config: SubscriberConfig = {
  event: ['product.created', 'product.updated', 'product.deleted'],
}
