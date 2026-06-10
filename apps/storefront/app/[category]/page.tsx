import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { findNavCategory } from '@/lib/catalog/nav'
import { getProductsByCategory } from '@/lib/catalog/product-service'
import { getCategoryBanner } from '@/lib/sanity/queries'
import { ProductGrid } from '@/components/product/product-grid'
import { CategoryHero } from '@/components/category/category-hero'

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
      {banner ? <CategoryHero banner={banner} /> : null}
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-semibold">
          {banner?.heading ?? nav.label}
        </h1>
        <ProductGrid products={products} />
      </div>
    </main>
  )
}
