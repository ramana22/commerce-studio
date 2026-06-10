/**
 * Thin wrapper over Sentry for the storefront's money path. Dynamically imports
 * the SDK so it never enters the client bundle, and no-ops when no DSN is set —
 * keeping checkout resilient whether or not monitoring is configured.
 */
export async function captureError(
  error: unknown,
  context?: Record<string, unknown>,
): Promise<void> {
  if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) return
  try {
    const Sentry = await import('@sentry/nextjs')
    Sentry.captureException(error, context ? { extra: context } : undefined)
  } catch {
    /* monitoring must never break the request */
  }
}
