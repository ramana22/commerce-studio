import type { Metadata } from 'next'
import { getHomepage } from '@/lib/sanity/queries'
import {
  getProductCards,
  getProductsByCategory,
} from '@/lib/catalog/product-service'
import { BlockRenderer } from '@/components/blocks/block-renderer'
import { HeroCarousel } from '@/components/home/hero-carousel'
import { Marquee } from '@/components/home/marquee'
import { ValueProps } from '@/components/home/value-props'
import { CategoryShowcase } from '@/components/home/category-showcase'
import { ProductRail } from '@/components/home/product-rail'
import { BrandStory } from '@/components/home/brand-story'
import { Newsletter } from '@/components/home/newsletter'

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

  // Sanity-configured homepage wins when present.
  if (homepage?.blocks?.length) {
    return <BlockRenderer blocks={homepage.blocks} />
  }

  // Rich default landing, built from live Medusa products. Rails are driven by
  // the perfume categories so the home stays on-theme; if none are populated
  // yet (e.g. before re-seeding) we fall back to a general "featured" rail.
  const [bestsellers, forHer, forHim] = await Promise.all([
    getProductsByCategory('bestsellers', 12),
    getProductsByCategory('for-her', 12),
    getProductsByCategory('for-him', 12),
  ])
  const hasCategoryData =
    bestsellers.length > 0 || forHer.length > 0 || forHim.length > 0
  const featured = hasCategoryData ? [] : await getProductCards({ limit: 12 })

  return (
    <main>
      <HeroCarousel />
      <Marquee />
      <ValueProps />
      <CategoryShowcase />
      <ProductRail
        eyebrow="Most loved"
        title="Bestsellers"
        products={bestsellers}
        viewAllHref="/bestsellers"
      />
      <ProductRail
        eyebrow="Featured"
        title="Shop the Collection"
        products={featured}
      />
      <ProductRail
        eyebrow="For Her"
        title="Floral & Gourmand"
        products={forHer}
        viewAllHref="/for-her"
      />
      <BrandStory />
      <ProductRail
        eyebrow="For Him"
        title="Woody & Aquatic"
        products={forHim}
        viewAllHref="/for-him"
      />
      <Newsletter />
    </main>
  )
}
