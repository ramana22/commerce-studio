import Link from 'next/link'
import { AppImage } from '@/components/ui/app-image'
import { Reveal } from '@/components/motion/reveal'

export interface BrandStoryData {
  eyebrow?: string
  heading?: string
  highlight?: string
  body?: string
  artWord?: string
  stats?: { value: string; label: string }[]
  ctaLabel?: string
  ctaHref?: string
}

const DEFAULTS: Required<Omit<BrandStoryData, 'stats'>> & {
  stats: { value: string; label: string }[]
} = {
  eyebrow: 'Our promise',
  heading: 'Fragrance,',
  highlight: 'reimagined.',
  body: "We blend skin-safe, alcohol-free perfume oils inspired by the world's most coveted scents — so you can wear what you love, longer, without the luxury price tag. Every roll-on is filled fresh and sealed by hand.",
  artWord: 'Eau de You',
  ctaLabel: 'Discover the collection →',
  ctaHref: '/bestsellers',
  stats: [
    { value: '200+', label: 'Signature blends' },
    { value: '12h', label: 'Average wear' },
    { value: '50k+', label: 'Happy noses' },
  ],
}

/** Keep only set values so blank Sanity fields fall back to the defaults. */
function defined<T extends object>(o?: T): Partial<T> {
  if (!o) return {}
  return Object.fromEntries(
    Object.entries(o).filter(([, v]) => v !== undefined && v !== ''),
  ) as Partial<T>
}

/** Editorial split section — the "why BodyScent" story with layered gradient art. */
export function BrandStory({ data }: { data?: BrandStoryData }) {
  const d = { ...DEFAULTS, ...defined(data) }
  const stats = data?.stats?.length ? data.stats : DEFAULTS.stats

  return (
    <section className="bg-ember-sheen text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 md:grid-cols-2">
        {/* Art */}
        <Reveal y={32} className="order-2 md:order-1">
          <div className="relative h-80 overflow-hidden rounded-3xl border border-white/10 sm:h-96">
            <AppImage
              src="/images/campaign/story-atelier.webp"
              alt="The BodyScent atelier — oils resting on the blending bench"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/25" />
            <div className="absolute inset-0 bg-grain opacity-20" />
            <div className="absolute -right-10 top-10 h-40 w-40 animate-float rounded-full bg-pink-400/30 blur-2xl" />
            <div className="absolute bottom-8 left-8 h-28 w-28 animate-float-slow rounded-full bg-brand-gold/30 blur-2xl" />
            <div className="relative flex h-full items-center justify-center">
              <p className="font-display text-6xl font-semibold italic text-white/90 drop-shadow">
                {d.artWord}
              </p>
            </div>
          </div>
        </Reveal>

        {/* Copy */}
        <Reveal delay={0.1} className="order-1 md:order-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-300">
            {d.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            {d.heading} <span className="italic text-gradient-ember">{d.highlight}</span>
          </h2>
          <p className="mt-5 max-w-md text-white/75">{d.body}</p>
          <div className="mt-8 grid max-w-md grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl font-semibold text-gradient-ember">{s.value}</p>
                <p className="mt-1 text-xs text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
          {d.ctaLabel ? (
            <Link
              href={d.ctaHref}
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand-ink transition-all hover:gap-3"
            >
              {d.ctaLabel}
            </Link>
          ) : null}
        </Reveal>
      </div>
    </section>
  )
}
