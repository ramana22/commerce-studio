import imageUrlBuilder from '@sanity/image-url'
import { sanityClient } from './client'
import type { SanityImage } from './types'

const builder = imageUrlBuilder(sanityClient)

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
