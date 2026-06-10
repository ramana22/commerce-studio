import Link from 'next/link'
import type { Cta } from '@/lib/sanity/types'

const STYLES: Record<NonNullable<Cta['style']>, string> = {
  primary: 'bg-pink-600 text-white hover:bg-pink-700',
  secondary: 'border border-current hover:bg-white/10',
  link: 'underline underline-offset-4',
}

export function CtaButton({ cta }: { cta?: Cta }) {
  if (!cta) return null
  const variant = STYLES[cta.style ?? 'primary']
  const padding = cta.style === 'link' ? '' : 'rounded px-6 py-3'
  return (
    <Link
      href={cta.href}
      className={`inline-block font-medium transition ${padding} ${variant}`}
    >
      {cta.label}
    </Link>
  )
}
