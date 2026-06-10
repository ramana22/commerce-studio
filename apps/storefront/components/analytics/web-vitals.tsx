'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { track } from '@/lib/analytics/events'

/**
 * Real-user Core Web Vitals (LCP, CLS, INP, FCP, TTFB) per session/page. Mounted
 * once in the root layout; each metric is reported to `/api/analytics`.
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    track('web_vital', {
      name: metric.name,
      value: Math.round(metric.value * 1000) / 1000,
      rating: (metric as { rating?: string }).rating ?? null,
      id: metric.id,
      navigationType: (metric as { navigationType?: string }).navigationType ?? null,
    })
  })
  return null
}
