import 'server-only'
import type { HttpTypes } from '@medusajs/types'
import type { ProductCard } from '@sugar-store/types'
import { sdk } from '../medusa/client'
import { STORE_CURRENCY } from '../medusa/config'
import { mapProductToCard, mapProductToDetail } from './mappers'
import type { ProductDetail } from './types'

/** Fields requested for catalog reads so the mappers have prices + metadata. */
const PRODUCT_FIELDS = [
  'id',
  'title',
  'handle',
  'description',
  'thumbnail',
  'metadata',
  '*images',
  '*variants',
  '*variants.calculated_price',
  '*variants.options',
  '*options',
  '*categories',
].join(',')

let cachedRegionId: string | null = null

/** Resolve (and memoize) the INR region id for price calculation. */
async function regionId(): Promise<string | null> {
  if (cachedRegionId) return cachedRegionId
  try {
    const { regions } = await sdk.store.region.list()
    const region =
      regions.find((r) => r.currency_code === STORE_CURRENCY) ?? regions[0]
    cachedRegionId = region?.id ?? null
    return cachedRegionId
  } catch {
    return null
  }
}

/** Fetch a single product by handle for the PDP. */
export async function getProductByHandle(
  handle: string,
): Promise<ProductDetail | null> {
  const region_id = await regionId()
  if (!region_id) return null
  try {
    const { products } = await sdk.store.product.list({
      handle,
      region_id,
      fields: PRODUCT_FIELDS,
      limit: 1,
    })
    const product = products[0]
    return product ? mapProductToDetail(product) : null
  } catch {
    return null
  }
}

/** Resolve a category id from its handle. */
async function categoryId(handle: string): Promise<string | null> {
  try {
    const { product_categories } = await sdk.store.category.list({
      handle,
      limit: 1,
    })
    return product_categories[0]?.id ?? null
  } catch {
    return null
  }
}

/** List product cards in a category. */
export async function getProductsByCategory(
  categoryHandle: string,
  limit = 24,
): Promise<ProductCard[]> {
  const region_id = await regionId()
  if (!region_id) return []
  const catId = await categoryId(categoryHandle)
  if (!catId) return []
  try {
    const { products } = await sdk.store.product.list({
      category_id: catId,
      region_id,
      fields: PRODUCT_FIELDS,
      limit,
    })
    return products.map(mapProductToCard)
  } catch {
    return []
  }
}

/** List product cards for a set of handles, preserving the requested order. */
export async function getProductsByHandles(
  handles: string[],
): Promise<ProductCard[]> {
  const region_id = await regionId()
  if (!region_id || handles.length === 0) return []
  try {
    const { products } = await sdk.store.product.list({
      handle: handles,
      region_id,
      fields: PRODUCT_FIELDS,
      limit: handles.length,
    })
    const byHandle = new Map(
      products.map((p: HttpTypes.StoreProduct) => [p.handle, p]),
    )
    return handles
      .map((h) => byHandle.get(h))
      .filter((p): p is HttpTypes.StoreProduct => Boolean(p))
      .map(mapProductToCard)
  } catch {
    return []
  }
}

interface ListOptions {
  limit?: number
  bestsellersOnly?: boolean
  newLaunchesOnly?: boolean
}

/** List product cards, optionally filtered to bestsellers or new launches. */
export async function getProductCards(
  opts: ListOptions = {},
): Promise<ProductCard[]> {
  const region_id = await regionId()
  if (!region_id) return []
  const { limit = 12, bestsellersOnly, newLaunchesOnly } = opts
  try {
    // Over-fetch when filtering by metadata, then trim to the limit.
    const fetchLimit = bestsellersOnly || newLaunchesOnly ? 100 : limit
    const { products } = await sdk.store.product.list({
      region_id,
      fields: PRODUCT_FIELDS,
      limit: fetchLimit,
    })
    let cards = products.map(mapProductToCard)
    if (bestsellersOnly) cards = cards.filter((c) => c.is_bestseller)
    if (newLaunchesOnly) cards = cards.filter((c) => c.is_new_launch)
    return cards.slice(0, limit)
  } catch {
    return []
  }
}
