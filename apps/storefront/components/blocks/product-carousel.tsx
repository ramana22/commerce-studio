import Link from 'next/link'
import type { ProductCard as ProductCardData } from '@sugar-store/types'
import type { ProductCarouselBlock } from '@/lib/sanity/types'
import { ProductCard } from '@/components/product/product-card'

export function ProductCarousel({
  block,
  products,
}: {
  block: ProductCarouselBlock
  products: ProductCardData[]
}) {
  if (products.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{block.heading}</h2>
          {block.subheading ? (
            <p className="text-sm text-neutral-500">{block.subheading}</p>
          ) : null}
        </div>
        {block.viewAllHref ? (
          <Link
            href={block.viewAllHref}
            className="shrink-0 text-sm font-medium underline underline-offset-4"
          >
            View all
          </Link>
        ) : null}
      </div>

      <ul className="flex snap-x gap-4 overflow-x-auto pb-3">
        {products.map((p) => (
          <li key={p.id} className="w-44 shrink-0 snap-start sm:w-52">
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  )
}
