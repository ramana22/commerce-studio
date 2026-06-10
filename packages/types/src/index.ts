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
  /** Selling price in full USD (not cents). */
  price_usd: number
  /** Original MSRP in full USD, or null when no discount applies. */
  msrp_usd: number | null
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
  /** Selling price per unit in full USD. */
  unit_price_usd: number
  /** Line total in full USD. */
  total_usd: number
}

/** Aggregated cart money lines — all values in full USD. */
export interface CartTotals {
  subtotal_usd: number
  /** Selected shipping method cost; 0 before a method is chosen. */
  shipping_usd: number
  tax_usd: number
  /** Total discount applied across promotions; 0 when none. */
  discount_usd: number
  total_usd: number
  /** Sum of line quantities. */
  item_count: number
}

/** Minimal order summary for confirmation page and order history. */
export interface OrderSummary {
  id: string
  display_id: number
  status: string
  created_at: string
  /** Order grand total in full USD. */
  total_usd: number
  item_count: number
  email: string
}
