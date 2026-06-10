import 'server-only'
import { cookies } from 'next/headers'

const CART_COOKIE = '_sugar_cart_id'
const THIRTY_DAYS = 60 * 60 * 24 * 30

/** Read the current cart id from the httpOnly cookie, if any. */
export async function getCartId(): Promise<string | undefined> {
  const store = await cookies()
  return store.get(CART_COOKIE)?.value
}

/**
 * Persist the cart id in an httpOnly cookie.
 * Can only be called from a Server Action or Route Handler.
 */
export async function setCartId(id: string): Promise<void> {
  const store = await cookies()
  store.set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: THIRTY_DAYS,
    path: '/',
  })
}

/** Remove the cart cookie — called once an order is placed. */
export async function clearCartId(): Promise<void> {
  const store = await cookies()
  store.delete(CART_COOKIE)
}
