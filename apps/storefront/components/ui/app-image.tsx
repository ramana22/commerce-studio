'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * next/image with a subtle fade-in once the image decodes. Use inside a
 * positioned, aspect-sized container when passing `fill`.
 */
export function AppImage({ className, onLoad, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false)
  return (
    // alt is provided by callers via props and forwarded below.
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image
      {...props}
      onLoad={(e) => {
        setLoaded(true)
        onLoad?.(e)
      }}
      className={cn(
        'transition-opacity duration-700 ease-smooth',
        loaded ? 'opacity-100' : 'opacity-0',
        className,
      )}
    />
  )
}
