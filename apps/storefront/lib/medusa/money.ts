/**
 * Money helpers.
 *
 * The catalog is imported with prices in paise (INR × 100), so every monetary
 * value returned by Medusa — line totals, cart totals, order totals — is in
 * paise. The storefront converts to full INR for display.
 */

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

/** Convert a paise amount from Medusa into full INR. */
export function paiseToInr(paise: number | null | undefined): number {
  return Math.round(paise ?? 0) / 100
}

/** Format a paise amount as a localized INR string, e.g. "₹1,299". */
export function formatPaise(paise: number | null | undefined): string {
  return inrFormatter.format(paiseToInr(paise))
}

/** Format a value already expressed in full INR, e.g. "₹1,299". */
export function formatInr(inr: number): string {
  return inrFormatter.format(inr)
}
