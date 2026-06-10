import { cn } from '@/lib/utils/cn'

/** Fractional 5-star display. Presentational — pass a 0–5 `rating`. */
export function Stars({
  rating,
  className,
}: {
  rating: number
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center', className)} aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, rating - i))
        return (
          <span key={i} className="relative leading-none">
            <span className="text-neutral-300">★</span>
            <span
              className="absolute inset-0 overflow-hidden text-pink-600"
              style={{ width: `${fill * 100}%` }}
            >
              ★
            </span>
          </span>
        )
      })}
    </span>
  )
}
