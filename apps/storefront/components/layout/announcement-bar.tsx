'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
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
      className="relative overflow-hidden px-4 py-2 text-center text-sm"
      style={{
        backgroundColor: data.backgroundColor ?? '#000000',
        color: data.textColor ?? '#FFFFFF',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {message.href ? (
            <Link href={message.href} className="hover:underline">
              {message.text}
            </Link>
          ) : (
            message.text
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
