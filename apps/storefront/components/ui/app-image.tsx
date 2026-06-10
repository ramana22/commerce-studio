'use client'

import Image, { type ImageProps } from 'next/image'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * next/image with a subtle fade-in once the image decodes. Use inside a
 * positioned, aspect-sized container when passing `fill`.
 *
 * `fallbackSrc` (optional) is swapped in if the primary image fails to load —
 * used to fall back from a demo perfume photo to the generated bottle SVG.
 */
export function AppImage({
  className,
  onLoad,
  src,
  fallbackSrc,
  ...props
}: ImageProps & { fallbackSrc?: string }) {
  const [loaded, setLoaded] = useState(false)
  const [current, setCurrent] = useState(src)

  // Reset when the source changes (e.g. switching gallery images).
  useEffect(() => setCurrent(src), [src])

  return (
    // alt is provided by callers via props and forwarded below.
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image
      {...props}
      src={current}
      onLoad={(e) => {
        setLoaded(true)
        onLoad?.(e)
      }}
      onError={() => {
        if (fallbackSrc && current !== fallbackSrc) setCurrent(fallbackSrc)
      }}
      className={cn(
        'transition-opacity duration-700 ease-smooth',
        loaded ? 'opacity-100' : 'opacity-0',
        className,
      )}
    />
  )
}
