import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllProductCards } from '@/lib/catalog/product-service'
import { CategoryIntro } from '@/components/category/category-intro'
import { ProductCard } from '@/components/product/product-card'

export const metadata: Metadata = { title: 'Shop All' }

const PAGE_SIZE = 48

export default async function ShopAllPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const { products, count } = await getAllProductCards(page, PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  return (
    <main>
      <CategoryIntro
        heading="Shop All"
        tagline="Every product we carry, in one place."
        count={count}
        noun="product"
      />
      <div className="mx-auto max-w-7xl px-6 pb-16">
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4 pt-8 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {totalPages > 1 ? (
              <nav className="mt-10 flex items-center justify-center gap-3">
                {page > 1 ? (
                  <Link
                    href={`/shop?page=${page - 1}`}
                    className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-brand-ink transition-colors hover:border-pink-500 hover:text-pink-600"
                  >
                    ← Previous
                  </Link>
                ) : null}
                <span className="text-sm text-neutral-500">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages ? (
                  <Link
                    href={`/shop?page=${page + 1}`}
                    className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-brand-ink transition-colors hover:border-pink-500 hover:text-pink-600"
                  >
                    Next →
                  </Link>
                ) : null}
              </nav>
            ) : null}
          </>
        ) : (
          <div className="py-24 text-center text-neutral-500">No products found.</div>
        )}
      </div>
    </main>
  )
}
