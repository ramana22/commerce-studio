import type { SugarShade } from '@sugar-store/types'

/** A compact row of shade colour dots, used on product cards. */
export function ShadeSwatches({
  shades,
  max = 5,
}: {
  shades: SugarShade[]
  max?: number
}) {
  const withHex = shades.filter((s) => s.hex)
  if (withHex.length === 0) return null

  const shown = withHex.slice(0, max)
  const extra = withHex.length - shown.length

  return (
    <div className="flex items-center gap-1">
      {shown.map((s) => (
        <span
          key={s.sku || s.name}
          title={s.name}
          className="inline-block h-3.5 w-3.5 rounded-full border border-neutral-300"
          style={{ backgroundColor: `#${s.hex}` }}
        />
      ))}
      {extra > 0 ? (
        <span className="text-xs text-neutral-500">+{extra}</span>
      ) : null}
    </div>
  )
}
