import Link from 'next/link'
import type { ProductCard as ProductCardData } from '@sugar-store/types'
import { formatUsd } from '@/lib/medusa/money'
import { pseudoRating } from '@/lib/catalog/rating'
import { bottleImage } from '@/lib/catalog/placeholder'
import { AppImage } from '@/components/ui/app-image'
import { Stars } from '@/components/ui/stars'
import { ShadeSwatches } from './shade-swatches'
import { WishlistButton } from './wishlist-button'

const CARD_SIZES = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw'

function Badge({ product }: { product: ProductCardData }) {
  const label = product.is_new_launch
    ? 'NEW'
    : product.is_bestseller
      ? 'BESTSELLER'
      : product.badge
  if (!label) return null
  return (
    <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-brand-ink/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">
      {label}
    </span>
  )
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const discount =
    product.msrp_usd && product.msrp_usd > product.price_usd
      ? Math.round((1 - product.price_usd / product.msrp_usd) * 100)
      : null
  const fromPrice = product.shades.length > 1
  const { rating, count } = pseudoRating(product.id)
  const hover = product.hover_image ?? product.thumbnail
  const fallback = bottleImage(product.handle || product.id)

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white transition-all duration-500 ease-smooth hover:-translate-y-1.5 hover:border-transparent hover:shadow-hover"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-neutral-50 to-neutral-100">
        <Badge product={product} />
        <WishlistButton label={product.title} />

        {product.thumbnail ? (
          <AppImage
            src={product.thumbnail}
            fallbackSrc={fallback}
            alt={product.title}
            fill
            sizes={CARD_SIZES}
            className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-105"
          />
        ) : null}
        {/* Hover image cross-fade (falls back to a zoom of the main image). */}
        {hover ? (
          <AppImage
            src={hover}
            fallbackSrc={fallback}
            alt=""
            aria-hidden
            fill
            sizes={CARD_SIZES}
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        ) : null}

        {/* Reveal "View" pill on hover. */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 translate-y-3 opacity-0 transition-all duration-500 ease-smooth group-hover:translate-y-0 group-hover:opacity-100">
          <span className="block rounded-full bg-brand-ink/90 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
            View Product
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <div className="flex items-center gap-1.5">
          <Stars rating={rating} className="text-[13px]" />
          <span className="text-[11px] text-neutral-400">({count})</span>
        </div>
        <p className="line-clamp-2 text-sm font-medium leading-snug text-brand-ink">
          {product.title}
        </p>
        <ShadeSwatches shades={product.shades} />
        <div className="mt-auto flex items-baseline gap-2 pt-1.5">
          {fromPrice ? (
            <span className="text-[11px] uppercase tracking-wide text-neutral-400">
              From
            </span>
          ) : null}
          <span className="font-semibold text-brand-ink">
            {formatUsd(product.price_usd)}
          </span>
          {product.msrp_usd && product.msrp_usd > product.price_usd ? (
            <>
              <span className="text-sm text-neutral-400 line-through">
                {formatUsd(product.msrp_usd)}
              </span>
              {discount ? (
                <span className="text-xs font-semibold text-pink-700">
                  {discount}% off
                </span>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
