/**
 * Money helpers.
 *
 * The catalog is imported with prices in cents (USD × 100), so every monetary
 * value returned by Medusa — line totals, cart totals, order totals — is in
 * cents. The storefront converts to full dollars for display.
 */

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Convert a cents amount from Medusa into full dollars. */
export function centsToUsd(cents: number | null | undefined): number {
  return Math.round(cents ?? 0) / 100
}

/** Format a cents amount as a localized USD string, e.g. "$12.99". */
export function formatCents(cents: number | null | undefined): string {
  return usdFormatter.format(centsToUsd(cents))
}

/** Format a value already expressed in full dollars, e.g. "$12.99". */
export function formatUsd(usd: number): string {
  return usdFormatter.format(usd)
}
