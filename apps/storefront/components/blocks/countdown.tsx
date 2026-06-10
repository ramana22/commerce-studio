'use client'

import { useEffect, useState } from 'react'

function remainingMs(to: string): number {
  return new Date(to).getTime() - Date.now()
}

/** Live countdown to a target time. Renders nothing once elapsed. */
export function Countdown({ to }: { to: string }) {
  // Start null so server and first client render match; fill in after mount.
  const [ms, setMs] = useState<number | null>(null)

  useEffect(() => {
    setMs(remainingMs(to))
    const id = setInterval(() => setMs(remainingMs(to)), 1000)
    return () => clearInterval(id)
  }, [to])

  if (ms === null || ms <= 0) return null

  const total = Math.floor(ms / 1000)
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const parts: [number, string][] = [
    [days, 'd'],
    [hours, 'h'],
    [minutes, 'm'],
    [seconds, 's'],
  ]

  return (
    <div className="flex gap-3 font-mono text-lg font-semibold">
      {parts.map(([value, label]) => (
        <span key={label} className="tabular-nums">
          {String(value).padStart(2, '0')}
          <span className="ml-0.5 text-xs opacity-70">{label}</span>
        </span>
      ))}
    </div>
  )
}
