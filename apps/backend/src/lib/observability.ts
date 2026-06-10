/**
 * Sentry helpers for the backend money path (order subscriber, payment webhook,
 * reconciliation job). Sentry is initialised in medusa-config.js when SENTRY_DSN
 * is set; these helpers dynamically import the SDK and no-op otherwise, so the
 * backend behaves identically with or without monitoring configured.
 */
export async function captureError(
  error: unknown,
  context?: Record<string, unknown>,
): Promise<void> {
  if (!process.env.SENTRY_DSN) return
  try {
    const Sentry = await import('@sentry/node')
    Sentry.captureException(error, context ? { extra: context } : undefined)
  } catch {
    /* monitoring must never break the flow */
  }
}

export async function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'warning',
  context?: Record<string, unknown>,
): Promise<void> {
  if (!process.env.SENTRY_DSN) return
  try {
    const Sentry = await import('@sentry/node')
    Sentry.captureMessage(message, { level, extra: context })
  } catch {
    /* best-effort */
  }
}
