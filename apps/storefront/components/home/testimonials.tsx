import { findMood } from '@/lib/catalog/scent'
import { Stars } from '@/components/ui/stars'
import { Reveal } from '@/components/motion/reveal'

interface Testimonial {
  quote: string
  name: string
  scent: string
  mood: string
  rating: number
}

/** Curated demo reviews — replaced by real review data at cutover. */
const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Three people asked what I was wearing before lunch. THREE. The oil lasts through my whole shift and then some.',
    name: 'Sarah K.',
    scent: 'Amber Nights',
    mood: 'spicy',
    rating: 5,
  },
  {
    quote:
      'I own the designer original and honestly reach for this more. Softer on my skin and the dry-down is gorgeous.',
    name: 'Priya R.',
    scent: 'Velvet Bloom',
    mood: 'floral',
    rating: 5,
  },
  {
    quote:
      'Finally a fragrance that survives a 12-hour hospital shift. Roll-on means no cloud, just a quiet trail.',
    name: 'Maya J.',
    scent: 'White Tea Musk',
    mood: 'musky',
    rating: 4.5,
  },
  {
    quote:
      "Bought one for my husband, stole it back within a week. We've now subscribed to two bottles a month.",
    name: 'Elena T.',
    scent: 'Noir Vetiver',
    mood: 'woody',
    rating: 5,
  },
  {
    quote:
      'Smells like a beach holiday in a 10ml bottle. I keep one in every bag I own and one at my desk.',
    name: 'Dan W.',
    scent: 'Salt & Sky',
    mood: 'aqua',
    rating: 5,
  },
  {
    quote:
      'The vanilla is rich without being a bakery. Date-night staple — my partner notices every single time.',
    name: 'Aisha B.',
    scent: 'Praline Hour',
    mood: 'sweet',
    rating: 5,
  },
  {
    quote:
      'Zero alcohol means zero headache for me. First fragrance in years I can wear without my sinuses protesting.',
    name: 'Tom H.',
    scent: 'Green Vetiver',
    mood: 'fresh',
    rating: 4.5,
  },
  {
    quote:
      'The layering trio is genius. I mix Fresh over Musk on weekdays and add Spice for evenings. Endless combos.',
    name: 'Nina P.',
    scent: 'Build-Your-Trio',
    mood: 'musky',
    rating: 5,
  },
  {
    quote:
      'Arrived beautifully boxed with a handwritten note. Gifted it for a birthday and got a thank-you call same night.',
    name: 'Marcus L.',
    scent: 'Oud Royale',
    mood: 'spicy',
    rating: 5,
  },
  {
    quote:
      'I was a fine-fragrance snob. The saffron opening on this converted me in one wear — and at a tenth of the price.',
    name: 'Chloe F.',
    scent: 'Saffron Veil',
    mood: 'floral',
    rating: 5,
  },
]

function TestimonialCard({ t }: { t: Testimonial }) {
  const mood = findMood(t.mood)
  return (
    <figure className="flex h-full w-80 shrink-0 flex-col rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-card">
      <Stars rating={t.rating} className="text-sm" />
      <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-neutral-600">
        &ldquo;{t.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-5 flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
        <div>
          <p className="text-sm font-semibold text-brand-ink">{t.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-neutral-400">
            <svg viewBox="0 0 24 24" className="h-3 w-3 text-pink-600" fill="currentColor">
              <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8L12 2z" />
            </svg>
            Verified buyer
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-cream px-3 py-1.5 text-[11px] font-medium text-brand-ink">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: mood?.aura ?? '#C8A24A' }}
          />
          {t.scent}
        </span>
      </figcaption>
    </figure>
  )
}

function MarqueeRow({
  items,
  reverse = false,
}: {
  items: Testimonial[]
  reverse?: boolean
}) {
  const row = [...items, ...items]
  return (
    <div className="group/row mask-fade-x overflow-hidden">
      <div
        className={`flex w-max items-stretch gap-5 py-2.5 will-change-transform group-hover/row:[animation-play-state:paused] ${
          reverse
            ? 'animate-marquee-slow [animation-direction:reverse]'
            : 'animate-marquee-slow'
        }`}
      >
        {row.map((t, i) => (
          <TestimonialCard key={`${t.name}-${i}`} t={t} />
        ))}
      </div>
    </div>
  )
}

/** Social-proof wall — two counter-scrolling rows of verified reviews. */
export function Testimonials() {
  const rowA = TESTIMONIALS.slice(0, 5)
  const rowB = TESTIMONIALS.slice(5)

  return (
    <section className="overflow-hidden border-y border-neutral-100 bg-brand-cream/50 py-20 sm:py-24">
      <Reveal className="mx-auto mb-12 max-w-7xl px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-600">
          Word on the skin
        </p>
        <h2 className="mt-2 font-display text-4xl font-semibold text-brand-ink sm:text-5xl">
          Worn &amp; <span className="italic text-gradient-ember">loved</span>
        </h2>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span className="flex items-center gap-2">
            <Stars rating={4.9} className="text-base" />
            <span className="font-semibold text-brand-ink">4.9 / 5</span>
          </span>
          <span className="hidden h-4 w-px bg-neutral-300 sm:block" />
          <p className="text-sm text-neutral-500">
            from <span className="font-semibold text-brand-ink">12,400+</span> verified
            reviews
          </p>
          <span className="hidden h-4 w-px bg-neutral-300 sm:block" />
          <p className="text-sm text-neutral-500">
            <span className="font-semibold text-brand-ink">96%</span> would repurchase
          </p>
        </div>
      </Reveal>

      <div className="space-y-3">
        <MarqueeRow items={rowA} />
        <MarqueeRow items={rowB} reverse />
      </div>
    </section>
  )
}
