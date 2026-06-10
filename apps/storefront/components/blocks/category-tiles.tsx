import Link from 'next/link'
import type { CategoryTilesBlock } from '@/lib/sanity/types'
import { urlForImage } from '@/lib/sanity/image'

export function CategoryTiles({ block }: { block: CategoryTilesBlock }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      {block.heading ? (
        <h2 className="mb-6 text-center text-2xl font-semibold">
          {block.heading}
        </h2>
      ) : null}
      <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
        {block.tiles.map((tile, i) => {
          const img = urlForImage(tile.image, { width: 320, height: 320 })
          return (
            <li key={`${tile.href}-${i}`}>
              <Link href={tile.href} className="group block text-center">
                <div className="relative mx-auto aspect-square overflow-hidden rounded-full bg-neutral-100">
                  {tile.badge ? (
                    <span className="absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-full bg-pink-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {tile.badge}
                    </span>
                  ) : null}
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt={tile.label}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <p className="mt-2 text-sm font-medium">{tile.label}</p>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
