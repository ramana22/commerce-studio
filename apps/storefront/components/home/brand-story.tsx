import Link from 'next/link'
import { Reveal } from '@/components/motion/reveal'

/** Editorial split section — the "why BodyScent" story with layered gradient art. */
export function BrandStory() {
  return (
    <section className="bg-ember-sheen text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 md:grid-cols-2">
        {/* Art */}
        <Reveal y={32} className="order-2 md:order-1">
          <div className="relative h-80 overflow-hidden rounded-3xl border border-white/10 sm:h-96">
            <div className="absolute inset-0 animate-gradient-x bg-ember-animated" />
            <div className="absolute inset-0 bg-grain opacity-20" />
            <div className="absolute -right-10 top-10 h-40 w-40 animate-float rounded-full bg-pink-400/40 blur-2xl" />
            <div className="absolute bottom-8 left-8 h-28 w-28 animate-float-slow rounded-full bg-brand-gold/40 blur-2xl" />
            <div className="relative flex h-full items-center justify-center">
              <p className="font-display text-6xl font-semibold italic text-white/90">
                Eau de You
              </p>
            </div>
          </div>
        </Reveal>

        {/* Copy */}
        <Reveal delay={0.1} className="order-1 md:order-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-300">
            Our promise
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Fragrance, <span className="italic text-gradient-ember">reimagined.</span>
          </h2>
          <p className="mt-5 max-w-md text-white/75">
            We blend skin-safe, alcohol-free perfume oils inspired by the world&apos;s
            most coveted scents — so you can wear what you love, longer, without the
            luxury price tag. Every roll-on is filled fresh and sealed by hand.
          </p>
          <div className="mt-8 grid max-w-md grid-cols-3 gap-4">
            {[
              ['200+', 'Signature blends'],
              ['12h', 'Average wear'],
              ['50k+', 'Happy noses'],
            ].map(([stat, label]) => (
              <div key={label}>
                <p className="font-display text-3xl font-semibold text-gradient-ember">{stat}</p>
                <p className="mt-1 text-xs text-white/60">{label}</p>
              </div>
            ))}
          </div>
          <Link
            href="/bestsellers"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand-ink transition-all hover:gap-3"
          >
            Discover the collection →
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
