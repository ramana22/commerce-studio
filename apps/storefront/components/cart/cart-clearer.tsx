'use client'

import { useEffect } from 'react'
import { useCart } from './cart-context'

/**
 * Resets local cart state once, on mount. Rendered on the order confirmation
 * page so the cart badge empties after a successful purchase (the server-side
 * cookie is already cleared by `placeOrder`).
 */
export function CartClearer() {
  const { clear } = useCart()
  useEffect(() => {
    clear()
  }, [clear])
  return null
}
