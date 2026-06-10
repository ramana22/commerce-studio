import { Reveal } from '@/components/motion/reveal'

interface Prop {
  title: string
  body: string
  icon: React.ReactNode
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const PROPS: Prop[] = [
  {
    title: 'Sourced Carefully',
    body: 'Premium-grade oils, hand-blended in small batches.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" {...stroke}>
        <path d="M12 3c2 3 5 5 5 9a5 5 0 11-10 0c0-4 3-6 5-9z" />
      </svg>
    ),
  },
  {
    title: 'Long Lasting',
    body: 'Concentrated formulas that wear for up to 12 hours.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" {...stroke}>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 2M9 3h6" />
      </svg>
    ),
  },
  {
    title: 'Cruelty-Free',
    body: 'Never tested on animals. Vegan & skin-safe.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" {...stroke}>
        <path d="M7 9c-1-3 1-5 2-3 .5 1 .5 2.5 0 3M17 9c1-3-1-5-2-3-.5 1-.5 2.5 0 3" />
        <path d="M12 9c4 0 6 3 6 6a4 4 0 01-4 4c-1 0-1.5-.5-2-.5s-1 .5-2 .5a4 4 0 01-4-4c0-3 2-6 6-6z" />
      </svg>
    ),
  },
  {
    title: 'Free Shipping',
    body: 'On every order over $50, delivered to your door.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" {...stroke}>
        <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
        <circle cx="7" cy="18" r="1.6" />
        <circle cx="17" cy="18" r="1.6" />
      </svg>
    ),
  },
]

export function ValueProps() {
  return (
    <section className="border-b border-neutral-100 bg-brand-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-8 px-6 py-12 md:grid-cols-4">
        {PROPS.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.08} className="flex flex-col items-center text-center md:flex-row md:items-start md:gap-4 md:text-left">
            <div className="mb-3 grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-pink-600 shadow-card md:mb-0">
              {p.icon}
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-brand-ink">{p.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
