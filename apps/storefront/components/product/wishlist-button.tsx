'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils/cn'

/**
 * Lightweight wishlist heart with a springy toggle. Local-only for now (no
 * persistence) — it exists to make the catalog feel alive and interactive.
 */
export function WishlistButton({ label }: { label: string }) {
  const [saved, setSaved] = useState(false)

  return (
    <motion.button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${label} from wishlist` : `Save ${label} to wishlist`}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setSaved((s) => !s)
      }}
      whileTap={{ scale: 0.8 }}
      className={cn(
        'absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full',
        'bg-white/80 text-brand-ink backdrop-blur transition-colors',
        'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
        saved && 'opacity-100',
      )}
    >
      <motion.svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        initial={false}
        animate={{ scale: saved ? [1, 1.35, 1] : 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        fill={saved ? '#0E7C5A' : 'none'}
        stroke={saved ? '#0E7C5A' : 'currentColor'}
        strokeWidth={1.8}
      >
        <path d="M12 21s-7.5-4.6-9.7-9.1C.9 9 2 6 4.8 5.2 6.9 4.6 9 5.6 12 8.3c3-2.7 5.1-3.7 7.2-3.1C22 6 23.1 9 21.7 11.9 19.5 16.4 12 21 12 21z" />
      </motion.svg>
    </motion.button>
  )
}
