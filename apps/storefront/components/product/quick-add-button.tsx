'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useCart } from '@/components/cart/cart-context'
import { cn } from '@/lib/utils/cn'

type AddVariant = 'pill' | 'block'

/**
 * Add-to-bag control for product cards. Two looks:
 *  - `pill`  — compact floating capsule, used over the product image.
 *  - `block` — full-width bar (the SUGAR-style "ADD TO BAG" card CTA).
 *
 * Either way it swallows clicks (cards wrap the media in a <Link>) and morphs
 * briefly into a check once the item is queued. Renders nothing when the
 * product has no resolvable variant.
 */
export function QuickAddButton({
  variantId,
  title,
  className,
  variant = 'pill',
  label = 'Quick add',
}: {
  variantId?: string | null
  title: string
  className?: string
  variant?: AddVariant
  label?: string
}) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  if (!variantId) return null

  const isBlock = variant === 'block'

  return (
    <motion.button
      type="button"
      whileTap={{ scale: isBlock ? 0.985 : 0.94 }}
      aria-label={`Add ${title} to bag`}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        addItem(variantId)
        setAdded(true)
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => setAdded(false), 1800)
      }}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 font-semibold uppercase transition-colors duration-300',
        isBlock
          ? 'h-11 w-full rounded-xl text-[11px] tracking-[0.16em]'
          : 'pointer-events-auto h-10 rounded-full px-4 text-xs tracking-[0.14em] backdrop-blur',
        added
          ? 'bg-pink-600 text-white'
          : isBlock
            ? 'bg-brand-ink text-white hover:bg-pink-600'
            : 'bg-brand-ink/90 text-white hover:bg-pink-600',
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {added ? (
          <motion.span
            key="added"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-1.5"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12.5l5 5L20 6.5" />
            </svg>
            Added
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-1.5"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
