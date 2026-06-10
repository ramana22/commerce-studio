/**
 * Storefront ⇄ Medusa connection settings, read from the environment.
 *
 * MEDUSA_BACKEND_URL is server-side only; NEXT_PUBLIC_* values are inlined into
 * the browser bundle and used by client components that talk to Medusa directly.
 */
export const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ??
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ??
  'http://localhost:9000'

export const MEDUSA_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ''

/** ISO country code used as the default checkout region. */
export const DEFAULT_COUNTRY = process.env.NEXT_PUBLIC_DEFAULT_COUNTRY ?? 'us'

/** Currency the store transacts in. */
export const STORE_CURRENCY = 'usd'
