import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductByHandle } from '@/lib/catalog/product-service'
import { ProductGallery } from '@/components/product/product-gallery'
import { PdpActions } from '@/components/product/pdp-actions'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const product = await getProductByHandle(handle)
  return {
    title: product?.title ?? 'Product',
    description: product?.description ?? undefined,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const product = await getProductByHandle(handle)
  if (!product) notFound()

  const badge = product.is_new_launch
    ? 'NEW'
    : product.is_bestseller
      ? 'BESTSELLER'
      : product.badge

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={product.images} title={product.title} />

        <div>
          {badge ? (
            <span className="inline-block rounded bg-black/80 px-2 py-0.5 text-xs font-semibold tracking-wide text-white">
              {badge}
            </span>
          ) : null}
          <h1 className="mt-2 text-3xl font-semibold">{product.title}</h1>
          {product.review_count ? (
            <p className="mt-1 text-sm text-neutral-500">
              {product.review_count} reviews
            </p>
          ) : null}

          <PdpActions product={product} />

          {product.description ? (
            <div className="mt-8 border-t border-neutral-200 pt-6">
              <h2 className="mb-2 font-semibold">Description</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                {product.description}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}
