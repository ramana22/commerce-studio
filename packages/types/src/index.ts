// Shared domain types — used by storefront, backend, and import scripts.

/** Sugar-specific metadata stored in Medusa product `metadata` field. */
export interface SugarProductMeta {
  category: string
  subcategory: string | null
  is_new_launch: boolean
  is_bestseller: boolean
  badge: string | null
  review_count: number | null
  main_image: string
  hover_image: string | null
  gallery_images: string[]
}

/** Sugar-specific metadata stored in Medusa variant `metadata` field. */
export interface SugarVariantMeta {
  shade_hex: string | null
  media_filename: string
  hover_image: string | null
}

/** Shade swatch used in product cards and PDP shade selectors. */
export interface SugarShade {
  name: string
  hex: string
  sku: string
  in_stock: boolean
}

/**
 * Lightweight product card — what the storefront renders in
 * grid/listing/search views. Derived from Medusa product + metadata.
 */
export interface ProductCard {
  id: string
  handle: string
  title: string
  thumbnail: string | null
  hover_image: string | null
  badge: string | null
  is_new_launch: boolean
  is_bestseller: boolean
  /** Selling price in full INR (not paise). */
  price_inr: number
  /** Original MRP in full INR, or null when no discount applies. */
  mrp_inr: number | null
  shades: SugarShade[]
}

/** Cart line item populated from Medusa, enriched with Sugar metadata. */
export interface CartLine {
  id: string
  variant_id: string
  product_id: string
  title: string
  thumbnail: string | null
  shade_name: string | null
  shade_hex: string | null
  quantity: number
  /** Selling price per unit in full INR. */
  unit_price_inr: number
  /** Line total in full INR. */
  total_inr: number
}

/** Minimal order summary for confirmation page and order history. */
export interface OrderSummary {
  id: string
  display_id: number
  status: string
  created_at: string
  /** Order grand total in full INR. */
  total_inr: number
  item_count: number
  email: string
}
