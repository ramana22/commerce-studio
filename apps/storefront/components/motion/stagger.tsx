'use client'

import { motion, useReducedMotion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'

const itemMotion: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}
const itemReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
}

/** Container that staggers its `StaggerItem` children into view. */
export function StaggerGroup({
  children,
  className,
  gap = 0.06,
}: {
  children: ReactNode
  className?: string
  gap?: number
}) {
  const reduce = useReducedMotion()
  return (
    <motion.ul
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : gap } },
      }}
    >
      {children}
    </motion.ul>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.li
      className={className}
      variants={reduce ? itemReduced : itemMotion}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.li>
  )
}
