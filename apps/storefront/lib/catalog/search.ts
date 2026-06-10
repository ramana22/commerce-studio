'use server'

import type { ProductCard } from '@sugar-store/types'
import { searchProductCards } from './product-service'

/**
 * Server action for the header search overlay. Wraps the server-only product
 * service so client components can query the catalog without exposing the SDK.
 */
export async function searchAction(query: string): Promise<ProductCard[]> {
  return searchProductCards(query, 8)
}
