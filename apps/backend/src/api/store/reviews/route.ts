import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { REVIEW_MODULE } from '../../../modules/review'
import { hasPurchased } from '../../../lib/reviews'

interface ReviewRecord {
  id: string
  product_id: string
  author_name: string
  rating: number
  title: string | null
  content: string
  images: string[] | null
  created_at: string
}
interface ReviewService {
  listReviews(
    filters: Record<string, unknown>,
    config?: { order?: Record<string, 'ASC' | 'DESC'> },
  ): Promise<ReviewRecord[]>
  createReviews(data: Record<string, unknown>): Promise<ReviewRecord>
}

/** GET /store/reviews?product_id=… — approved reviews + aggregate for a product. */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const productId = req.query.product_id as string | undefined
  if (!productId) {
    res.status(400).json({ message: 'product_id is required' })
    return
  }

  const service = req.scope.resolve(REVIEW_MODULE) as ReviewService
  const reviews = await service.listReviews(
    { product_id: productId, status: 'approved' },
    { order: { created_at: 'DESC' } },
  )

  const count = reviews.length
  const average = count
    ? Math.round((reviews.reduce((s, r) => s + Number(r.rating), 0) / count) * 10) / 10
    : 0
  const distribution = [1, 2, 3, 4, 5].reduce<Record<number, number>>((acc, n) => {
    acc[n] = reviews.filter((r) => Math.round(r.rating) === n).length
    return acc
  }, {})

  res.json({
    aggregate: { average, count, distribution },
    reviews: reviews.map((r) => ({
      id: r.id,
      author_name: r.author_name,
      rating: r.rating,
      title: r.title,
      content: r.content,
      images: r.images ?? [],
      created_at: r.created_at,
    })),
  })
}

/** POST /store/reviews — submit a review (verified purchasers only). */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const body = (req.body ?? {}) as {
    product_id?: string
    email?: string
    author_name?: string
    rating?: number
    title?: string
    content?: string
    images?: string[]
  }

  const productId = body.product_id?.trim()
  const email = body.email?.trim().toLowerCase()
  const rating = Number(body.rating)
  const content = body.content?.trim()
  const authorName = body.author_name?.trim() || 'Anonymous'

  if (!productId || !email || !content || !(rating >= 1 && rating <= 5)) {
    res.status(400).json({
      message: 'product_id, email, a rating of 1–5, and content are required.',
    })
    return
  }

  // Gate to verified purchasers.
  const purchased = await hasPurchased(req.scope, email, productId)
  if (!purchased) {
    res.status(403).json({
      message: 'Only verified purchasers of this product can leave a review.',
    })
    return
  }

  const service = req.scope.resolve(REVIEW_MODULE) as ReviewService
  const review = await service.createReviews({
    product_id: productId,
    email,
    author_name: authorName,
    rating: Math.round(rating),
    title: body.title?.trim() || null,
    content,
    images: Array.isArray(body.images) ? body.images.slice(0, 6) : null,
    status: 'pending',
    verified: true,
  })

  res.status(201).json({
    id: review.id,
    status: 'pending',
    message: 'Thanks! Your review will appear once it has been approved.',
  })
}
