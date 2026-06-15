'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils/cn'

export interface Slide {
  eyebrow: string
  title: string
  highlight: string
  subtitle: string
  ctaLabel: string
  ctaHref: string
  /** [background tint, accent] */
  accent: [string, string]
  /** Liquid colour of the floating bottle. */
  liquid: string
}

const DEFAULT_SLIDES: Slide[] = [
  {
    eyebrow: 'Pure Perfume Oils',
    title: 'Sourced',
    highlight: 'Carefully',
    subtitle: 'Quality is not a compromise. Alcohol-free oils that last all day.',
    ctaLabel: 'Shop Bestsellers',
    ctaHref: '/bestsellers',
    accent: ['#0A1A13', '#0E7C5A'],
    liquid: '#2FA37A',
  },
  {
    eyebrow: 'Inspired by the Icons',
    title: 'Your Signature,',
    highlight: 'From $8',
    subtitle: 'Premium impressions of the fragrances you love — for a fraction of the price.',
    ctaLabel: 'Explore For Her',
    ctaHref: '/for-her',
    accent: ['#15382C', '#2FA37A'],
    liquid: '#C8A24A',
  },
  {
    eyebrow: 'Layer Your Scent',
    title: 'Build Your',
    highlight: 'Trio',
    subtitle: 'Mix three roll-ons and make a fragrance that is unmistakably you.',
    ctaLabel: 'Build a Combo',
    ctaHref: '/combos',
    accent: ['#13241D', '#C8A24A'],
    liquid: '#C8A24A',
  },
  {
    eyebrow: '12-Hour Wear',
    title: 'For',
    highlight: 'Him',
    subtitle: 'Woody, spicy and aquatic blends with serious staying power.',
    ctaLabel: 'Shop For Him',
    ctaHref: '/for-him',
    accent: ['#08120D', '#0B6147'],
    liquid: '#1A8B62',
  },
]

const ROTATE_MS = 5500

function Bottle({ liquid }: { liquid: string }) {
  return (
    <div className="relative h-64 w-32 sm:h-80 sm:w-40">
      {/* glow */}
      <div
        className="absolute inset-0 animate-glow rounded-full blur-3xl"
        style={{ backgroundColor: liquid, opacity: 0.45 }}
      />
      {/* cap */}
      <div className="absolute left-1/2 top-0 h-14 w-12 -translate-x-1/2 rounded-md bg-gradient-to-b from-neutral-800 to-black sm:h-16 sm:w-14" />
      {/* neck */}
      <div className="absolute left-1/2 top-12 h-5 w-8 -translate-x-1/2 bg-white/30 sm:top-14" />
      {/* body */}
      <div className="absolute left-1/2 top-16 h-44 w-28 -translate-x-1/2 overflow-hidden rounded-2xl border border-white/30 bg-white/15 backdrop-blur-sm sm:top-[4.75rem] sm:h-52 sm:w-32">
        <div
          className="absolute inset-x-0 bottom-0 h-3/4"
          style={{
            background: `linear-gradient(180deg, ${liquid}cc, ${liquid})`,
          }}
        />
        <div className="absolute inset-x-3 top-6 rounded-sm bg-white/85 py-2 text-center">
          <span className="font-display text-[10px] font-semibold tracking-[0.2em] text-brand-ink">
            BODYSCENT
          </span>
        </div>
      </div>
    </div>
  )
}

export function HeroCarousel({ slides }: { slides?: Slide[] }) {
  const data = slides && slides.length > 0 ? slides : DEFAULT_SLIDES
  const [index, setIndex] = useState(0)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => setIndex((p) => (p + 1) % data.length), ROTATE_MS)
    return () => clearInterval(id)
  }, [reduce, data.length])

  const slide = data[index] ?? data[0]!
  const go = (dir: 1 | -1) =>
    setIndex((p) => (p + dir + data.length) % data.length)

  return (
    <section className="relative h-[78vh] min-h-[520px] w-full overflow-hidden text-white">
      {/* Animated gradient background per slide */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`bg-${index}`}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(120% 120% at 15% 20%, ${slide.accent[1]}55 0%, transparent 55%), linear-gradient(135deg, ${slide.accent[0]} 0%, ${slide.accent[1]} 130%)`,
          }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-grain opacity-[0.18]" />

      <div className="relative mx-auto flex h-full max-w-7xl items-center px-6">
        <div className="grid w-full items-center gap-8 md:grid-cols-2">
          {/* Copy */}
          <div className="max-w-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`copy-${index}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                  {slide.eyebrow}
                </p>
                <h1 className="font-display text-5xl font-semibold leading-[1.05] sm:text-7xl">
                  {slide.title}{' '}
                  <span className="italic text-gradient-ember">{slide.highlight}</span>
                </h1>
                <p className="mt-5 max-w-md text-base text-white/80 sm:text-lg">
                  {slide.subtitle}
                </p>
                <Link
                  href={slide.ctaHref}
                  className="group mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand-ink transition-all hover:gap-3 hover:bg-pink-50"
                >
                  {slide.ctaLabel}
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Floating bottle */}
          <div className="hidden justify-center md:flex">
            <AnimatePresence mode="wait">
              <motion.div
                key={`bottle-${index}`}
                initial={{ opacity: 0, y: 40, rotate: -6 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="animate-float-slow"
              >
                <Bottle liquid={slide.liquid} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-7 z-10 flex items-center justify-center gap-3">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => go(-1)}
          className="grid h-9 w-9 place-items-center rounded-full border border-white/40 text-white/80 transition hover:bg-white/10"
        >
          ‹
        </button>
        <div className="flex items-center gap-2">
          {data.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                i === index ? 'w-7 bg-white' : 'w-2 bg-white/40 hover:bg-white/70',
              )}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => go(1)}
          className="grid h-9 w-9 place-items-center rounded-full border border-white/40 text-white/80 transition hover:bg-white/10"
        >
          ›
        </button>
      </div>
    </section>
  )
}
