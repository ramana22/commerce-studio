'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { bottleImage } from '@/lib/catalog/placeholder'
import { AppImage } from '@/components/ui/app-image'
import { Reveal } from '@/components/motion/reveal'

/**
 * Editorial split banner with scroll parallax — a campaign moment between
 * product rails so the home reads like a magazine, not a catalog.
 */
export function CollectionBanner() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], ['-7%', '7%'])
  const wordX = useTransform(scrollYProgress, [0, 1], ['4%', '-8%'])

  return (
    <section ref={ref} className="relative overflow-hidden bg-brand-cream/60 py-20 sm:py-24">
      {/* Drifting watermark */}
      <motion.p
        aria-hidden
        style={reduce ? undefined : { x: wordX }}
        className="pointer-events-none absolute top-8 select-none whitespace-nowrap font-display text-[8rem] font-bold leading-none text-stroke-ink sm:text-[11rem]"
      >
        GOLDEN HOUR · GOLDEN HOUR ·
      </motion.p>

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 md:grid-cols-2 lg:gap-16">
        {/* Parallax visual */}
        <Reveal y={28}>
          <div className="relative">
            {/* Gold frame offset behind the image */}
            <div className="absolute -left-4 -top-4 h-full w-full rounded-3xl border border-brand-gold/50" />
            <div className="relative aspect-[5/6] overflow-hidden rounded-3xl shadow-card sm:aspect-[4/4.4]">
              <motion.div
                style={reduce ? undefined : { y: imageY }}
                className="absolute -inset-y-[9%] inset-x-0"
              >
                <AppImage
                  src="/images/campaign/golden-hour.webp"
                  fallbackSrc={bottleImage('golden-hour-edit')}
                  alt="The Golden Hour Edit — amber perfume oils in evening light"
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/45 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 rounded-full border border-white/30 bg-black/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur">
                Limited · 500 numbered bottles
              </div>
            </div>
          </div>
        </Reveal>

        {/* Copy */}
        <Reveal delay={0.12}>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-600">
            Limited edition
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-brand-ink sm:text-6xl">
            The <span className="italic text-gradient-ember">Golden Hour</span> Edit
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-neutral-600">
            Three amber blends bottled at dusk strength — saffron-laced, honeyed and
            warm as late sun on skin. Numbered, sealed by hand and gone when
            they&apos;re gone.
          </p>

          <ul className="mt-7 space-y-3.5">
            {[
              ['Nº 1 — Amber Saffron', 'Opens golden, dries to soft leather'],
              ['Nº 2 — Honey Tabac', 'Sweet smoke for slow evenings'],
              ['Nº 3 — Solar Musk', 'Sun-warmed skin, bottled'],
            ].map(([name, line]) => (
              <li key={name} className="flex items-start gap-3.5">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-brand-gold to-pink-600" />
                <p className="text-sm">
                  <span className="font-semibold text-brand-ink">{name}</span>
                  <span className="text-neutral-500"> · {line}</span>
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/gifting"
              className="group inline-flex items-center gap-2 rounded-full bg-brand-ink px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:gap-3.5 hover:bg-pink-700"
            >
              Shop the Edit
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <p className="text-xs text-neutral-400">
              Ships in a gift-ready keepsake box
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
