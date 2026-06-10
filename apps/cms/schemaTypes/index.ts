import type { SchemaTypeDefinition } from 'sanity'

// Reusable objects
import { cta } from './objects/cta'
import { seo } from './objects/seo'
import { productRef } from './objects/productRef'
import { responsiveVideo } from './objects/responsiveVideo'

// Homepage content blocks
import { heroVideo } from './blocks/heroVideo'
import { categoryTiles } from './blocks/categoryTiles'
import { productCarousel } from './blocks/productCarousel'
import { reelCarousel } from './blocks/reelCarousel'
import { offerBanner } from './blocks/offerBanner'

// Documents
import { homepage } from './documents/homepage'
import { announcementBar } from './documents/announcementBar'
import { categoryBanner } from './documents/categoryBanner'
import { cartUpsells } from './documents/cartUpsells'

/** Singleton documents — exactly one instance, created on first edit. */
export const SINGLETON_TYPES = ['homepage', 'announcementBar', 'cartUpsells'] as const

export const schemaTypes: SchemaTypeDefinition[] = [
  // objects
  cta,
  seo,
  productRef,
  responsiveVideo,
  // blocks
  heroVideo,
  categoryTiles,
  productCarousel,
  reelCarousel,
  offerBanner,
  // documents
  homepage,
  announcementBar,
  categoryBanner,
  cartUpsells,
]
