import type { HeroVideoBlock } from '@/lib/sanity/types'
import { urlForImage } from '@/lib/sanity/image'
import { CtaButton } from './cta-button'

export function HeroVideo({ block }: { block: HeroVideoBlock }) {
  const poster = urlForImage(block.video.poster, { width: 1600 })
  const light = block.textColor !== 'dark'

  return (
    <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden">
      {block.video.desktopUrl ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={poster ?? undefined}
        >
          <source src={block.video.desktopUrl} type="video/mp4" />
        </video>
      ) : poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

      <div
        className={`relative z-10 flex h-full max-w-2xl flex-col items-start justify-end gap-4 p-8 sm:p-16 ${
          light ? 'text-white' : 'text-neutral-900'
        }`}
      >
        <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
          {block.heading}
        </h1>
        {block.subheading ? (
          <p className="text-lg sm:text-xl">{block.subheading}</p>
        ) : null}
        <CtaButton cta={block.cta} />
      </div>
    </section>
  )
}
