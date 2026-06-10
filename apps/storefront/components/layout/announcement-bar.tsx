'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { AnnouncementBar as AnnouncementBarData } from '@/lib/sanity/types'

export function AnnouncementBar({ data }: { data: AnnouncementBarData }) {
  const messages = data.messages ?? []
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (messages.length <= 1) return
    const id = setInterval(
      () => setIndex((p) => (p + 1) % messages.length),
      data.rotateIntervalMs ?? 4000,
    )
    return () => clearInterval(id)
  }, [messages.length, data.rotateIntervalMs])

  if (!data.enabled || messages.length === 0) return null

  const message = messages[index]!

  return (
    <div
      className="px-4 py-2 text-center text-sm"
      style={{
        backgroundColor: data.backgroundColor ?? '#000000',
        color: data.textColor ?? '#FFFFFF',
      }}
    >
      {message.href ? (
        <Link href={message.href} className="hover:underline">
          {message.text}
        </Link>
      ) : (
        message.text
      )}
    </div>
  )
}
