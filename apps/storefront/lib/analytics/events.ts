/**
 * Lightweight, privacy-light analytics for the funnel + Web Vitals.
 *
 * Events are POSTed to our own `/api/analytics` route (via sendBeacon so they
 * survive page unloads), which logs them and optionally forwards to a real sink
 * (PostHog, a webhook, etc.). Analytics must never throw into the app, so every
 * path is guarded.
 */
export type AnalyticsEvent =
  | 'product_viewed'
  | 'add_to_cart'
  | 'checkout_started'
  | 'purchase'
  | 'web_vital'

export function track(
  event: AnalyticsEvent,
  props: Record<string, unknown> = {},
): void {
  if (typeof window === 'undefined') return
  const body = JSON.stringify({
    event,
    props,
    path: window.location.pathname,
    ts: Date.now(),
  })
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        '/api/analytics',
        new Blob([body], { type: 'application/json' }),
      )
    } else {
      void fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      })
    }
  } catch {
    /* analytics is best-effort — never break the page */
  }
}
