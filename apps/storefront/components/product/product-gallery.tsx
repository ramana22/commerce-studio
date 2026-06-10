'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AppImage } from '@/components/ui/app-image'
import { bottleImage } from '@/lib/catalog/placeholder'
import { cn } from '@/lib/utils/cn'

export function ProductGallery({
  images,
  title,
}: {
  images: string[]
  title: string
}) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return <div className="aspect-square w-full rounded-2xl bg-neutral-100" />
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <AppImage
              src={images[active]!}
              fallbackSrc={bottleImage(title)}
              alt={title}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 ? (
        <ul className="no-scrollbar flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
                className={cn(
                  'relative h-16 w-16 overflow-hidden rounded-lg border-2 transition',
                  i === active ? 'border-pink-600' : 'border-transparent',
                )}
              >
                <AppImage
                  src={src}
                  fallbackSrc={bottleImage(title)}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
