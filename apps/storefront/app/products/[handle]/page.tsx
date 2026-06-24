import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  getProductByHandle,
  getProductCards,
} from '@/lib/catalog/product-service'
import { pseudoRating } from '@/lib/catalog/rating'
import { getProductReviews } from '@/lib/reviews/review-service'
import { isFragranceProduct } from '@/lib/catalog/scent'
import { ProductGallery } from '@/components/product/product-gallery'
import { PdpActions } from '@/components/product/pdp-actions'
import { ScentDna } from '@/components/product/scent-dna'
import { ProductRail } from '@/components/home/product-rail'
import { Stars } from '@/components/ui/stars'
import { ReviewsSection } from '@/components/reviews/reviews-section'
import { TrackEvent } from '@/components/analytics/track-event'

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

  const [related, reviewData] = await Promise.all([
    getProductCards({ limit: 12 }).then((cards) =>
      cards.filter((p) => p.handle !== product.handle),
    ),
    getProductReviews(product.id),
  ])

  const isFragrance = isFragranceProduct(product.category)

  const badge = product.is_new_launch
    ? 'NEW'
    : product.is_bestseller
      ? 'BESTSELLER'
      : product.badge

  // Show the real aggregate once a product has approved reviews; otherwise the
  // pseudo rating keeps the page looking populated (but is never emitted to
  // structured data — only genuine reviews are).
  const hasReviews = reviewData.aggregate.count > 0
  const pseudo = pseudoRating(product.id)
  const rating = hasReviews ? reviewData.aggregate.average : pseudo.rating
  const count = hasReviews ? reviewData.aggregate.count : pseudo.count

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description ?? undefined,
    image: product.thumbnail ? [product.thumbnail] : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: product.price_usd.toFixed(2),
      availability: 'https://schema.org/InStock',
    },
    ...(hasReviews
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: reviewData.aggregate.average,
            reviewCount: reviewData.aggregate.count,
          },
          review: reviewData.reviews.slice(0, 5).map((r) => ({
            '@type': 'Review',
            reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
            author: { '@type': 'Person', name: r.author_name },
            reviewBody: r.content,
            datePublished: r.created_at,
          })),
        }
      : {}),
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrackEvent
        event="product_viewed"
        payload={{ handle: product.handle, title: product.title, price_usd: product.price_usd }}
      />
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

            <a href="#reviews" className="mt-3 flex w-fit items-center gap-2">
              <Stars rating={rating} className="text-base" />
              <span className="text-sm text-neutral-500 hover:text-pink-600">
                {rating.toFixed(1)} · {count} reviews
              </span>
            </a>

            <PdpActions product={product} />

            {/* Animated note pyramid + wear meters — fragrances only */}
            {isFragrance ? <ScentDna seed={product.handle || product.id} /> : null}

            {/* Accordions */}
            <div className="mt-6">
              {product.description ? (
                <Accordion title="Description" open>
                  <p className="whitespace-pre-line">{product.description}</p>
                </Accordion>
              ) : null}
              {isFragrance ? (
                <Accordion title="How to use">
                  Roll onto pulse points — wrists, neck and behind the ears. Reapply
                  through the day to refresh. Avoid rubbing, which breaks down the notes.
                </Accordion>
              ) : null}
              <Accordion title="Shipping & returns">
                Free shipping on orders over $50. Easy 30-day returns on unopened
                items. Ships within 1–2 business days.
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-100">
        <ReviewsSection productId={product.id} data={reviewData} />
      </div>

      <div className="border-t border-neutral-100">
        <ProductRail eyebrow="You may also like" title="More to discover" products={related} />
      </div>
    </main>
  )
}
