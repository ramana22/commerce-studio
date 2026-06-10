/**
 * Resolve a media reference to a usable URL.
 *
 * The catalog stores image references as R2 object paths/filenames in product
 * metadata (`main_image`, `gallery_images`). This prefixes them with the public
 * media base URL. Absolute URLs are returned unchanged.
 */
const MEDIA_BASE = (
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? ''
).replace(/\/$/, '')

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (/^https?:\/\//.test(path)) return path
  if (!MEDIA_BASE) return null
  return `${MEDIA_BASE}/${path.replace(/^\//, '')}`
}
