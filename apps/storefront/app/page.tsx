import type { Metadata } from 'next'
import { getHomepage } from '@/lib/sanity/queries'
import { getProductCards } from '@/lib/catalog/product-service'
import { BlockRenderer } from '@/components/blocks/block-renderer'
import { ProductGrid } from '@/components/product/product-grid'

export async function generateMetadata(): Promise<Metadata> {
  const homepage = await getHomepage()
  if (!homepage?.seo) return {}
  return {
    title: homepage.seo.metaTitle,
    description: homepage.seo.metaDescription,
  }
}

export default async function HomePage() {
  const homepage = await getHomepage()

  if (homepage?.blocks?.length) {
    return <BlockRenderer blocks={homepage.blocks} />
  }

  // Fallback when Sanity has no homepage configured yet.
  const products = await getProductCards({ limit: 12 })
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Shop SUGAR</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Configure the homepage in Sanity Studio to replace this default grid.
      </p>
      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </main>
  )
}
