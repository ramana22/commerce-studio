import type { ProductReviews } from '@/lib/reviews/review-service'
import { Stars } from '@/components/ui/stars'
import { ReviewForm } from './review-form'

function Bar({ pct }: { pct: number }) {
  return (
    <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
      <div className="h-full rounded-full bg-pink-600" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function ReviewsSection({
  productId,
  data,
}: {
  productId: string
  data: ProductReviews
}) {
  const { aggregate, reviews } = data
  const { average, count, distribution } = aggregate

  return (
    <section id="reviews" className="mx-auto max-w-7xl px-6 py-14">
      <h2 className="font-display text-3xl font-semibold text-brand-ink">
        Reviews
      </h2>

      <div className="mt-6 grid gap-10 md:grid-cols-[280px_1fr]">
        {/* Summary + CTA */}
        <div>
          {count > 0 ? (
            <>
              <div className="flex items-end gap-3">
                <span className="font-display text-5xl font-semibold text-brand-ink">
                  {average.toFixed(1)}
                </span>
                <div className="pb-1">
                  <Stars rating={average} className="text-lg" />
                  <p className="mt-0.5 text-sm text-neutral-500">{count} reviews</p>
                </div>
              </div>
              <div className="mt-4 space-y-1.5">
                {[5, 4, 3, 2, 1].map((n) => {
                  const c = distribution[String(n)] ?? 0
                  return (
                    <div key={n} className="flex items-center gap-2 text-xs text-neutral-500">
                      <span className="w-3">{n}</span>
                      <Bar pct={count ? (c / count) * 100 : 0} />
                      <span className="w-6 text-right">{c}</span>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <p className="text-sm text-neutral-500">
              No reviews yet — be the first to share your scent experience.
            </p>
          )}
          <div className="mt-6">
            <ReviewForm productId={productId} />
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-neutral-100">
          {reviews.length === 0 ? (
            <p className="py-8 text-sm text-neutral-400">No published reviews yet.</p>
          ) : (
            reviews.map((r) => (
              <article key={r.id} className="py-5">
                <div className="flex items-center justify-between">
                  <Stars rating={r.rating} className="text-sm" />
                  <span className="text-xs text-neutral-400">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                {r.title ? (
                  <p className="mt-2 font-medium text-brand-ink">{r.title}</p>
                ) : null}
                <p className="mt-1 text-sm leading-relaxed text-neutral-600">{r.content}</p>
                {r.images.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.images.map((src) => (
                      // Review photos are user-uploaded from arbitrary hosts —
                      // a plain img avoids next/image remote-host config.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={src}
                        src={src}
                        alt=""
                        loading="lazy"
                        className="h-20 w-20 rounded-lg bg-neutral-100 object-cover"
                      />
                    ))}
                  </div>
                ) : null}
                <p className="mt-2 text-xs font-medium text-green-700">
                  ✓ Verified purchase · {r.author_name}
                </p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
