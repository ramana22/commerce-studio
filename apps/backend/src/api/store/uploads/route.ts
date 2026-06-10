import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { uploadFilesWorkflow } from '@medusajs/medusa/core-flows'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const MAX_FILES = 6
// Base64 of a resized image — clients downscale before upload, so this is small.
const MAX_BYTES = 3 * 1024 * 1024

/**
 * POST /store/uploads — store review photos through Medusa's File module and
 * return their public URLs. The File module is local by default and targets
 * Cloudflare R2 when `@medusajs/file-s3` is configured (the same media bucket),
 * so review photos follow the same storage path as the catalog.
 *
 * Body: { files: [{ filename, mimeType, data (base64) }] }
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const body = (req.body ?? {}) as {
    files?: Array<{ filename?: string; mimeType?: string; data?: string }>
  }
  const incoming = (body.files ?? []).slice(0, MAX_FILES)
  if (incoming.length === 0) {
    res.status(400).json({ message: 'No files provided.' })
    return
  }

  const files = []
  for (const f of incoming) {
    if (!f.data || !f.mimeType || !ALLOWED.includes(f.mimeType)) {
      res.status(400).json({ message: 'Only JPEG, PNG, WebP or AVIF images are allowed.' })
      return
    }
    const buffer = Buffer.from(f.data, 'base64')
    if (buffer.byteLength > MAX_BYTES) {
      res.status(400).json({ message: 'Each image must be under 3 MB.' })
      return
    }
    files.push({
      filename: f.filename || `review-${Date.now()}.jpg`,
      mimeType: f.mimeType,
      content: buffer.toString('binary'),
      access: 'public' as const,
    })
  }

  const { result } = await uploadFilesWorkflow(req.scope).run({
    input: { files },
  })

  res.json({ urls: (result as Array<{ url: string }>).map((file) => file.url) })
}
