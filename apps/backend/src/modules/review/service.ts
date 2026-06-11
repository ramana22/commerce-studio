import { MedusaService } from '@medusajs/framework/utils'
import { Review } from './models/review'

/**
 * Generated CRUD for reviews: createReviews / listReviews / updateReviews /
 * deleteReviews / listAndCountReviews, etc.
 */
class ReviewModuleService extends MedusaService({ Review }) {}

export default ReviewModuleService
