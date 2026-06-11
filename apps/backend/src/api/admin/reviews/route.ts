import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { REVIEW_MODULE } from '../../../modules/review'

interface ReviewService {
  listAndCountReviews(
    filters: Record<string, unknown>,
    config?: { take?: number; skip?: number; order?: Record<string, 'ASC' | 'DESC'> },
  ): Promise<[unknown[], number]>
}

/** GET /admin/reviews?status=pending — moderation queue. */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const status = req.query.status as string | undefined
  const limit = Number(req.query.limit ?? 50)
  const offset = Number(req.query.offset ?? 0)

  const service = req.scope.resolve(REVIEW_MODULE) as ReviewService
  const filters = status ? { status } : {}
  const [reviews, count] = await service.listAndCountReviews(filters, {
    take: limit,
    skip: offset,
    order: { created_at: 'DESC' },
  })

  res.json({ reviews, count, limit, offset })
}
