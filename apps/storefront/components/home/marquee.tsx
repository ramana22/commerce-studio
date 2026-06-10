/**
 * Infinite scrolling marquee strip. Pure CSS (animate-marquee) — the content is
 * duplicated so the -50% translate loops seamlessly.
 */
const DEFAULT_ITEMS = [
  'Alcohol-Free Oils',
  '12-Hour Wear',
  'Cruelty-Free',
  'Free Shipping over $50',
  'Inspired by the Icons',
  'Skin-Safe Formulas',
]

export function Marquee({
  items = DEFAULT_ITEMS,
  className = '',
}: {
  items?: string[]
  className?: string
}) {
  const row = [...items, ...items]
  return (
    <div className={`overflow-hidden border-y border-brand-ink/10 bg-brand-ink py-3.5 text-white ${className}`}>
      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap will-change-transform">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-10 text-sm font-medium uppercase tracking-[0.18em]">
            {item}
            <span className="text-pink-500">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
