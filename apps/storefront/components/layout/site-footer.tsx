import Link from 'next/link'
import { NAV_CATEGORIES } from '@/lib/catalog/nav'
import { SCENT_MOODS, moodHref } from '@/lib/catalog/scent'

const HELP_LINKS = [
  ['Track Order', '/'],
  ['Shipping & Returns', '/'],
  ['Contact Us', '/'],
  ['FAQs', '/'],
]

const ABOUT_LINKS = [
  ['Our Story', '/'],
  ['Reviews', '/'],
  ['Blog', '/'],
  ['Wholesale', '/'],
]

function Column({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="text-sm text-white/80 transition-colors hover:text-pink-400"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-brand-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-6">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ember-sheen text-sm font-bold text-white">
              B
            </span>
            <span className="font-display text-2xl font-semibold tracking-tight">
              BODY<span className="text-gradient-ember">SCENT</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-white/65">
            Skin-safe, alcohol-free perfume oils inspired by the icons. Wear what you
            love — longer.
          </p>
          <div className="mt-6 flex gap-3">
            {['Instagram', 'TikTok', 'Facebook'].map((s) => (
              <Link
                key={s}
                href="/"
                aria-label={s}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/20 text-xs text-white/70 transition hover:border-pink-400 hover:text-pink-400"
              >
                {s[0]}
              </Link>
            ))}
          </div>
        </div>

        <Column title="Shop" links={NAV_CATEGORIES.map((c) => [c.label, `/${c.slug}`])} />
        <Column
          title="Moods"
          links={SCENT_MOODS.map((m) => [m.label, moodHref(m.slug)])}
        />
        <Column title="Help" links={HELP_LINKS as [string, string][]} />
        <Column title="About" links={ABOUT_LINKS as [string, string][]} />
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} BodyScent. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white/80">Privacy</Link>
            <Link href="/" className="hover:text-white/80">Terms</Link>
            <span className="tracking-[0.2em] text-white/40">VISA · MC · AMEX · UPI</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
