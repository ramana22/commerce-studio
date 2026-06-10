/** Medusa payment provider ids (format: pp_{identifier}_{id}). */
export const MANUAL_PROVIDER_ID = 'pp_system_default'
export const SQUARE_PROVIDER_ID = 'pp_square_square'

/** Public Square Web Payments config — present only when Square is configured. */
export const SQUARE_APPLICATION_ID =
  process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ?? ''
export const SQUARE_LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? ''
export const SQUARE_ENVIRONMENT: 'sandbox' | 'production' =
  process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === 'production'
    ? 'production'
    : 'sandbox'

/** Whether the storefront should drive the Square card flow. */
export const isSquareEnabled = Boolean(SQUARE_APPLICATION_ID && SQUARE_LOCATION_ID)
