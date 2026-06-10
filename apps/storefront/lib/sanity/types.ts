/** Types matching the GROQ projections in `queries.ts` (Phase 6 schemas). */

export interface SanityImage {
  asset?: { _ref: string; _type?: string }
  hotspot?: { x: number; y: number }
  alt?: string
}

export interface Cta {
  label: string
  href: string
  style?: 'primary' | 'secondary' | 'link'
}

/** A `responsiveVideo` with file URLs resolved and the poster left as an image. */
export interface ResolvedVideo {
  desktopUrl: string | null
  mobileUrl: string | null
  poster: SanityImage | null
}

export interface Seo {
  metaTitle?: string
  metaDescription?: string
  ogImage?: SanityImage
}

export interface ProductRef {
  handle: string
  label?: string
}

// ── Homepage blocks ────────────────────────────────────────────────────────

export interface HeroVideoBlock {
  _type: 'heroVideo'
  _key: string
  heading: string
  subheading?: string
  textColor?: 'light' | 'dark'
  cta?: Cta
  video: ResolvedVideo
}

export interface CategoryTile {
  label: string
  href: string
  badge?: string
  image: SanityImage
}

export interface CategoryTilesBlock {
  _type: 'categoryTiles'
  _key: string
  heading?: string
  tiles: CategoryTile[]
}

export interface ProductCarouselBlock {
  _type: 'productCarousel'
  _key: string
  heading: string
  subheading?: string
  source: 'manual' | 'category' | 'bestsellers' | 'new'
  categoryHandle?: string
  limit?: number
  viewAllHref?: string
  products?: ProductRef[]
}

export interface Reel {
  caption?: string
  product?: ProductRef
  video: ResolvedVideo
}

export interface ReelCarouselBlock {
  _type: 'reelCarousel'
  _key: string
  heading: string
  reels: Reel[]
}

export interface OfferBannerBlock {
  _type: 'offerBanner'
  _key: string
  text: string
  backgroundColor?: string
  countdownTo?: string
  cta?: Cta
  backgroundImage?: SanityImage
}

export type HomepageBlock =
  | HeroVideoBlock
  | CategoryTilesBlock
  | ProductCarouselBlock
  | ReelCarouselBlock
  | OfferBannerBlock

export interface Homepage {
  title: string
  blocks: HomepageBlock[]
  seo?: Seo
}

// ── Standalone documents ───────────────────────────────────────────────────

export interface AnnouncementBar {
  enabled: boolean
  messages: { text: string; href?: string }[]
  rotateIntervalMs?: number
  backgroundColor?: string
  textColor?: string
}

export interface CategoryBanner {
  categoryHandle: string
  heading: string
  subheading?: string
  mediaType?: 'image' | 'video'
  image?: SanityImage
  video?: ResolvedVideo
  cta?: Cta
}

export interface CartUpsells {
  enabled: boolean
  heading: string
  products: ProductRef[]
}
