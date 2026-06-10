import type { ReactNode } from 'react'
import type { ProductCard as ProductCardData } from '@sugar-store/types'
import type {
  HeroCarouselBlock,
  HomepageBlock,
  ProductCarouselBlock,
} from '@/lib/sanity/types'
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
import { HeroCarousel, type Slide } from '@/components/home/hero-carousel'
import { ValueProps } from '@/components/home/value-props'
import { Marquee } from '@/components/home/marquee'
import { BrandStory } from '@/components/home/brand-story'
import { Newsletter } from '@/components/home/newsletter'

/** Map a Sanity heroCarousel block to the HeroCarousel's slide props. */
function toSlides(block: HeroCarouselBlock): Slide[] {
  return (block.slides ?? []).map((s) => ({
    eyebrow: s.eyebrow ?? '',
    title: s.title,
    highlight: s.highlight ?? '',
    subtitle: s.subtitle ?? '',
    ctaLabel: s.ctaLabel ?? 'Shop now',
    ctaHref: s.ctaHref ?? '/bestsellers',
    accent: [s.bgColor ?? '#1A1310', s.accentColor ?? '#B5571F'],
    liquid: s.liquidColor ?? '#C9692F',
  }))
}

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
    case 'heroCarousel':
      return <HeroCarousel key={block._key} slides={toSlides(block)} />
    case 'valueProps':
      return (
        <ValueProps
          key={block._key}
          items={(block.items ?? []).map((i) => ({
            title: i.title,
            body: i.body ?? '',
            icon: i.icon ?? 'leaf',
          }))}
        />
      )
    case 'marqueeStrip':
      return <Marquee key={block._key} items={block.items} />
    case 'brandStory':
      return (
        <BrandStory
          key={block._key}
          data={{
            eyebrow: block.eyebrow,
            heading: block.heading,
            highlight: block.highlight,
            body: block.body,
            artWord: block.artWord,
            stats: block.stats,
            ctaLabel: block.ctaLabel,
            ctaHref: block.ctaHref,
          }}
        />
      )
    case 'newsletter':
      return (
        <Newsletter
          key={block._key}
          data={{
            eyebrow: block.eyebrow,
            heading: block.heading,
            highlight: block.highlight,
            subtitle: block.subtitle,
            placeholder: block.placeholder,
            buttonLabel: block.buttonLabel,
            successText: block.successText,
          }}
        />
      )
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
