import Link from 'next/link'
import { NAV_CATEGORIES } from '@/lib/catalog/nav'
import { Reveal } from '@/components/motion/reveal'
import { StaggerGroup, StaggerItem } from '@/components/motion/stagger'

/** Animated "Shop by Genre" tiles, driven by the nav category metadata. */
export function CategoryShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <Reveal className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-600">
          Find your match
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-brand-ink sm:text-4xl">
          Shop by Genre
        </h2>
      </Reveal>

      <StaggerGroup className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {NAV_CATEGORIES.map((c) => (
          <StaggerItem key={c.slug}>
            <Link
              href={`/${c.slug}`}
              className="group relative block h-44 overflow-hidden rounded-2xl border border-neutral-200/70 p-4 text-white shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:shadow-hover"
            >
              <div
                className="absolute inset-0 transition-transform duration-700 ease-smooth group-hover:scale-110"
                style={{
                  backgroundImage: `linear-gradient(150deg, ${c.accent?.[0] ?? '#F8E7D6'}, ${c.accent?.[1] ?? '#B5571F'})`,
                }}
              />
              <div className="absolute inset-0 bg-grain opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="relative flex h-full flex-col justify-end">
                <p className="font-display text-lg font-semibold drop-shadow">{c.label}</p>
                <p className="text-[11px] text-white/85">{c.tagline}</p>
                <span className="mt-2 inline-flex translate-y-1 items-center gap-1 text-xs font-semibold opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  Shop now →
                </span>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  )
}
