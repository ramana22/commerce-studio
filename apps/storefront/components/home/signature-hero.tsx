'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { Stars } from '@/components/ui/stars'
import { cn } from '@/lib/utils/cn'

interface Edition {
  id: string
  kicker: string
  /** Headline pieces — `highlight` renders in italic gradient. */
  lead: string
  highlight: string
  tail?: string
  subtitle: string
  ctaLabel: string
  ctaHref: string
  /** Bottle liquid gradient [light, deep]. */
  liquid: [string, string]
  /** Scene aura colour. */
  aura: string
  /** Background [base, accent]. */
  bg: [string, string]
  /** Orbiting note chips. */
  notes: [string, string, string]
  /** Engraved on the bottle label. */
  edition: string
}

const EDITIONS: Edition[] = [
  {
    id: 'amber',
    kicker: 'The Signature Collection',
    lead: 'Find Your',
    highlight: 'Signature',
    tail: 'Scent',
    subtitle:
      'Alcohol-free perfume oils that melt into skin and stay for twelve hours. Crafted to be unmistakably yours.',
    ctaLabel: 'Shop Bestsellers',
    ctaHref: '/bestsellers',
    liquid: ['#E8A04C', '#B5571F'],
    aura: '#C9692F',
    bg: ['#16100C', '#B5571F'],
    notes: ['Saffron', 'Amber', 'Cedarwood'],
    edition: 'Nº 01 · Amber Oud',
  },
  {
    id: 'bloom',
    kicker: 'For Her · Velvet Bloom',
    lead: 'Scents That',
    highlight: 'Stay',
    tail: 'With You',
    subtitle:
      'Damask rose, night jasmine and a trail of soft musk — a love letter you wear on your pulse points.',
    ctaLabel: 'Explore For Her',
    ctaHref: '/for-her',
    liquid: ['#E58AA6', '#B23A5E'],
    aura: '#C9698B',
    bg: ['#1B1014', '#B45A7C'],
    notes: ['Damask Rose', 'Peony', 'Soft Musk'],
    edition: 'Nº 02 · Velvet Bloom',
  },
  {
    id: 'noir',
    kicker: 'For Him · Noir Vetiver',
    lead: 'Leave a',
    highlight: 'Lasting',
    tail: 'Trace',
    subtitle:
      'Smoked woods, leather and cold spice with serious staying power. Quiet in a room, impossible to forget.',
    ctaLabel: 'Shop For Him',
    ctaHref: '/for-him',
    liquid: ['#A07850', '#5F4632'],
    aura: '#8A6A4F',
    bg: ['#0F0D0B', '#6B4A2F'],
    notes: ['Vetiver', 'Leather', 'Tobacco'],
    edition: 'Nº 03 · Noir Vetiver',
  },
]

const ROTATE_MS = 7000

/** Refined glass flacon — gold cap, liquid gradient, label and reflection. */
function Flacon({ edition }: { edition: Edition }) {
  const [light, deep] = edition.liquid
  return (
    <div className="relative h-[22rem] w-44 sm:h-[26rem] sm:w-52">
      {/* aura */}
      <div
        className="absolute -inset-10 animate-glow rounded-full blur-3xl"
        style={{ backgroundColor: edition.aura, opacity: 0.4 }}
      />

      {/* cap */}
      <div className="absolute left-1/2 top-0 h-16 w-14 -translate-x-1/2 overflow-hidden rounded-lg bg-gradient-to-b from-[#E8C26A] via-[#B8902E] to-[#8A6A1F] shadow-lg sm:h-[4.5rem] sm:w-16">
        <div className="absolute inset-y-0 left-1/4 w-1 bg-white/30" />
        <div className="absolute inset-y-0 right-1/4 w-0.5 bg-black/20" />
      </div>
      {/* collar */}
      <div className="absolute left-1/2 top-[3.9rem] h-4 w-9 -translate-x-1/2 rounded-sm bg-gradient-to-b from-white/50 to-white/20 sm:top-[4.4rem]" />

      {/* glass body */}
      <div className="absolute left-1/2 top-[4.7rem] h-[16.5rem] w-40 -translate-x-1/2 overflow-hidden rounded-[2rem] border border-white/30 bg-white/10 shadow-glow backdrop-blur-sm sm:top-[5.3rem] sm:h-[19.5rem] sm:w-[11.5rem]">
        {/* liquid */}
        <div
          className="absolute inset-x-0 bottom-0 h-[78%]"
          style={{
            background: `linear-gradient(180deg, ${light}d9 0%, ${deep} 90%)`,
          }}
        />
        {/* meniscus shine */}
        <div
          className="absolute inset-x-0 top-[22%] h-1.5 rounded-full opacity-70 blur-[1px]"
          style={{ backgroundColor: light }}
        />
        {/* specular highlights */}
        <div className="absolute bottom-4 left-3.5 top-4 w-5 rounded-full bg-white/25 blur-[2px]" />
        <div className="absolute bottom-8 right-4 top-10 w-1.5 rounded-full bg-white/15" />

        {/* label */}
        <div className="absolute inset-x-5 top-[37%] rounded-md bg-[#FBF5EE]/95 px-2 py-3 text-center shadow-sm">
          <p className="font-display text-[11px] font-semibold tracking-[0.26em] text-brand-ink">
            BODYSCENT
          </p>
          <div className="mx-auto my-1.5 h-px w-8 bg-brand-gold" />
          <p className="text-[8px] uppercase tracking-[0.2em] text-neutral-500">
            {edition.edition}
          </p>
          <p className="mt-0.5 text-[7px] uppercase tracking-[0.16em] text-neutral-400">
            Pure Perfume Oil
          </p>
        </div>
      </div>

      {/* floor reflection */}
      <div
        className="absolute left-1/2 top-[21.5rem] h-16 w-40 -translate-x-1/2 scale-y-[-1] rounded-[2rem] opacity-20 blur-[2px] sm:top-[25rem] sm:w-[11.5rem]"
        style={{
          background: `linear-gradient(0deg, transparent 30%, ${deep} 100%)`,
          maskImage: 'linear-gradient(180deg, black, transparent 70%)',
          WebkitMaskImage: 'linear-gradient(180deg, black, transparent 70%)',
        }}
      />
      <div className="absolute left-1/2 top-[21.7rem] h-5 w-48 -translate-x-1/2 rounded-full bg-black/40 blur-xl sm:top-[25.2rem]" />
    </div>
  )
}

