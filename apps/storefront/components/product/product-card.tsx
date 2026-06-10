import Link from 'next/link'
import type { ProductCard as ProductCardData } from '@sugar-store/types'
import { formatInr } from '@/lib/medusa/money'
import { ShadeSwatches } from './shade-swatches'

function Badge({ product }: { product: ProductCardData }) {
  const label = product.is_new_launch
    ? 'NEW'
    : product.is_bestseller
      ? 'BESTSELLER'
      : product.badge
  if (!label) return null
  return (
    <span className="absolute left-2 top-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">
      {label}
    </span>
  )
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const discount =
    product.mrp_inr && product.mrp_inr > product.price_inr
      ? Math.round((1 - product.price_inr / product.mrp_inr) * 100)
      : null

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <Badge product={product} />
        {product.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.thumbnail}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="line-clamp-2 text-sm font-medium">{product.title}</p>
        <ShadeSwatches shades={product.shades} />
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="font-semibold">{formatInr(product.price_inr)}</span>
          {product.mrp_inr && product.mrp_inr > product.price_inr ? (
            <>
              <span className="text-sm text-neutral-400 line-through">
                {formatInr(product.mrp_inr)}
              </span>
              {discount ? (
                <span className="text-xs font-medium text-green-700">
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
