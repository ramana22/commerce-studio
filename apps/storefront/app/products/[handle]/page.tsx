import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  getProductByHandle,
  getProductCards,
} from '@/lib/catalog/product-service'
import { pseudoRating } from '@/lib/catalog/rating'
import { ProductGallery } from '@/components/product/product-gallery'
import { PdpActions } from '@/components/product/pdp-actions'
import { ProductRail } from '@/components/home/product-rail'
import { Stars } from '@/components/ui/stars'

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

/** Deterministic fragrance-note pyramid so each PDP reads like a real listing. */
const TOP = ['Bergamot', 'Pink Pepper', 'Saffron', 'Grapefruit', 'Cardamom', 'Neroli']
const HEART = ['Rose', 'Jasmine', 'Orris', 'Lavender', 'Geranium', 'Violet']
const BASE = ['Oud', 'Amber', 'Sandalwood', 'Musk', 'Vanilla', 'Tobacco']

function notesFor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return {
    top: [TOP[h % TOP.length], TOP[(h >> 3) % TOP.length]],
    heart: [HEART[h % HEART.length], HEART[(h >> 3) % HEART.length]],
    base: [BASE[h % BASE.length], BASE[(h >> 3) % BASE.length]],
  }
}

function Accordion({
  title,
  children,
  open = false,
}: {
  title: string
  children: React.ReactNode
  open?: boolean
}) {
  return (
    <details open={open} className="group border-b border-neutral-200 py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-brand-ink">
        {title}
        <span className="text-pink-600 transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="mt-3 text-sm leading-relaxed text-neutral-600">{children}</div>
    </details>
  )
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const product = await getProductByHandle(handle)
  if (!product) notFound()

  const related = (await getProductCards({ limit: 12 })).filter(
    (p) => p.handle !== product.handle,
  )

  const badge = product.is_new_launch
    ? 'NEW'
    : product.is_bestseller
      ? 'BESTSELLER'
      : product.badge
  const { rating, count } = pseudoRating(product.id)
  const notes = notesFor(product.id)

  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 pb-14 pt-6">
        {/* Breadcrumb */}
        <nav className="mb-6 text-xs text-neutral-400">
          <Link href="/" className="hover:text-pink-600">Home</Link>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-600">{product.title}</span>
        </nav>

        <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
          <div className="md:sticky md:top-24 md:self-start">
            <ProductGallery images={product.images} title={product.title} />
          </div>

          <div>
            {badge ? (
              <span className="inline-block rounded-full bg-brand-ink px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                {badge}
              </span>
            ) : null}
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-brand-ink">
              {product.title}
            </h1>

            <div className="mt-3 flex items-center gap-2">
              <Stars rating={rating} className="text-base" />
              <span className="text-sm text-neutral-500">
                {rating.toFixed(1)} · {product.review_count ?? count} reviews
              </span>
            </div>

            <PdpActions product={product} />

            {/* Fragrance pyramid */}
            <div className="mt-9 rounded-2xl bg-brand-cream p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-600">
                Scent profile
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                {[
                  ['Top', notes.top],
                  ['Heart', notes.heart],
                  ['Base', notes.base],
                ].map(([label, items]) => (
                  <div key={label as string} className="flex gap-3">
                    <dt className="w-16 shrink-0 font-medium text-brand-ink">{label}</dt>
                    <dd className="text-neutral-600">{(items as string[]).join(', ')}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Accordions */}
            <div className="mt-6">
              {product.description ? (
                <Accordion title="Description" open>
                  <p className="whitespace-pre-line">{product.description}</p>
                </Accordion>
              ) : null}
              <Accordion title="How to use">
                Roll onto pulse points — wrists, neck and behind the ears. Reapply
                through the day to refresh. Avoid rubbing, which breaks down the notes.
              </Accordion>
              <Accordion title="Shipping & returns">
                Free shipping on orders over $50. Easy 30-day returns on unopened
                items. Ships within 1–2 business days.
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-100">
        <ProductRail eyebrow="You may also like" title="More to discover" products={related} />
      </div>
    </main>
  )
}
