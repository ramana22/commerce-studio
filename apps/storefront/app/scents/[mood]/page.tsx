import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  findMood,
  moodArtUrl,
  moodHref,
  SCENT_MOODS,
  scentProfile,
} from '@/lib/catalog/scent'
import { getProductCards } from '@/lib/catalog/product-service'
import { FilteredProducts } from '@/components/plp/filtered-products'
import { AppImage } from '@/components/ui/app-image'
import { Reveal } from '@/components/motion/reveal'
import { cn } from '@/lib/utils/cn'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mood: string }>
}): Promise<Metadata> {
  const { mood } = await params
  const m = findMood(mood)
  if (!m) return { title: 'Scents' }
  return {
    title: `${m.label} Fragrances`,
    description: `${m.tagline}. ${m.description}`,
  }
}

export default async function MoodPage({
  params,
}: {
  params: Promise<{ mood: string }>
}) {
  const { mood } = await params
  const m = findMood(mood)
  if (!m) notFound()

  // Mood membership comes from the shared scent profile, so the same products
  // appear here as wear this mood's chip on cards and PDPs.
  const all = await getProductCards({ limit: 100 })
  const products = all.filter(
    (p) => scentProfile(p.handle || p.id).mood.slug === m.slug,
  )

  const [, deep] = m.accent

  return (
    <main>
      {/* Mood hero */}
      <section className="relative overflow-hidden text-white">
        <AppImage
          src={moodArtUrl(m.slug)}
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(110% 130% at 82% 8%, ${m.aura}59 0%, transparent 55%), linear-gradient(140deg, #1A1310f2 0%, ${deep}cc 150%)`,
          }}
        />
        <div className="absolute inset-0 bg-grain opacity-[0.15]" />
        <div
          className="absolute -right-12 top-8 h-56 w-56 animate-aura rounded-full opacity-40 blur-3xl"
          style={{ backgroundColor: m.aura }}
        />
        <p
          aria-hidden
          className="pointer-events-none absolute -bottom-8 right-0 select-none font-display text-[9rem] font-bold leading-none text-stroke-white opacity-50 sm:text-[13rem]"
        >
          {m.label}
        </p>

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <Reveal>
            <nav className="mb-5 text-xs text-white/55">
              <Link href="/" className="transition-colors hover:text-white">
                Home
              </Link>
              <span className="mx-1.5">/</span>
              <span>Scent moods</span>
              <span className="mx-1.5">/</span>
              <span className="text-white/85">{m.label}</span>
            </nav>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              {m.tagline} · {products.length}{' '}
              {products.length === 1 ? 'fragrance' : 'fragrances'}
            </p>
            <h1 className="mt-2 font-display text-5xl font-semibold italic sm:text-7xl">
              {m.label}
            </h1>
            <p className="mt-4 max-w-lg leading-relaxed text-white/80">
              {m.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {m.signatureNotes.map((note) => (
                <span
                  key={note}
                  className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur"
                >
                  {note}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mood switcher */}
      <div className="border-b border-neutral-100 bg-white">
        <nav
          aria-label="Browse other moods"
          className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 py-3"
        >
          {SCENT_MOODS.map((other) => (
            <Link
              key={other.slug}
              href={moodHref(other.slug)}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                other.slug === m.slug
                  ? 'border-brand-ink bg-brand-ink text-white'
                  : 'border-neutral-300 text-neutral-600 hover:border-pink-400 hover:text-brand-ink',
              )}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: other.aura }}
              />
              {other.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-16">
        <FilteredProducts products={products} lockedMood={m.slug} />
      </div>
    </main>
  )
}
