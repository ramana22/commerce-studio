import Link from 'next/link'
import type { ProductCard as ProductCardData } from '@sugar-store/types'
import type { ProductCarouselBlock } from '@/lib/sanity/types'
import { ProductCard } from '@/components/product/product-card'
import { CarouselRail } from '@/components/ui/carousel-rail'
import { Reveal } from '@/components/motion/reveal'

export function ProductCarousel({
  block,
  products,
}: {
  block: ProductCarouselBlock
  products: ProductCardData[]
}) {
  if (products.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <Reveal>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">{block.heading}</h2>
            {block.subheading ? (
              <p className="mt-1 text-sm text-neutral-500">{block.subheading}</p>
            ) : null}
          </div>
          {block.viewAllHref ? (
            <Link
              href={block.viewAllHref}
              className="shrink-0 text-sm font-semibold text-pink-600 underline-offset-4 hover:underline"
            >
              View all
            </Link>
          ) : null}
        </div>
      </Reveal>

      <CarouselRail>
        {products.map((p) => (
          <li key={p.id} className="w-44 shrink-0 snap-start sm:w-56">
            <ProductCard product={p} />
          </li>
        ))}
      </CarouselRail>
    </section>
  )
}
