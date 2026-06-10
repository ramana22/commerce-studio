import type { ReactNode } from 'react'
import type { ProductCard as ProductCardData } from '@sugar-store/types'
import type { HomepageBlock, ProductCarouselBlock } from '@/lib/sanity/types'
import {
  getProductCards,
  getProductsByCategory,
  getProductsByHandles,
} from '@/lib/catalog/product-service'
import { HeroVideo } from './hero-video'
import { CategoryTiles } from './category-tiles'
import { ProductCarousel } from './product-carousel'
import { ReelCarousel } from './reel-carousel'
import { OfferBanner } from './offer-banner'

/** Resolve the Medusa products a carousel should display. */
async function resolveCarousel(
  block: ProductCarouselBlock,
): Promise<ProductCardData[]> {
  const limit = block.limit ?? 12
  switch (block.source) {
    case 'manual':
      return getProductsByHandles((block.products ?? []).map((p) => p.handle))
    case 'category':
      return block.categoryHandle
        ? getProductsByCategory(block.categoryHandle, limit)
        : []
    case 'bestsellers':
      return getProductCards({ limit, bestsellersOnly: true })
    case 'new':
      return getProductCards({ limit, newLaunchesOnly: true })
    default:
      return []
  }
}

async function renderBlock(block: HomepageBlock): Promise<ReactNode> {
  switch (block._type) {
    case 'heroVideo':
      return <HeroVideo key={block._key} block={block} />
    case 'categoryTiles':
      return <CategoryTiles key={block._key} block={block} />
    case 'productCarousel': {
      const products = await resolveCarousel(block)
      return (
        <ProductCarousel key={block._key} block={block} products={products} />
      )
    }
    case 'reelCarousel':
      return <ReelCarousel key={block._key} block={block} />
    case 'offerBanner':
      return <OfferBanner key={block._key} block={block} />
    default:
      return null
  }
}

/** Render a homepage's blocks in order, resolving any dynamic product data. */
export async function BlockRenderer({ blocks }: { blocks: HomepageBlock[] }) {
  const rendered = await Promise.all(blocks.map(renderBlock))
  return <>{rendered}</>
}
