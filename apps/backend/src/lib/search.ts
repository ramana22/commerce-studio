/**
 * Meilisearch indexing layer (Phase 13). Talks to Meilisearch over its REST API
 * with the master/admin key — no SDK dependency. No-ops when search isn't
 * configured, so the backend boots fine without it.
 */
const HOST = process.env.MEILISEARCH_HOST?.replace(/\/$/, '')
const KEY = process.env.MEILISEARCH_MASTER_KEY
export const SEARCH_INDEX = 'products'

export function searchEnabled(): boolean {
  return Boolean(HOST && KEY)
}

async function meili(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown,
): Promise<Response> {
  return fetch(`${HOST}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

/** Searchable document shape pushed to Meilisearch. */
export interface ProductSearchDoc {
  id: string
  handle: string
  title: string
  description: string
  thumbnail: string | null
  price_usd: number
  from_price: boolean
  genres: string[]
  genre_handles: string[]
  is_bestseller: boolean
  is_new_launch: boolean
  rating_average: number
  rating_count: number
  in_stock: boolean
}

/** Source product shape (from query.graph) used to build a search doc. */
export interface IndexableProduct {
  id: string
  handle: string | null
  title: string
  description: string | null
  thumbnail: string | null
  status: string
  metadata: Record<string, unknown> | null
  variants?: Array<{
    manage_inventory?: boolean
    prices?: Array<{ amount: number; currency_code: string }>
  }>
  categories?: Array<{ name: string; handle: string }>
}

export function toSearchDoc(p: IndexableProduct): ProductSearchDoc {
  const variants = p.variants ?? []
  const usdPrices = variants
    .flatMap((v) => v.prices ?? [])
    .filter((pr) => pr.currency_code?.toLowerCase() === 'usd')
    .map((pr) => Number(pr.amount))
  const minCents = usdPrices.length ? Math.min(...usdPrices) : 0
  const m = p.metadata ?? {}
  const categories = p.categories ?? []

  return {
    id: p.id,
    handle: p.handle ?? '',
    title: p.title,
    description: p.description ?? '',
    thumbnail: p.thumbnail ?? null,
    price_usd: Math.round(minCents) / 100,
    from_price: variants.length > 1,
    genres: categories.map((c) => c.name),
    genre_handles: categories.map((c) => c.handle),
    is_bestseller: m.is_bestseller === true,
    is_new_launch: m.is_new_launch === true,
    rating_average: typeof m.rating_average === 'number' ? m.rating_average : 0,
    rating_count: typeof m.rating_count === 'number' ? m.rating_count : 0,
    // Demo variants are manage_inventory:false (always purchasable). Treat a
    // product as in stock unless every variant manages inventory and is out.
    in_stock: variants.length === 0 || variants.some((v) => v.manage_inventory === false),
  }
}

/** Create the index (idempotent) and apply search settings. */
export async function configureIndex(): Promise<void> {
  if (!searchEnabled()) return
  // Create index — ignore 409/already-exists.
  await meili('/indexes', 'POST', { uid: SEARCH_INDEX, primaryKey: 'id' }).catch(
    () => undefined,
  )
  await meili(`/indexes/${SEARCH_INDEX}/settings`, 'PATCH', {
    searchableAttributes: ['title', 'genres', 'description'],
    filterableAttributes: [
      'genre_handles',
      'price_usd',
      'is_bestseller',
      'is_new_launch',
      'in_stock',
    ],
    sortableAttributes: ['price_usd', 'rating_average'],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
      'rating_average:desc',
    ],
  })
}

export async function indexProducts(docs: ProductSearchDoc[]): Promise<void> {
  if (!searchEnabled() || docs.length === 0) return
  await meili(`/indexes/${SEARCH_INDEX}/documents`, 'POST', docs)
}

export async function deleteProductDoc(id: string): Promise<void> {
  if (!searchEnabled()) return
  await meili(`/indexes/${SEARCH_INDEX}/documents/${id}`, 'DELETE')
}