/** Glassmorphic note chip orbiting the flacon. */
function NoteChip({
  label,
  className,
  delay,
}: {
  label: string
  className?: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.94 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn('absolute', className)}
    >
      <div className="flex animate-float items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-medium text-white/90 shadow-card backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
        {label}
      </div>
    </motion.div>
  )
}

export function SignatureHero() {
  const [index, setIndex] = useState(0)
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)

  // Mouse parallax — the scene leans gently toward the cursor.
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const smx = useSpring(mx, { stiffness: 60, damping: 18 })
  const smy = useSpring(my, { stiffness: 60, damping: 18 })
  const bottleX = useTransform(smx, [-0.5, 0.5], [-14, 14])
  const bottleYMouse = useTransform(smy, [-0.5, 0.5], [-10, 10])
  const auraX = useTransform(smx, [-0.5, 0.5], [26, -26])
  const auraY = useTransform(smy, [-0.5, 0.5], [20, -20])

  // Scroll parallax — the flacon drifts up slower than the page.
  const { scrollY } = useScroll()
  const bottleYScroll = useTransform(scrollY, [0, 700], [0, 110])
  const copyY = useTransform(scrollY, [0, 700], [0, 50])

  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => setIndex((p) => (p + 1) % EDITIONS.length), ROTATE_MS)
    return () => clearInterval(id)
  }, [reduce, index])

  const ed = EDITIONS[index] ?? EDITIONS[0]!

  return (
    <section
      ref={sectionRef}
      onMouseMove={(e) => {
        if (reduce) return
        const r = sectionRef.current?.getBoundingClientRect()
        if (!r) return
        mx.set((e.clientX - r.left) / r.width - 0.5)
        my.set((e.clientY - r.top) / r.height - 0.5)
      }}
      onMouseLeave={() => {
        mx.set(0)
        my.set(0)
      }}
      className="relative min-h-[92vh] w-full overflow-hidden text-white"
    >
      {/* Scene background */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`bg-${index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(110% 90% at 78% 30%, ${ed.bg[1]}66 0%, transparent 55%), radial-gradient(80% 80% at 10% 90%, ${ed.bg[1]}33 0%, transparent 50%), linear-gradient(160deg, ${ed.bg[0]} 30%, ${ed.bg[1]}99 160%)`,
          }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-grain opacity-[0.16]" />

      {/* Drifting aura blobs */}
      <motion.div
        aria-hidden
        style={{ x: auraX, y: auraY, backgroundColor: ed.aura }}
        className="absolute right-[8%] top-[14%] h-72 w-72 animate-aura rounded-full opacity-30 blur-3xl transition-colors duration-1000"
      />
      <div className="absolute bottom-[12%] left-[4%] h-56 w-56 animate-aura rounded-full bg-brand-gold/20 blur-3xl [animation-delay:-7s]" />

      {/* Rising mist particles */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {[14, 32, 55, 71, 88].map((left, i) => (
          <span
            key={left}
            className="absolute bottom-0 h-24 w-24 animate-rise rounded-full bg-white/[0.05] blur-2xl"
            style={{ left: `${left}%`, animationDelay: `${i * 1.6}s` }}
          />
        ))}
      </div>

      {/* Watermark */}
      <p
        aria-hidden
        className="pointer-events-none absolute -right-6 top-1/2 hidden -translate-y-1/2 select-none font-display text-[11rem] font-bold leading-none tracking-tight text-stroke-white opacity-60 lg:block xl:text-[15rem]"
      >
        SCENT
      </p>

      <div className="relative mx-auto grid min-h-[92vh] max-w-7xl items-center gap-10 px-6 pb-28 pt-16 md:grid-cols-[1.1fr_0.9fr] md:pb-24">
        {/* Copy */}
        <motion.div style={reduce ? undefined : { y: copyY }} className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`copy-${index}`}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/[0.07] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/80 backdrop-blur">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-brand-gold" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-gold" />
                </span>
                {ed.kicker}
              </p>

              <h1 className="mt-6 font-display text-[2.9rem] font-semibold leading-[1.02] sm:text-7xl lg:text-[5.2rem]">
                {ed.lead}{' '}
                <span className="italic text-gradient-ember">{ed.highlight}</span>
                {ed.tail ? (
                  <>
                    {' '}
                    <span className="whitespace-nowrap">{ed.tail}</span>
                  </>
                ) : null}
              </h1>

              <p className="mt-6 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">
                {ed.subtitle}
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href={ed.ctaHref}
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-brand-ink shadow-glow transition-all duration-300 hover:gap-3.5 hover:bg-pink-50"
                >
                  {ed.ctaLabel}
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
                <Link
                  href="#moods"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-4 text-sm font-semibold text-white/90 backdrop-blur transition-colors hover:border-brand-gold hover:text-brand-gold"
                >
                  Explore by Mood
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Social proof — constant across editions */}
          <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-white/10 pt-6">
            <div className="flex -space-x-2.5">
              {['SK', 'AR', 'MJ', 'TD'].map((initials, i) => (
                <span
                  key={initials}
                  className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#16100C] text-[10px] font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${['#CC6E2C', '#B45A7C', '#6B4A2F', '#C9923E'][i]}, #1A1310)`,
                  }}
                >
                  {initials}
                </span>
              ))}
            </div>
            <div>
              <span className="flex items-center gap-2">
                <Stars rating={4.9} className="text-sm [&_.text-pink-600]:text-brand-gold" />
                <span className="text-sm font-semibold">4.9</span>
              </span>
              <p className="text-xs text-white/60">12,400+ verified five-star wearers</p>
            </div>
          </div>
        </motion.div>

        {/* Flacon scene */}
        <motion.div
          style={reduce ? undefined : { x: bottleX, y: bottleYScroll }}
          className="relative hidden justify-center md:flex"
        >
          <motion.div style={reduce ? undefined : { y: bottleYMouse }}>
            {/* Spinning gold halo */}
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 animate-spin-slow rounded-full opacity-25"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0%, #C9923E 12%, transparent 26%, transparent 55%, #C9923E66 68%, transparent 80%)',
                maskImage: 'radial-gradient(closest-side, transparent 78%, black 80%)',
                WebkitMaskImage: 'radial-gradient(closest-side, transparent 78%, black 80%)',
              }}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={`flacon-${index}`}
                initial={{ opacity: 0, y: 46, rotate: -5 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -34, rotate: 4 }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                className="animate-float-slow"
              >
                <Flacon edition={ed} />
              </motion.div>
            </AnimatePresence>

            {/* Orbiting notes */}
            <AnimatePresence mode="wait">
              <div key={`notes-${index}`}>
                <NoteChip label={ed.notes[0]} delay={0.25} className="-left-24 top-12" />
                <NoteChip
                  label={ed.notes[1]}
                  delay={0.4}
                  className="-right-24 top-1/2 [&>div]:[animation-delay:-2s]"
                />
                <NoteChip
                  label={ed.notes[2]}
                  delay={0.55}
                  className="-left-16 bottom-16 [&>div]:[animation-delay:-4s]"
                />
              </div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>

      {/* Edition tabs + progress */}
      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-white/10 bg-black/10 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-stretch justify-between px-6">
          <div className="flex">
            {EDITIONS.map((e, i) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${e.edition}`}
                className={cn(
                  'relative px-4 py-4 text-left transition-colors sm:px-6',
                  i === index ? 'text-white' : 'text-white/45 hover:text-white/75',
                )}
              >
                <span className="block text-[10px] font-semibold uppercase tracking-[0.22em]">
                  {e.edition}
                </span>
                {/* timing bar */}
                <span className="absolute inset-x-4 top-0 h-px bg-white/15 sm:inset-x-6">
                  {i === index ? (
                    <motion.span
                      key={`progress-${index}`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{
                        duration: reduce ? 0 : ROTATE_MS / 1000,
                        ease: 'linear',
                      }}
                      className="absolute inset-0 origin-left bg-brand-gold"
                    />
                  ) : null}
                </span>
              </button>
            ))}
          </div>

          <a
            href="#moods"
            className="hidden items-center gap-3 py-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/55 transition-colors hover:text-white sm:flex"
          >
            Scroll to explore
            <span className="relative h-8 w-px overflow-hidden bg-white/20">
              <span className="absolute inset-x-0 top-0 h-3 animate-rise bg-brand-gold [animation-duration:2.2s]" />
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
