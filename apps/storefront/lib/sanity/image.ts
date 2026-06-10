import imageUrlBuilder from '@sanity/image-url'
import { SANITY_DATASET, SANITY_PROJECT_ID } from './config'
import type { SanityImage } from './types'

// Built from a plain config (not the full client) so client components can
// resolve image URLs without bundling @sanity/client.
const builder = imageUrlBuilder({
  projectId: SANITY_PROJECT_ID || 'placeholder',
  dataset: SANITY_DATASET,
})

/**
 * Build a CDN URL for a Sanity image, or `null` when the image (or its asset)
 * is missing. Width/height are optional; callers pass what they need.
 */
export function urlForImage(
  source: SanityImage | null | undefined,
  opts?: { width?: number; height?: number; quality?: number },
): string | null {
  if (!source?.asset?._ref) return null
  let img = builder.image(source).auto('format').fit('max')
  if (opts?.width) img = img.width(opts.width)
  if (opts?.height) img = img.height(opts.height)
  if (opts?.quality) img = img.quality(opts.quality)
  return img.url()
}
