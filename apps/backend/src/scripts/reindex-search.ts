import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import type { MedusaContainer } from '@medusajs/framework/types'
import {
  searchEnabled,
  configureIndex,
  indexProducts,
  toSearchDoc,
  type IndexableProduct,
} from '../lib/search'

/**
 * Bulk (re)build the Meilisearch product index. Configures the index settings,
 * then pushes every published product. Run after standing up Meilisearch:
 *
 *   pnpm --filter @sugar-store/backend exec medusa exec ./src/scripts/reindex-search.ts
 */
export default async function reindexSearch({
  container,
}: {
  container: MedusaContainer
}): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  if (!searchEnabled()) {
    logger.warn(
      '[reindex] MEILISEARCH_HOST / MEILISEARCH_MASTER_KEY not set — skipping.',
    )
    return
  }

  await configureIndex()
  logger.info('[reindex] index configured')

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = (await query.graph({
    entity: 'product',
    filters: { status: 'published' },
    fields: [
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
    ],
    pagination: { take: 1000 },
  })) as { data: IndexableProduct[] }

  const docs = data.map(toSearchDoc)
  // Push in batches to keep request bodies modest.
  const BATCH = 200
  for (let i = 0; i < docs.length; i += BATCH) {
    await indexProducts(docs.slice(i, i + BATCH))
  }

  logger.info(`[reindex] queued ${docs.length} products for indexing`)
}
