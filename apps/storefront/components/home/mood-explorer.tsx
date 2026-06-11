'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { SCENT_MOODS, moodHref, type ScentMood } from '@/lib/catalog/scent'
import { Reveal } from '@/components/motion/reveal'
import { cn } from '@/lib/utils/cn'

/** Gradient art panel previewing the active mood. */
function MoodPreview({ mood }: { mood: ScentMood }) {
  const [tint, deep] = mood.accent
  return (
    <motion.div
      key={mood.slug}
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.01 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 overflow-hidden rounded-3xl"
    >
      <div
        className="absolute inset-0"
        style={{ backgroundImage: `linear-gradient(150deg, ${tint} 0%, ${deep} 130%)` }}
      />
      <div className="absolute inset-0 bg-grain opacity-[0.14]" />
      <div
        className="absolute -right-12 -top-12 h-64 w-64 animate-aura rounded-full opacity-50 blur-3xl"
        style={{ backgroundColor: mood.aura }}
      />
      <div
        className="absolute -bottom-16 left-10 h-48 w-48 animate-aura rounded-full opacity-40 blur-3xl [animation-delay:-6s]"
        style={{ backgroundColor: deep }}
      />

      {/* Watermark */}
      <p
        aria-hidden
        className="pointer-events-none absolute -bottom-7 -right-2 select-none font-display text-[7.5rem] font-bold leading-none text-white/15"
      >
        {mood.label}
      </p>

      <div className="relative flex h-full flex-col justify-between p-8 text-white sm:p-10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/75">
            {mood.tagline}
          </p>
          <h3 className="mt-2 font-display text-5xl font-semibold italic sm:text-6xl">
            {mood.label}
          </h3>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/85">
            {mood.description}
          </p>
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            {mood.signatureNotes.map((note, i) => (
              <motion.span
                key={note}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                className="rounded-full border border-white/30 bg-white/15 px-3.5 py-1.5 text-xs font-medium backdrop-blur"
              >
                {note}
              </motion.span>
            ))}
          </div>
          <Link
            href={moodHref(mood.slug)}
            className="group mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-ink transition-all duration-300 hover:gap-3.5"
          >
            Explore {mood.label}
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * "Shop by Mood" — fragrance is bought on feeling, not category. Desktop pairs
 * a hoverable mood index with a live preview panel; mobile gets a snap rail of
 * gradient mood cards. Every mood links to its `/scents/[mood]` listing.
 */
export function MoodExplorer() {
  const [active, setActive] = useState(0)
  const mood = SCENT_MOODS[active] ?? SCENT_MOODS[0]!

  return (
    <section id="moods" className="scroll-mt-20 bg-brand-cream/60">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4 sm:mb-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-600">
              What are you in the mood for?
            </p>
            <h2 className="mt-2 font-display text-4xl font-semibold text-brand-ink sm:text-5xl">
              Shop by <span className="italic text-gradient-ember">Mood</span>
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-neutral-500">
            Seven scent personalities, blended for how you want to feel — not just
            who the bottle says it&apos;s for.
          </p>
        </Reveal>

        {/* Desktop: index + preview */}
        <div className="hidden gap-10 lg:grid lg:grid-cols-[0.9fr_1.1fr]">
          <ul className="flex flex-col" onMouseLeave={() => setActive(0)}>
            {SCENT_MOODS.map((m, i) => (
              <li key={m.slug} className="border-b border-brand-ink/10 first:border-t">
                <Link
                  href={moodHref(m.slug)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className={cn(
                    'group flex items-baseline gap-5 py-4 transition-all duration-300',
                    i === active ? 'pl-3' : 'pl-0',
                  )}
                >
                  <span
                    className={cn(
                      'font-display text-xs tabular-nums transition-colors',
                      i === active ? 'text-brand-gold' : 'text-neutral-400',
                    )}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={cn(
                      'font-display text-3xl font-semibold transition-colors duration-300',
                      i === active ? 'italic text-brand-ink' : 'text-neutral-400',
                    )}
                  >
                    {m.label}
                  </span>
                  <span
                    className={cn(
                      'hidden text-xs text-neutral-400 transition-opacity duration-300 xl:block',
                      i === active ? 'opacity-100' : 'opacity-0',
                    )}
                  >
                    {m.tagline}
                  </span>
                  <span
                    className={cn(
                      'ml-auto text-lg transition-all duration-300',
                      i === active
                        ? 'translate-x-0 text-brand-gold opacity-100'
                        : '-translate-x-2 opacity-0',
                    )}
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="relative min-h-[30rem]">
            <AnimatePresence mode="wait">
              <MoodPreview mood={mood} />
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile / tablet: snap rail of mood cards */}
        <ul className="no-scrollbar -mx-6 flex snap-x scroll-px-6 gap-4 overflow-x-auto px-6 pb-2 lg:hidden">
          {SCENT_MOODS.map((m) => {
            const [tint, deep] = m.accent
            return (
              <li key={m.slug} className="w-60 shrink-0 snap-start">
                <Link
                  href={moodHref(m.slug)}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-3xl p-6 text-white shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-hover"
                >
                  <div
                    className="absolute inset-0 transition-transform duration-700 ease-smooth group-hover:scale-105"
                    style={{
                      backgroundImage: `linear-gradient(160deg, ${tint} 0%, ${deep} 135%)`,
                    }}
                  />
                  <div className="absolute inset-0 bg-grain opacity-[0.14]" />
                  <div
                    className="absolute -right-8 -top-8 h-36 w-36 animate-aura rounded-full opacity-50 blur-2xl"
                    style={{ backgroundColor: m.aura }}
                  />
                  <div className="relative flex h-full flex-col">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/80">
                      {m.tagline}
                    </p>
                    <h3 className="mt-1.5 font-display text-3xl font-semibold italic">
                      {m.label}
                    </h3>
                    <div className="mt-auto">
                      <p className="text-xs text-white/85">
                        {m.signatureNotes.join(' · ')}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold">
                        Explore
                        <span className="transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
