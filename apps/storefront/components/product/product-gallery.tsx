'use client'

import { useState } from 'react'

export function ProductGallery({
  images,
  title,
}: {
  images: string[]
  title: string
}) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return <div className="aspect-square w-full rounded-lg bg-neutral-100" />
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active]}
          alt={title}
          className="h-full w-full object-cover"
        />
      </div>
      {images.length > 1 ? (
        <ul className="flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
                className={`h-16 w-16 overflow-hidden rounded border-2 ${
                  i === active ? 'border-pink-600' : 'border-transparent'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
