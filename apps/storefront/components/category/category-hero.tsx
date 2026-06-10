'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { CategoryBanner } from '@/lib/sanity/types'
import { urlForImage } from '@/lib/sanity/image'
import { AppImage } from '@/components/ui/app-image'
import { CtaButton } from '@/components/blocks/cta-button'

export function CategoryHero({ banner }: { banner: CategoryBanner }) {
  const reduce = useReducedMotion()
  const isVideo = banner.mediaType === 'video' && banner.video?.desktopUrl
  const poster = urlForImage(banner.video?.poster, { width: 1600 })
  const image = urlForImage(banner.image, { width: 1600 })

  return (
    <section className="relative h-72 w-full overflow-hidden sm:h-96">
      {isVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster ?? undefined}
        >
          <source src={banner.video!.desktopUrl!} type="video/mp4" />
        </video>
      ) : image ? (
        <AppImage
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : null}

      <div className="absolute inset-0 bg-black/35" />
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-white"
      >
        <h1 className="text-4xl font-extrabold sm:text-6xl">{banner.heading}</h1>
        {banner.subheading ? (
          <p className="max-w-xl text-lg">{banner.subheading}</p>
        ) : null}
        <CtaButton cta={banner.cta} />
      </motion.div>
    </section>
  )
}
