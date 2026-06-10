import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { REVIEW_MODULE } from '../../../../modules/review'
import { recalcProductRating } from '../../../../lib/reviews'

interface ReviewService {
  retrieveReview(id: string): Promise<{ id: string; product_id: string }>
  updateReviews(data: { id: string; status?: string }): Promise<unknown>
  deleteReviews(id: string): Promise<unknown>
}

/** POST /admin/reviews/:id — moderate a review (approve / reject). */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const id = req.params.id as string
  const { status } = (req.body ?? {}) as { status?: string }

  if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
    res.status(400).json({ message: "status must be 'approved', 'rejected' or 'pending'." })
    return
  }

  const service = req.scope.resolve(REVIEW_MODULE) as ReviewService
  const review = await service.retrieveReview(id)
  await service.updateReviews({ id, status })

  // Keep the product's denormalised aggregate rating in sync.
  const aggregate = await recalcProductRating(req.scope, review.product_id)

  res.json({ id, status, aggregate })
}

/** DELETE /admin/reviews/:id — remove a review and refresh the aggregate. */
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const id = req.params.id as string
  const service = req.scope.resolve(REVIEW_MODULE) as ReviewService
  const review = await service.retrieveReview(id)
  await service.deleteReviews(id)
  await recalcProductRating(req.scope, review.product_id)
  res.json({ id, deleted: true })
}
