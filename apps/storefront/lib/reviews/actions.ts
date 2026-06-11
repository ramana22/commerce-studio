'use server'

import { revalidateTag } from 'next/cache'
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from '../medusa/config'
import { captureError } from '../observability/capture'

const headers = {
  'Content-Type': 'application/json',
  'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
}

export type SubmitReviewResult =
  | { ok: true; message: string }
  | { ok: false; error: string }

export interface ReviewSubmission {
  product_id: string
  email: string
  author_name: string
  rating: number
  title?: string
  content: string
  /** base64-encoded, client-resized images. */
  images?: Array<{ filename: string; mimeType: string; data: string }>
}

/** Submit a review through the Medusa store API (verified-purchaser gated). */
export async function submitReview(
  input: ReviewSubmission,
): Promise<SubmitReviewResult> {
  try {
    // 1. Upload any photos first, collecting their public URLs.
    let imageUrls: string[] = []
    if (input.images && input.images.length > 0) {
      const up = await fetch(`${MEDUSA_BACKEND_URL}/store/uploads`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ files: input.images }),
      })
      if (up.ok) {
        const data = (await up.json()) as { urls?: string[] }
        imageUrls = data.urls ?? []
      }
    }

    // 2. Create the review.
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/reviews`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        product_id: input.product_id,
        email: input.email,
        author_name: input.author_name,
        rating: input.rating,
        title: input.title,
        content: input.content,
        images: imageUrls,
      }),
    })
    const data = (await res.json()) as { message?: string }
    if (!res.ok) {
      return { ok: false, error: data.message ?? 'Could not submit your review.' }
    }

    revalidateTag(`reviews:${input.product_id}`)
    return {
      ok: true,
      message: data.message ?? 'Thanks! Your review will appear once approved.',
    }
  } catch (err) {
    await captureError(err, { scope: 'submitReview', product_id: input.product_id })
    return { ok: false, error: 'Something went wrong. Please try again.' }
  }
}
