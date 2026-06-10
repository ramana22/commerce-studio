import Link from 'next/link'
import type { ProductCard as ProductCardData } from '@sugar-store/types'
import { formatUsd } from '@/lib/medusa/money'
import { AppImage } from '@/components/ui/app-image'
import { ShadeSwatches } from './shade-swatches'

const CARD_SIZES = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw'

function Badge({ product }: { product: ProductCardData }) {
  const label = product.is_new_launch
    ? 'NEW'
    : product.is_bestseller
      ? 'BESTSELLER'
      : product.badge
  if (!label) return null
  return (
    <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-brand-ink/85 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white backdrop-blur">
      {label}
    </span>
  )
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const discount =
    product.msrp_usd && product.msrp_usd > product.price_usd
      ? Math.round((1 - product.price_usd / product.msrp_usd) * 100)
      : null

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-hover"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
        <Badge product={product} />
        {product.thumbnail ? (
          <AppImage
            src={product.thumbnail}
            alt={product.title}
            fill
            sizes={CARD_SIZES}
            className="object-cover"
          />
        ) : null}
        {/* Hover image cross-fade */}
        {product.hover_image ? (
          <AppImage
            src={product.hover_image}
            alt=""
            aria-hidden
            fill
            sizes={CARD_SIZES}
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="line-clamp-2 text-sm font-medium leading-snug">
          {product.title}
        </p>
        <ShadeSwatches shades={product.shades} />
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="font-semibold">{formatUsd(product.price_usd)}</span>
          {product.msrp_usd && product.msrp_usd > product.price_usd ? (
            <>
              <span className="text-sm text-neutral-400 line-through">
                {formatUsd(product.msrp_usd)}
              </span>
              {discount ? (
                <span className="text-xs font-semibold text-green-700">
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
