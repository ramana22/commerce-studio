'use client'

import { useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * Horizontal, snap-scrolling rail with prev/next controls (shown on larger
 * screens) and native touch scrolling on mobile.
 */
export function CarouselRail({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLUListElement>(null)

  const scroll = (dir: 1 | -1) => {
    const el = ref.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <div className="group/rail relative">
      <ul
        ref={ref}
        className={cn(
          'no-scrollbar flex snap-x scroll-px-4 gap-4 overflow-x-auto pb-3',
          className,
        )}
      >
        {children}
      </ul>

      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scroll(-1)}
        className="absolute -left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-lg shadow-card transition hover:bg-neutral-50 md:flex"
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scroll(1)}
        className="absolute -right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-lg shadow-card transition hover:bg-neutral-50 md:flex"
      >
        ›
      </button>
    </div>
  )
}
