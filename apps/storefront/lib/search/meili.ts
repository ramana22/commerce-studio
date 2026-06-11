/**
 * Client-side Meilisearch search (Phase 13). Queries Meilisearch directly from
 * the browser with a search-only key for instant, typo-tolerant, faceted
 * results. Returns empty when not configured so the overlay can fall back to
 * the Medusa search action.
 */
const HOST = process.env.NEXT_PUBLIC_MEILISEARCH_HOST?.replace(/\/$/, '')
const KEY = process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY

export const meiliEnabled = Boolean(HOST && KEY)

export interface SearchHit {
  id: string
  handle: string
  title: string
  thumbnail: string | null
  price_usd: number
  from_price: boolean
  genre_handles: string[]
}

export type PriceBucket = 'lt10' | '10to20' | 'gt20'
export type SortOption = 'relevance' | 'price_asc' | 'price_desc'

export interface SearchParams {
  genres?: string[]
  price?: PriceBucket | null
  inStock?: boolean
  sort?: SortOption
}

export interface SearchResult {
  hits: SearchHit[]
  genreFacets: Record<string, number>
  total: number
  tookMs: number
}

const EMPTY: SearchResult = { hits: [], genreFacets: {}, total: 0, tookMs: 0 }

function buildFilter(p: SearchParams): string[] {
  const f: string[] = []
  if (p.genres?.length) {
    f.push(`genre_handles IN [${p.genres.map((g) => `"${g}"`).join(', ')}]`)
  }
  if (p.price === 'lt10') f.push('price_usd < 10')
  else if (p.price === '10to20') f.push('price_usd >= 10 AND price_usd <= 20')
  else if (p.price === 'gt20') f.push('price_usd > 20')
  if (p.inStock) f.push('in_stock = true')
  return f
}

function buildSort(sort?: SortOption): string[] | undefined {
  if (sort === 'price_asc') return ['price_usd:asc']
  if (sort === 'price_desc') return ['price_usd:desc']
  return undefined
}

export async function meiliSearch(
  q: string,
  params: SearchParams = {},
): Promise<SearchResult> {
  if (!meiliEnabled) return EMPTY
  try {
    const filter = buildFilter(params)
    const res = await fetch(`${HOST}/indexes/products/search`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q,
        limit: 12,
        facets: ['genre_handles'],
        ...(filter.length ? { filter } : {}),
        ...(buildSort(params.sort) ? { sort: buildSort(params.sort) } : {}),
      }),
    })
    if (!res.ok) return EMPTY
    const data = (await res.json()) as {
      hits?: SearchHit[]
      facetDistribution?: { genre_handles?: Record<string, number> }
      estimatedTotalHits?: number
      processingTimeMs?: number
    }
    return {
      hits: data.hits ?? [],
      genreFacets: data.facetDistribution?.genre_handles ?? {},
      total: data.estimatedTotalHits ?? 0,
      tookMs: data.processingTimeMs ?? 0,
    }
  } catch {
    return EMPTY
  }
}
