export const WIDTHS = [400, 800, 1200] as const
export type Width = (typeof WIDTHS)[number]

export const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tiff'])

export interface SizeSet {
  /** Filename within data/media-processed/, or a full R2 URL after upload */
  avif: string
  webp: string
}

export interface AssetEntry {
  sizes: {
    '400w': SizeSet
    '800w': SizeSet
    '1200w': SizeSet
  }
  originalBytes: number
  processedBytes: number
  /** true once upload-r2 has run and updated this entry */
  uploaded: boolean
}

export interface MediaManifest {
  version: 1
  generatedAt: string
  /** Cloudflare R2 public base URL, empty string until upload-r2 runs */
  r2BaseUrl: string
  totals: {
    sourceImages: number
    processedFiles: number
    originalKb: number
    processedKb: number
    reductionPct: string
  }
  /** key = original filename (e.g. "product-01.jpg") */
  assets: Record<string, AssetEntry>
}
