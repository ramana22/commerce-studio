'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const MESSAGES = [
  'FREE shipping on all orders over $50',
  'GET 15% OFF your first order — code: SCENT15',
  'New: alcohol-free roll-ons from $8',
  'Build-your-own trio — mix any 3 oils',
]

/**
 * Default top promo bar shown when Sanity has no announcement configured. Rotates
 * through a few marketing messages with a vertical flip.
 */
export function PromoBar() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex((p) => (p + 1) % MESSAGES.length), 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative overflow-hidden bg-brand-ink py-2 text-center text-[13px] font-medium tracking-wide text-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {MESSAGES[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
