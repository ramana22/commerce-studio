import { createClient } from '@sanity/client'

export const SANITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? ''
export const SANITY_DATASET =
  process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
const API_VERSION = '2024-01-01'

/**
 * Shared read-only Sanity client. CDN-cached for fast public reads.
 *
 * A placeholder projectId keeps `createClient` from throwing when Sanity is not
 * configured; `sanityFetch` and `urlForImage` both guard on the real id, so no
 * requests are ever made against the placeholder.
 */
export const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID || 'placeholder',
  dataset: SANITY_DATASET,
  apiVersion: API_VERSION,
  useCdn: true,
  perspective: 'published',
})

/**
 * Typed GROQ fetch with ISR revalidation. Returns `null` when Sanity is not
 * configured or the request fails, so the storefront degrades gracefully
 * instead of crashing when content is unavailable.
 */
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  revalidate = 60,
): Promise<T | null> {
  if (!SANITY_PROJECT_ID) return null
  try {
    return await sanityClient.fetch<T>(query, params, {
      next: { revalidate },
    })
  } catch {
    return null
  }
}
