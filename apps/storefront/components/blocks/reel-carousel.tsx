import Link from 'next/link'
import type { ReactNode } from 'react'
import type { ReelCarouselBlock } from '@/lib/sanity/types'
import { urlForImage } from '@/lib/sanity/image'

export function ReelCarousel({ block }: { block: ReelCarouselBlock }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="mb-4 text-2xl font-semibold">{block.heading}</h2>
      <ul className="flex gap-4 overflow-x-auto pb-3">
        {block.reels.map((reel, i) => {
          const poster = urlForImage(reel.video.poster, { width: 400 })
          const media: ReactNode = (
            <div className="relative aspect-[9/16] w-48 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
              {reel.video.desktopUrl ? (
                <video
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster={poster ?? undefined}
                >
                  <source src={reel.video.desktopUrl} type="video/mp4" />
                </video>
              ) : poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={poster}
                  alt={reel.caption ?? ''}
                  className="h-full w-full object-cover"
                />
              ) : null}
              {reel.caption ? (
                <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-xs text-white">
                  {reel.caption}
                </p>
              ) : null}
            </div>
          )
          return (
            <li key={reel.caption ? `${reel.caption}-${i}` : i}>
              {reel.product?.handle ? (
                <Link href={`/products/${reel.product.handle}`}>{media}</Link>
              ) : (
                media
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
