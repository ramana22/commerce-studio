'use client'

import { useEffect, useRef } from 'react'
import { track, type AnalyticsEvent } from '@/lib/analytics/events'

/**
 * Fire-once analytics beacon, rendered from server components to mark a funnel
 * step (product_viewed, checkout_started, purchase). The ref guard keeps Strict
 * Mode's double-mount from double-counting.
 */
export function TrackEvent({
  event,
  payload,
}: {
  event: AnalyticsEvent
  payload?: Record<string, unknown>
}) {
  const fired = useRef(false)
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    track(event, payload)
  }, [event, payload])
  return null
}
