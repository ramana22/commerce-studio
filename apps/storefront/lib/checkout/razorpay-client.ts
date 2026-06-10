const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

export interface RazorpaySuccess {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description?: string
  order_id: string
  prefill?: { name?: string; email?: string; contact?: string }
  theme?: { color?: string }
  handler: (response: RazorpaySuccess) => void
  modal?: { ondismiss?: () => void }
}

interface RazorpayInstance {
  open: () => void
}
type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance
type RazorpayWindow = Window & { Razorpay?: RazorpayConstructor }

/** Inject the Razorpay Checkout script once. Resolves to true when available. */
export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if ((window as RazorpayWindow).Razorpay) return Promise.resolve(true)

  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/**
 * Open Razorpay Checkout. Resolves with the payment result on success, rejects
 * if the customer dismisses the modal.
 */
export function openRazorpayCheckout(
  options: Omit<RazorpayOptions, 'handler' | 'modal'>,
): Promise<RazorpaySuccess> {
  return new Promise((resolve, reject) => {
    const Ctor = (window as RazorpayWindow).Razorpay
    if (!Ctor) {
      reject(new Error('Razorpay is not available'))
      return
    }
    const rzp = new Ctor({
      ...options,
      handler: (response) => resolve(response),
      modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
    })
    rzp.open()
  })
}
