import Medusa from '@medusajs/js-sdk'
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from './config'

/**
 * Shared Medusa Store SDK instance.
 *
 * Used from server actions and server components. The publishable key scopes
 * every Store API request to the storefront's sales channel.
 */
export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  publishableKey: MEDUSA_PUBLISHABLE_KEY,
})
