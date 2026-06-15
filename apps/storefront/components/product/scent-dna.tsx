'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { moodHref, scentProfile } from '@/lib/catalog/scent'
import { cn } from '@/lib/utils/cn'

const TIER_META = [
  { key: 'top', label: 'Top', life: 'First 15 minutes', color: '#D9B45A' },
  { key: 'heart', label: 'Heart', life: '15 min – 2 hours', color: '#2FA37A' },
  { key: 'base', label: 'Base', life: '2 – 12 hours', color: '#0B5038' },
] as const

const EASE = [0.22, 1, 0.36, 1] as const

function Meter({
  label,
  value,
  display,
}: {
  label: string
  /** 0–5 fill. */
  value: number
  display: string
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
        {label}
      </p>
      <div className="mt-2 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ scaleY: 0.3, opacity: 0.3 }}
            whileInView={{ scaleY: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.06, duration: 0.35, ease: EASE }}
            className={cn(
              'h-3.5 w-5 origin-bottom rounded-sm',
              i < value
                ? 'bg-gradient-to-t from-pink-700 to-brand-gold'
                : 'bg-neutral-200',
            )}
          />
        ))}
      </div>
      <p className="mt-1.5 text-sm font-semibold text-brand-ink">{display}</p>
    </div>
  )
}

/**
 * Animated "Scent DNA" panel for the PDP — the note pyramid told as a
 * timeline, with wear meters (intensity, longevity, sillage) and the product's
 * mood linking back to its mood listing. Profile is derived from the product
 * handle, identical to cards and mood pages.
 */
export function ScentDna({ seed }: { seed: string }) {
  const profile = scentProfile(seed)
  const tiers = [profile.top, profile.heart, profile.base]
  const sillageFill =
    profile.sillage === 'Intimate' ? 2 : profile.sillage === 'Moderate' ? 3 : 5
  const longevityFill = profile.longevityHours === 8 ? 3 : profile.longevityHours === 10 ? 4 : 5

  return (
    <section className="mt-9 overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-b from-brand-cream to-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pink-100/80 px-5 py-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-pink-600">
          Scent DNA
        </p>
        <Link
          href={moodHref(profile.mood.slug)}
          className="group inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-ink shadow-sm transition-colors hover:text-pink-600"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: profile.mood.aura }}
          />
          {profile.mood.label} mood
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </div>

      <div className="px-5 py-6 sm:px-6">
        {/* Note timeline */}
        <ol className="relative space-y-6">
          {/* connecting line */}
          <motion.span
            aria-hidden
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE }}
            className="absolute bottom-3 left-[7px] top-3 w-px origin-top bg-gradient-to-b from-[#D9B45A] via-[#2FA37A] to-[#0B5038]"
          />
          {TIER_META.map((tier, i) => (
            <motion.li
              key={tier.key}
              initial={{ opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.14, duration: 0.5, ease: EASE }}
              className="relative flex gap-4 pl-7"
            >
              <span
                aria-hidden
                className="absolute left-0 top-1 h-[15px] w-[15px] rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: tier.color }}
              />
              <div className="min-w-0">
                <p className="flex flex-wrap items-baseline gap-x-2.5">
                  <span className="font-display text-base font-semibold text-brand-ink">
                    {tier.label} Notes
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.14em] text-neutral-400">
                    {tier.life}
                  </span>
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tiers[i]!.map((note) => (
                    <span
                      key={note}
                      className="rounded-full border bg-white px-3 py-1 text-xs font-medium text-brand-ink"
                      style={{ borderColor: `${tier.color}55` }}
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            </motion.li>
          ))}
        </ol>

        {/* Wear meters */}
        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-pink-100/80 pt-6">
          <Meter
            label="Intensity"
            value={profile.intensity}
            display={profile.intensityLabel}
          />
          <Meter
            label="Longevity"
            value={longevityFill}
            display={`~${profile.longevityHours} hours`}
          />
          <Meter label="Sillage" value={sillageFill} display={profile.sillage} />
        </div>

        <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs text-neutral-600 shadow-sm">
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5 text-brand-gold"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
          >
            <path d="M12 3v2M5.6 5.6L7 7M3 12h2M19 12h2M17 7l1.4-1.4M12 21a6 6 0 006-6c0-3-2.5-5.5-6-9-3.5 3.5-6 6-6 9a6 6 0 006 6z" />
          </svg>
          Best worn for{' '}
          <span className="font-semibold text-brand-ink">{profile.occasion}</span>
        </p>
      </div>
    </section>
  )
}
