import { sanityFetch } from './client'
import type {
  AnnouncementBar,
  CartUpsells,
  CategoryBanner,
  Homepage,
} from './types'

// Shared GROQ fragment that resolves a responsiveVideo's file URLs.
const VIDEO = `{
  "desktopUrl": desktop.asset->url,
  "mobileUrl": mobile.asset->url,
  poster
}`

const HOMEPAGE_QUERY = `*[_type == "homepage"][0]{
  title,
  blocks[]{
    _type,
    _key,
    _type == "heroVideo" => {
      heading, subheading, textColor, cta,
      video ${VIDEO}
    },
    _type == "categoryTiles" => {
      heading,
      tiles[]{ label, href, badge, image }
    },
    _type == "productCarousel" => {
      heading, subheading, source, categoryHandle, limit, viewAllHref,
      products[]{ handle, label }
    },
    _type == "reelCarousel" => {
      heading,
      reels[]{ caption, product, video ${VIDEO} }
    },
    _type == "offerBanner" => {
      text, backgroundColor, countdownTo, cta, backgroundImage
    }
  },
  seo
}`

const ANNOUNCEMENT_QUERY = `*[_type == "announcementBar"][0]{
  enabled, messages[]{ text, href }, rotateIntervalMs, backgroundColor, textColor
}`

const CATEGORY_BANNER_QUERY = `*[_type == "categoryBanner" && categoryHandle == $handle][0]{
  categoryHandle, heading, subheading, mediaType, image, cta,
  video ${VIDEO}
}`

const CART_UPSELLS_QUERY = `*[_type == "cartUpsells"][0]{
  enabled, heading, products[]{ handle, label }
}`

export function getHomepage(): Promise<Homepage | null> {
  return sanityFetch<Homepage>(HOMEPAGE_QUERY)
}

export function getAnnouncementBar(): Promise<AnnouncementBar | null> {
  return sanityFetch<AnnouncementBar>(ANNOUNCEMENT_QUERY)
}

export function getCategoryBanner(
  handle: string,
): Promise<CategoryBanner | null> {
  return sanityFetch<CategoryBanner>(CATEGORY_BANNER_QUERY, { handle })
}

export function getCartUpsells(): Promise<CartUpsells | null> {
  return sanityFetch<CartUpsells>(CART_UPSELLS_QUERY)
}
