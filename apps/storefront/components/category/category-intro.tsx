import { Reveal } from '@/components/motion/reveal'

/**
 * Default category banner used when Sanity has no `CategoryBanner` configured.
 * Pure-gradient art (driven by the nav accent) so it always renders without
 * media assets.
 */
export function CategoryIntro({
  heading,
  tagline,
  count,
  accent,
}: {
  heading: string
  tagline?: string
  count: number
  accent?: [string, string]
}) {
  return (
    <section className="relative overflow-hidden text-white">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(120% 140% at 80% 10%, ${accent?.[1] ?? '#B5571F'}66 0%, transparent 55%), linear-gradient(135deg, ${accent?.[0] ?? '#1A1310'}, ${accent?.[1] ?? '#B5571F'})`,
        }}
      />
      <div className="absolute inset-0 bg-grain opacity-15" />
      <div className="absolute -right-10 top-6 h-44 w-44 animate-float rounded-full bg-white/10 blur-2xl" />

      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
            {count} {count === 1 ? 'fragrance' : 'fragrances'}
          </p>
          <h1 className="mt-2 font-display text-5xl font-semibold sm:text-6xl">
            {heading}
          </h1>
          {tagline ? (
            <p className="mt-3 max-w-md text-white/80">{tagline}</p>
          ) : null}
        </Reveal>
      </div>
    </section>
  )
}
