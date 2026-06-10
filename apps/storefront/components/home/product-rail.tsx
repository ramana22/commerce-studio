import Link from 'next/link'
import type { ProductCard as ProductCardData } from '@sugar-store/types'
import { Reveal } from '@/components/motion/reveal'
import { CarouselRail } from '@/components/ui/carousel-rail'
import { ProductCard } from '@/components/product/product-card'

/**
 * A titled, horizontally-scrolling product rail used on the home page
 * (Bestsellers, New Launches, etc.). Renders nothing when empty so sections
 * gracefully disappear if a category has no products yet.
 */
export function ProductRail({
  eyebrow,
  title,
  products,
  viewAllHref,
}: {
  eyebrow?: string
  title: string
  products: ProductCardData[]
  viewAllHref?: string
}) {
  if (products.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <Reveal className="mb-7 flex items-end justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-600">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-1.5 font-display text-3xl font-semibold text-brand-ink sm:text-4xl">
            {title}
          </h2>
        </div>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="group hidden shrink-0 items-center gap-1 text-sm font-semibold text-brand-ink hover:text-pink-600 sm:inline-flex"
          >
            View all
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        ) : null}
      </Reveal>

      <CarouselRail>
        {products.map((p) => (
          <li key={p.id} className="w-[220px] shrink-0 snap-start sm:w-[250px]">
            <ProductCard product={p} />
          </li>
        ))}
      </CarouselRail>
    </section>
  )
}
