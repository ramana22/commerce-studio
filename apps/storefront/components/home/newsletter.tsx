'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Reveal } from '@/components/motion/reveal'

export interface NewsletterData {
  eyebrow?: string
  heading?: string
  highlight?: string
  subtitle?: string
  placeholder?: string
  buttonLabel?: string
  successText?: string
}

const DEFAULTS: Required<NewsletterData> = {
  eyebrow: 'Join the list',
  heading: 'Get',
  highlight: '15% off',
  subtitle: 'Scent drops, restocks and members-only offers — straight to your inbox.',
  placeholder: 'you@example.com',
  buttonLabel: 'Subscribe',
  successText: "✓ You're in — check your inbox for the code.",
}

/** Keep only set values so blank Sanity fields fall back to the defaults. */
function defined<T extends object>(o?: T): Partial<T> {
  if (!o) return {}
  return Object.fromEntries(
    Object.entries(o).filter(([, v]) => v !== undefined && v !== ''),
  ) as Partial<T>
}

/** Email capture with an optimistic, animated success state (no backend). */
export function Newsletter({ data }: { data?: NewsletterData }) {
  const d = { ...DEFAULTS, ...defined(data) }
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-pink-100 bg-brand-cream px-6 py-12 text-center sm:py-16">
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 animate-float rounded-full bg-pink-200/50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-10 h-48 w-48 animate-float-slow rounded-full bg-brand-gold/30 blur-3xl" />

          <div className="relative mx-auto max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-600">
              {d.eyebrow}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-brand-ink sm:text-4xl">
              {d.heading} <span className="italic text-gradient-ember">{d.highlight}</span>
            </h2>
            <p className="mt-3 text-sm text-neutral-500">{d.subtitle}</p>

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.p
                  key="done"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-pink-600 px-6 py-3 text-sm font-semibold text-white"
                >
                  {d.successText}
                </motion.p>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (email.trim()) setSent(true)
                  }}
                  className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={d.placeholder}
                    className="h-12 flex-1 rounded-full border border-neutral-300 bg-white px-5 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                  />
                  <button
                    type="submit"
                    className="h-12 rounded-full bg-brand-ink px-7 text-sm font-semibold text-white transition-all hover:bg-pink-600"
                  >
                    {d.buttonLabel}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
