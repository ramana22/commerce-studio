'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { HeroVideoBlock } from '@/lib/sanity/types'
import { urlForImage } from '@/lib/sanity/image'
import { AppImage } from '@/components/ui/app-image'
import { CtaButton } from './cta-button'

export function HeroVideo({ block }: { block: HeroVideoBlock }) {
  const reduce = useReducedMotion()
  const poster = urlForImage(block.video.poster, { width: 1600 })
  const light = block.textColor !== 'dark'

  const rise = (delay: number) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 28 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
        }

  return (
    <section className="relative h-[78vh] min-h-[460px] w-full overflow-hidden">
      {block.video.desktopUrl ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster ?? undefined}
        >
          <source src={block.video.desktopUrl} type="video/mp4" />
        </video>
      ) : poster ? (
        <AppImage
          src={poster}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

      <div
        className={`relative z-10 mx-auto flex h-full max-w-6xl flex-col items-start justify-end gap-5 px-6 pb-14 sm:px-10 sm:pb-20 ${
          light ? 'text-white' : 'text-brand-ink'
        }`}
      >
        <motion.h1
          {...rise(0.05)}
          className="max-w-3xl text-balance text-4xl font-extrabold leading-[1.05] sm:text-6xl"
        >
          {block.heading}
        </motion.h1>
        {block.subheading ? (
          <motion.p
            {...rise(0.18)}
            className="max-w-xl text-lg sm:text-xl"
          >
            {block.subheading}
          </motion.p>
        ) : null}
        {block.cta ? (
          <motion.div {...rise(0.3)}>
            <CtaButton cta={block.cta} />
          </motion.div>
        ) : null}
      </div>
    </section>
  )
}
