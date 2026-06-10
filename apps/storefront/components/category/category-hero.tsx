import type { CategoryBanner } from '@/lib/sanity/types'
import { urlForImage } from '@/lib/sanity/image'
import { CtaButton } from '@/components/blocks/cta-button'

export function CategoryHero({ banner }: { banner: CategoryBanner }) {
  const isVideo = banner.mediaType === 'video' && banner.video?.desktopUrl
  const poster = urlForImage(banner.video?.poster, { width: 1600 })
  const image = urlForImage(banner.image, { width: 1600 })

  return (
    <section className="relative h-64 w-full overflow-hidden sm:h-80">
      {isVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={poster ?? undefined}
        >
          <source src={banner.video!.desktopUrl!} type="video/mp4" />
        </video>
      ) : image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}

      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-white">
        <h1 className="text-3xl font-bold sm:text-5xl">{banner.heading}</h1>
        {banner.subheading ? (
          <p className="max-w-xl text-lg">{banner.subheading}</p>
        ) : null}
        <CtaButton cta={banner.cta} />
      </div>
    </section>
  )
}
