import 'server-only'
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from '../medusa/config'

export interface Review {
  id: string
  author_name: string
  rating: number
  title: string | null
  content: string
  images: string[]
  created_at: string
}

export interface ReviewAggregate {
  average: number
  count: number
  distribution: Record<string, number>
}

export interface ProductReviews {
  aggregate: ReviewAggregate
  reviews: Review[]
}

const headers = {
  'Content-Type': 'application/json',
  'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
}

/** Fetch approved reviews + aggregate for a product from the Medusa store API. */
export async function getProductReviews(
  productId: string,
): Promise<ProductReviews> {
  const empty: ProductReviews = {
    aggregate: { average: 0, count: 0, distribution: {} },
    reviews: [],
  }
  try {
    const res = await fetch(
      `${MEDUSA_BACKEND_URL}/store/reviews?product_id=${encodeURIComponent(productId)}`,
      { headers, next: { revalidate: 60, tags: [`reviews:${productId}`] } },
    )
    if (!res.ok) return empty
    return (await res.json()) as ProductReviews
  } catch {
    return empty
  }
}
