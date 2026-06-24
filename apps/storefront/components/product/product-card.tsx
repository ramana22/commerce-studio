import Link from 'next/link'
import type { ProductCard as ProductCardData } from '@sugar-store/types'
import { formatUsd } from '@/lib/medusa/money'
import { pseudoRating } from '@/lib/catalog/rating'
import { bottleImage } from '@/lib/catalog/placeholder'
import { isFragranceProduct, notesTeaser, scentProfile } from '@/lib/catalog/scent'
import { AppImage } from '@/components/ui/app-image'
import { Stars } from '@/components/ui/stars'
import { ShadeSwatches } from './shade-swatches'
import { WishlistButton } from './wishlist-button'
import { QuickAddButton } from './quick-add-button'

const CARD_SIZES = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw'

function Badge({ product }: { product: ProductCardData }) {
  const label = product.is_new_launch
    ? 'NEW LAUNCH'
    : product.is_bestseller
      ? 'BESTSELLER'
      : product.badge
  if (!label) return null
  return (
    <span className="absolute left-2.5 top-2.5 z-10 rounded-md bg-brand-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white shadow-sm">
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
  // Real aggregate from approved reviews when present; pseudo rating keeps the
  // catalog looking populated before a product has reviews.
  const { rating, count } =
    product.rating_count && product.rating_count > 0
      ? { rating: product.rating_average ?? 0, count: product.rating_count }
      : pseudoRating(product.id)
  const hover = product.hover_image ?? product.thumbnail
  const fallback = bottleImage(product.handle || product.id)
  const isFragrance = isFragranceProduct(product.category)
  const profile = isFragrance ? scentProfile(product.handle || product.id) : null
  const href = `/products/${product.handle}`

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white transition-all duration-500 ease-smooth hover:-translate-y-1.5 hover:border-transparent hover:shadow-hover">
      <Link
        href={href}
        aria-label={product.title}
        className="relative block aspect-[4/5] overflow-hidden bg-gradient-to-b from-neutral-50 to-neutral-100"
      >
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

        {/* Mood chip — anchors the card in the scent-mood navigation. */}
        {profile ? (
          <span className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-ink shadow-sm backdrop-blur">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: profile.mood.aura }}
            />
            {profile.mood.label}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <div className="flex items-center gap-1.5">
          <Stars rating={rating} className="text-[13px]" />
          <span className="text-[11px] text-neutral-400">({count})</span>
        </div>
        <Link href={href} className="transition-colors hover:text-pink-700">
          <p className="line-clamp-2 text-sm font-medium leading-snug text-brand-ink">
            {product.title}
          </p>
        </Link>
        {profile ? (
          <p className="truncate text-[11px] text-neutral-400">
            {notesTeaser(profile)}
          </p>
        ) : null}
        <ShadeSwatches shades={product.shades} />

        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2">
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

          <QuickAddButton
            variant="block"
            label="Add to Bag"
            variantId={product.default_variant_id}
            title={product.title}
            className="mt-3"
          />
        </div>
      </div>
    </div>
  )
}
