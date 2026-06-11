import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { findNavCategory } from '@/lib/catalog/nav'
import { getProductsByCategory } from '@/lib/catalog/product-service'
import { getCategoryBanner } from '@/lib/sanity/queries'
import { FilteredProducts } from '@/components/plp/filtered-products'
import { CategoryHero } from '@/components/category/category-hero'
import { CategoryIntro } from '@/components/category/category-intro'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params
  const nav = findNavCategory(category)
  return { title: nav?.label ?? 'Shop' }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const nav = findNavCategory(category)
  if (!nav) notFound()

  const [products, banner] = await Promise.all([
    getProductsByCategory(nav.handle, 48),
    getCategoryBanner(nav.handle),
  ])

  return (
    <main>
      {banner ? (
        <CategoryHero banner={banner} />
      ) : (
        <CategoryIntro
          heading={nav.label}
          tagline={nav.tagline}
          count={products.length}
          accent={nav.accent}
        />
      )}
      <div className="mx-auto max-w-7xl px-6 pb-16">
        <FilteredProducts products={products} />
      </div>
    </main>
  )
}
