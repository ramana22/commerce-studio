/** Medusa payment provider ids (format: pp_{identifier}_{id}). */
export const MANUAL_PROVIDER_ID = 'pp_system_default'
export const RAZORPAY_PROVIDER_ID = 'pp_razorpay_razorpay'

/** Public Razorpay key — present only when Razorpay is configured. */
export const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? ''

/** Whether the storefront should drive the Razorpay checkout flow. */
export const isRazorpayEnabled = Boolean(RAZORPAY_KEY_ID)

/** Data the provider exposes to the storefront to open Razorpay Checkout. */
export interface RazorpaySessionData {
  razorpay_order_id: string
  key_id: string
  amount: number
}
