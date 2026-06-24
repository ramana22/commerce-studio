import type { HttpTypes } from '@medusajs/types'
import type { ProductCard, SugarShade } from '@sugar-store/types'
import { centsToUsd } from '../medusa/money'
import { mediaUrl } from '../media/url'
import { isPlaceholder, productGallery, productShot } from './placeholder'
import type { ProductDetail, ProductDetailVariant } from './types'

type Variant = HttpTypes.StoreProductVariant
type Product = HttpTypes.StoreProduct

function meta(product: Product): Record<string, unknown> {
  return (product.metadata ?? {}) as Record<string, unknown>
}

function str(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

function variantInStock(variant: Variant): boolean {
  if (variant.manage_inventory === false) return true
  if (variant.allow_backorder) return true
  const qty = (variant as { inventory_quantity?: number }).inventory_quantity
  return qty === undefined ? true : qty > 0
}

function variantPrices(variant: Variant): {
  price_usd: number
  msrp_usd: number | null
} {
  const calc = variant.calculated_price
  const amount = calc?.calculated_amount ?? 0
  const original = calc?.original_amount ?? amount
  return {
    price_usd: centsToUsd(amount),
    msrp_usd: original > amount ? centsToUsd(original) : null,
  }
}

/** Resolve the gallery image URLs for a product from its metadata. */
function productImages(product: Product): string[] {
  const m = meta(product)
  const main = str(m.main_image)
  const gallery = Array.isArray(m.gallery_images)
    ? (m.gallery_images as unknown[]).filter(
        (g): g is string => typeof g === 'string',
      )
    : []
  const fromMedusa = (product.images ?? [])
    .map((i) => i.url)
    .filter((u): u is string => Boolean(u))

  const urls = [main, ...gallery]
    .map((p) => mediaUrl(p))
    .filter((u): u is string => Boolean(u))

  return Array.from(new Set([...urls, ...fromMedusa]))
}

/**
 * Real (non-placeholder) image URLs for a product, thumbnail first. A product's
 * seeded picsum/loremflickr thumbnail or empty fields are skipped so genuinely
 * uploaded photos — Admin Media (served from the Medusa backend's /static) or
 * R2 — always win over the generated brand renders. Only when a product has no
 * real media at all do we fall back to a render.
 */
function realImages(product: Product): string[] {
  const candidates = [str(product.thumbnail), ...productImages(product)].filter(
    (u): u is string => Boolean(u) && !isPlaceholder(u),
  )
  return Array.from(new Set(candidates))
}

function toShade(variant: Variant): SugarShade {
  const m = (variant.metadata ?? {}) as Record<string, unknown>
  return {
    name: variant.title ?? 'Default',
    hex: str(m.shade_hex) ?? '',
    sku: variant.sku ?? '',
    in_stock: variantInStock(variant),
  }
}

/** Map a Medusa product into a listing/grid card. */
export function mapProductToCard(product: Product): ProductCard {
  const m = meta(product)
  const first = product.variants?.[0]
  const prices = first
    ? variantPrices(first)
    : { price_usd: 0, msrp_usd: null }
  const seed = product.handle ?? product.id
  const reals = realImages(product)

  return {
    id: product.id,
    handle: product.handle ?? '',
    title: product.title,
    thumbnail: reals[0] ?? productShot(seed),
    hover_image: mediaUrl(str(m.hover_image)) ?? reals[1] ?? null,
    badge: str(m.badge),
    is_new_launch: m.is_new_launch === true,
    is_bestseller: m.is_bestseller === true,
    price_usd: prices.price_usd,
    msrp_usd: prices.msrp_usd,
    default_variant_id:
      (product.variants ?? []).find(variantInStock)?.id ?? first?.id ?? null,
    shades: (product.variants ?? []).map(toShade),
    rating_average: typeof m.rating_average === 'number' ? m.rating_average : null,
    rating_count: typeof m.rating_count === 'number' ? m.rating_count : null,
    category: str(m.category),
  }
}

/** Map a Medusa product into the full PDP detail shape. */
export function mapProductToDetail(product: Product): ProductDetail {
  const m = meta(product)
  const seed = product.handle ?? product.id
  const reals = realImages(product)
  const variants: ProductDetailVariant[] = (product.variants ?? []).map((v) => {
    const vm = (v.metadata ?? {}) as Record<string, unknown>
    const prices = variantPrices(v)
    return {
      id: v.id,
      title: v.title ?? 'Default',
      shade_name: v.title && v.title !== 'Default' ? v.title : null,
      shade_hex: str(vm.shade_hex),
      sku: v.sku ?? null,
      price_usd: prices.price_usd,
      msrp_usd: prices.msrp_usd,
      in_stock: variantInStock(v),
    }
  })
  const first = variants[0]

  // Real uploaded media is shown as-is; products with no real media get the
  // three-shot brand gallery — studio, label macro, dark editorial.
  const gallery = reals.length ? reals : productGallery(seed)

  return {
    id: product.id,
    handle: product.handle ?? '',
    title: product.title,
    description: product.description ?? null,
    thumbnail: reals[0] ?? productShot(seed),
    images: gallery,
    badge: str(m.badge),
    is_new_launch: m.is_new_launch === true,
    is_bestseller: m.is_bestseller === true,
    review_count:
      typeof m.review_count === 'number' ? m.review_count : null,
    rating_average: typeof m.rating_average === 'number' ? m.rating_average : null,
    rating_count: typeof m.rating_count === 'number' ? m.rating_count : null,
    price_usd: first?.price_usd ?? 0,
    msrp_usd: first?.msrp_usd ?? null,
    variants,
    category: str(m.category),
  }
}
