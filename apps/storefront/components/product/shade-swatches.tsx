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
    <div className="flex items-center gap-1.5">
      {shown.map((s) => (
        <span
          key={s.sku || s.name}
          title={s.name}
          className="inline-block h-4 w-4 rounded-full border border-white shadow-[0_0_0_1px_rgba(16,34,27,0.18)]"
          style={{ backgroundColor: `#${s.hex}` }}
        />
      ))}
      {extra > 0 ? (
        <span className="ml-0.5 text-[11px] font-medium text-neutral-500">
          +{extra} Shades
        </span>
      ) : null}
    </div>
  )
}
