/**
 * Square Web Payments SDK loader + helpers.
 *
 * The customer's card is tokenized in the browser by Square (PCI-compliant — the
 * raw card number never touches our server). The resulting single-use token is
 * handed to the backend Square payment provider to create the payment.
 */

export interface SquareCard {
  attach(selector: string): Promise<void>
  tokenize(): Promise<{ status: string; token?: string; errors?: unknown[] }>
  destroy?(): Promise<void>
}

interface SquarePayments {
  card(): Promise<SquareCard>
}

interface SquareSdk {
  payments(applicationId: string, locationId: string): SquarePayments
}

type SquareWindow = Window & { Square?: SquareSdk }

function scriptSrc(environment: 'sandbox' | 'production'): string {
  return environment === 'production'
    ? 'https://web.squarecdn.com/v1/square.js'
    : 'https://sandbox.web.squarecdn.com/v1/square.js'
}

/** Inject the Square Web Payments SDK once. Resolves to true when available. */
export function loadSquareSdk(
  environment: 'sandbox' | 'production',
): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if ((window as SquareWindow).Square) return Promise.resolve(true)

  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = scriptSrc(environment)
    script.onload = () => resolve(Boolean((window as SquareWindow).Square))
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/** Create a Square card input and attach it to `selector` (e.g. "#card-container"). */
export async function createSquareCard(
  applicationId: string,
  locationId: string,
  selector: string,
): Promise<SquareCard> {
  const sdk = (window as SquareWindow).Square
  if (!sdk) throw new Error('Square SDK is not available')
  const payments = sdk.payments(applicationId, locationId)
  const card = await payments.card()
  await card.attach(selector)
  return card
}

/** Tokenize the card and return the single-use token, or throw on failure. */
export async function tokenizeSquareCard(card: SquareCard): Promise<string> {
  const result = await card.tokenize()
  if (result.status === 'OK' && result.token) return result.token
  throw new Error('Card could not be verified. Please check your details.')
}
