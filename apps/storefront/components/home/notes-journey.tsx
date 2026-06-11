'use client'

import { useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'motion/react'
import { cn } from '@/lib/utils/cn'

interface Stage {
  n: string
  tier: string
  life: string
  heading: string
  copy: string
  notes: [string, string, string]
  color: string
}

const STAGES: Stage[] = [
  {
    n: '01',
    tier: 'Top Notes',
    life: 'The first 15 minutes',
    heading: 'The spark of first impressions',
    copy: 'Bright, sparkling molecules that lift off the skin the moment you roll. They open the story — citrus, spice and dew — then gracefully step aside.',
    notes: ['Bergamot', 'Pink Pepper', 'Mandarin'],
    color: '#E8A04C',
  },
  {
    n: '02',
    tier: 'Heart Notes',
    life: '15 minutes – 2 hours',
    heading: 'The soul of the scent',
    copy: 'As the sparkle settles, the heart blooms. Florals and soft spice round into the signature people will remember you by.',
    notes: ['Damask Rose', 'Jasmine', 'Orris'],
    color: '#C9692F',
  },
  {
    n: '03',
    tier: 'Base Notes',
    life: '2 – 12 hours',
    heading: 'The memory it leaves',
    copy: 'Deep resins, woods and musks that anchor into skin and linger long after you leave. This is the part that stays with them.',
    notes: ['Oud', 'Amber', 'Sandalwood'],
    color: '#8C4A1A',
  },
]

/**
 * Scroll-driven fragrance anatomy. The section pins for three viewport-heights
 * while the flacon fills, the liquid deepens from top- to base-note tones and
 * each tier of the pyramid takes the stage. Pure scroll-linked motion — it
 * plays forwards and backwards with the user's thumb.
 */
export function NotesJourney() {
  const ref = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState(0)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    setStage(Math.min(STAGES.length - 1, Math.floor(p * STAGES.length)))
  })

  const liquidHeight = useTransform(scrollYProgress, [0.04, 0.92], ['14%', '84%'])
  const liquidColor = useTransform(
    scrollYProgress,
    [0.12, 0.5, 0.88],
    STAGES.map((s) => s.color),
  )
  const railFill = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  const active = STAGES[stage] ?? STAGES[0]!

  return (
    <section ref={ref} className="relative h-[320vh] bg-[#16100C] text-white">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* Ambient glow follows the liquid colour */}
        <motion.div
          aria-hidden
          style={{ backgroundColor: liquidColor }}
          className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
        />
        <div className="absolute inset-0 bg-grain opacity-[0.14]" />

        {/* Stage number watermark */}
        <AnimatePresence mode="wait">
          <motion.p
            key={active.n}
            aria-hidden
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute -left-4 bottom-4 select-none font-display text-[10rem] font-bold leading-none text-stroke-white opacity-50 sm:text-[16rem] lg:left-8"
          >
            {active.n}
          </motion.p>
        </AnimatePresence>

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-6 md:grid-cols-[1fr_auto_1fr] md:gap-14">
          {/* Copy — changes per stage */}
          <div className="order-2 min-h-[16rem] max-w-md md:order-1 md:justify-self-end md:text-right">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-gold md:hidden">
              Anatomy of a scent
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={active.tier}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.3em]"
                  style={{ color: active.color }}
                >
                  {active.tier} · {active.life}
                </p>
                <h3 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
                  {active.heading}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
                  {active.copy}
                </p>
                <div className="mt-6 flex flex-wrap gap-2 md:justify-end">
                  {active.notes.map((note, i) => (
                    <motion.span
                      key={note}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.09, duration: 0.35 }}
                      className="rounded-full border border-white/20 bg-white/[0.07] px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur"
                    >
                      {note}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Filling flacon */}
          <div className="order-1 justify-self-center md:order-2">
            <p className="mb-6 hidden text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50 md:block">
              Anatomy of a scent
            </p>
            <div className="relative h-72 w-32 sm:h-96 sm:w-40">
              {/* cap */}
              <div className="absolute left-1/2 top-0 h-10 w-10 -translate-x-1/2 rounded-md bg-gradient-to-b from-[#E8C26A] via-[#B8902E] to-[#8A6A1F] sm:h-12 sm:w-12" />
              <div className="absolute left-1/2 top-9 h-3 w-7 -translate-x-1/2 bg-white/25 sm:top-11" />
              {/* glass */}
              <div className="absolute left-1/2 top-12 h-[14.5rem] w-28 -translate-x-1/2 overflow-hidden rounded-[1.8rem] border border-white/30 bg-white/[0.08] backdrop-blur-sm sm:top-14 sm:h-[19.5rem] sm:w-36">
                {/* liquid — height and colour are scroll-linked */}
                <motion.div
                  style={{ height: liquidHeight, backgroundColor: liquidColor }}
                  className="absolute inset-x-0 bottom-0"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-white/40 blur-[1px]" />
                  {/* rising bubbles */}
                  {[20, 45, 70].map((left, i) => (
                    <span
                      key={left}
                      className="absolute bottom-0 h-2 w-2 animate-rise rounded-full bg-white/30"
                      style={{ left: `${left}%`, animationDelay: `${i * 2.1}s` }}
                    />
                  ))}
                </motion.div>
                {/* specular highlight */}
                <div className="absolute bottom-4 left-2.5 top-4 w-3.5 rounded-full bg-white/20 blur-[2px]" />
              </div>
              {/* floor shadow */}
              <div className="absolute -bottom-2 left-1/2 h-4 w-32 -translate-x-1/2 rounded-full bg-black/50 blur-lg sm:w-40" />
            </div>
          </div>

          {/* Tier rail */}
          <div className="order-3 hidden md:block">
            <div className="flex items-stretch gap-5">
              <div className="relative w-px self-stretch bg-white/15">
                <motion.span
                  style={{ height: railFill }}
                  className="absolute inset-x-0 top-0 bg-gradient-to-b from-brand-gold to-pink-600"
                />
              </div>
              <ul className="space-y-10 py-2">
                {STAGES.map((s, i) => (
                  <li key={s.tier}>
                    <button
                      type="button"
                      onClick={() =>
                        ref.current?.ownerDocument.defaultView?.scrollTo({
                          top:
                            (ref.current?.offsetTop ?? 0) +
                            (ref.current?.offsetHeight ?? 0) *
                              ((i + 0.5) / STAGES.length),
                          behavior: 'smooth',
                        })
                      }
                      className="group flex items-center gap-3 text-left"
                    >
                      <span
                        className={cn(
                          'grid h-3 w-3 place-items-center rounded-full border transition-all duration-300',
                          i === stage
                            ? 'scale-125 border-brand-gold bg-brand-gold'
                            : 'border-white/30 group-hover:border-white/60',
                        )}
                      />
                      <span>
                        <span
                          className={cn(
                            'block text-sm font-semibold transition-colors',
                            i === stage ? 'text-white' : 'text-white/40',
                          )}
                        >
                          {s.tier}
                        </span>
                        <span className="block text-[11px] text-white/35">{s.life}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
