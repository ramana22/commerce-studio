import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudflare R2 public bucket — configured in Phase 3
      { protocol: 'https', hostname: 'media.sugarcosmetics.com' },
    ],
  },
}

export default config
