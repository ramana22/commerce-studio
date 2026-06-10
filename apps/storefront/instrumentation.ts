/**
 * Server-side observability hook.
 *
 * Sentry is initialized only on the server/edge runtimes and only when a DSN is
 * configured. It's loaded with a dynamic import so it never enters the client
 * bundle (keeping the Phase 8 performance budget intact).
 */
const DSN = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN

export async function register(): Promise<void> {
  if (!DSN) return
  if (
    process.env.NEXT_RUNTIME === 'nodejs' ||
    process.env.NEXT_RUNTIME === 'edge'
  ) {
    const Sentry = await import('@sentry/nextjs')
    Sentry.init({
      dsn: DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    })
  }
}

export async function onRequestError(
  error: unknown,
  request: unknown,
  context: unknown,
): Promise<void> {
  if (!DSN) return
  const Sentry = await import('@sentry/nextjs')
  Sentry.captureRequestError(
    error,
    request as Parameters<typeof Sentry.captureRequestError>[1],
    context as Parameters<typeof Sentry.captureRequestError>[2],
  )
}
