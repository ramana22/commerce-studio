import Link from 'next/link'
import { NAV_CATEGORIES } from '@/lib/catalog/nav'
import { getProductsByCategory } from '@/lib/catalog/product-service'
import { bottleImage } from '@/lib/catalog/placeholder'
import { Reveal } from '@/components/motion/reveal'
import { StaggerGroup, StaggerItem } from '@/components/motion/stagger'
import { AppImage } from '@/components/ui/app-image'

/**
 * Animated "Shop by Genre" tiles. Each tile uses a representative product image
 * from its category, finished with a branded colour tint so the grid reads as a
 * cohesive set. Falls back to the pure gradient when a category has no products.
 */
export async function CategoryShowcase() {
  const images = await Promise.all(
    NAV_CATEGORIES.map((c) =>
      getProductsByCategory(c.handle, 1).then((p) => p[0]?.thumbnail ?? null),
    ),
  )

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <Reveal className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-600">
          Find your match
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-brand-ink sm:text-4xl">
          Shop by Category
        </h2>
      </Reveal>

      <StaggerGroup className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {NAV_CATEGORIES.map((c, i) => {
          const img = images[i]
          const [from, to] = [c.accent?.[0] ?? '#ECF7F1', c.accent?.[1] ?? '#0E7C5A']
          return (
            <StaggerItem key={c.slug}>
              <Link
                href={`/${c.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:shadow-hover"
                style={{ backgroundImage: `linear-gradient(160deg, ${from}, ${to})` }}
              >
                {/* Floating pill label — the SUGAR-style category chip. */}
                <span className="absolute inset-x-0 top-3 z-20 mx-auto w-fit max-w-[88%] truncate rounded-full bg-white/95 px-4 py-1.5 text-center text-[11px] font-bold uppercase tracking-[0.06em] text-brand-ink shadow-sm">
                  {c.label}
                </span>

                {/* Product image */}
                {img ? (
                  <AppImage
                    src={img}
                    fallbackSrc={bottleImage(c.handle)}
                    alt={c.label}
                    fill
                    sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-110"
                  />
                ) : null}

                {/* Soft brand wash for cohesion without hiding the product. */}
                <div
                  className="absolute inset-0 opacity-[0.18] mix-blend-multiply"
                  style={{ backgroundImage: `linear-gradient(160deg, ${from}, ${to})` }}
                />
                {/* Legibility gradient at the base for the tagline / CTA. */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col p-3.5 text-white">
                  <p className="text-[11px] leading-snug text-white/90">{c.tagline}</p>
                  <span className="mt-1.5 inline-flex translate-y-1 items-center gap-1 text-xs font-semibold opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    Shop now →
                  </span>
                </div>
              </Link>
            </StaggerItem>
          )
        })}
      </StaggerGroup>
    </section>
  )
}
