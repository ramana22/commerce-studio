import { model } from '@medusajs/framework/utils'

/**
 * A product review. Lives in its own module so review data is owned alongside
 * the product (referenced by `product_id`). Submissions start `pending` and
 * only surface on the storefront once an admin approves them.
 */
export const Review = model.define('review', {
  id: model.id().primaryKey(),
  product_id: model.text().index(),
  customer_id: model.text().nullable(),
  email: model.text(),
  author_name: model.text(),
  rating: model.number(),
  title: model.text().nullable(),
  content: model.text(),
  images: model.json().nullable(),
  status: model
    .enum(['pending', 'approved', 'rejected'])
    .default('pending'),
  verified: model.boolean().default(false),
})
