/** A selectable shade/variant on the product detail page. */
export interface ProductDetailVariant {
  id: string
  title: string
  shade_name: string | null
  shade_hex: string | null
  sku: string | null
  price_usd: number
  msrp_usd: number | null
  in_stock: boolean
}

/** Full product used by the PDP. Cards use `ProductCard` from `@sugar-store/types`. */
export interface ProductDetail {
  id: string
  handle: string
  title: string
  description: string | null
  thumbnail: string | null
  images: string[]
  badge: string | null
  is_new_launch: boolean
  is_bestseller: boolean
  review_count: number | null
  /** Denormalised aggregate rating (0–5) from approved reviews, or null. */
  rating_average: number | null
  rating_count: number | null
  /** Default (first) variant price. */
  price_usd: number
  msrp_usd: number | null
  variants: ProductDetailVariant[]
  /** Raw `metadata.category` — see ProductCard.category in @sugar-store/types. */
  category: string | null
}
