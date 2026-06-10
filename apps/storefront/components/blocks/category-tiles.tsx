import Link from 'next/link'
import type { CategoryTilesBlock } from '@/lib/sanity/types'
import { urlForImage } from '@/lib/sanity/image'
import { AppImage } from '@/components/ui/app-image'
import { Reveal } from '@/components/motion/reveal'
import { StaggerGroup, StaggerItem } from '@/components/motion/stagger'

const TILE_SIZES = '(min-width: 768px) 16vw, 30vw'

export function CategoryTiles({ block }: { block: CategoryTilesBlock }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      {block.heading ? (
        <Reveal>
          <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">
            {block.heading}
          </h2>
        </Reveal>
      ) : null}
      <StaggerGroup
        className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6"
        gap={0.05}
      >
        {block.tiles.map((tile, i) => {
          const img = urlForImage(tile.image, { width: 320, height: 320 })
          return (
            <StaggerItem key={`${tile.href}-${i}`}>
              <Link href={tile.href} className="group block text-center">
                <div className="relative mx-auto aspect-square overflow-hidden rounded-full bg-neutral-100 ring-1 ring-neutral-200 transition group-hover:ring-2 group-hover:ring-pink-300">
                  {tile.badge ? (
                    <span className="absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-full bg-pink-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {tile.badge}
                    </span>
                  ) : null}
                  {img ? (
                    <AppImage
                      src={img}
                      alt={tile.label}
                      fill
                      sizes={TILE_SIZES}
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : null}
                </div>
                <p className="mt-2.5 text-sm font-medium">{tile.label}</p>
              </Link>
            </StaggerItem>
          )
        })}
      </StaggerGroup>
    </section>
  )
}
