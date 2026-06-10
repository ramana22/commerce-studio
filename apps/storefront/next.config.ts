import type { NextConfig } from 'next'

/** Allow the configured media host (R2) for next/image, when set. */
function mediaPattern() {
  const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL
  if (!base) return []
  try {
    return [{ protocol: 'https' as const, hostname: new URL(base).hostname }]
  } catch {
    return []
  }
}

const config: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Sanity image CDN
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      // Cloudflare R2 default public domain
      { protocol: 'https', hostname: 'media.sugarcosmetics.com' },
      // Configured media host (when different from the default)
      ...mediaPattern(),
    ],
  },
  experimental: {
    optimizePackageImports: ['motion'],
  },
}

export default config
