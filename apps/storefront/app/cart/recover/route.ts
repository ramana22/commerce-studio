import crypto from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'

// Mirrors the cart cookie defined in lib/cart/cookies.ts.
const CART_COOKIE = '_sugar_cart_id'
const THIRTY_DAYS = 60 * 60 * 24 * 30

/**
 * One-click abandoned-cart recovery. The recovery email links here with the
 * cart id (and an HMAC token when RECOVERY_SECRET is set); we restore the cart
 * cookie and redirect to /cart so the shopper picks up exactly where they left
 * off. If the cart was completed or expired, /cart simply shows an empty bag.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const cartId = req.nextUrl.searchParams.get('cart_id')
  const token = req.nextUrl.searchParams.get('token')
  const cartUrl = new URL('/cart', req.nextUrl.origin)

  if (!cartId) return NextResponse.redirect(cartUrl)

  // Verify the signed token when a secret is configured.
  const secret = process.env.RECOVERY_SECRET
  if (secret) {
    const expected = crypto.createHmac('sha256', secret).update(cartId).digest('hex')
    const valid =
      !!token &&
      token.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))
    if (!valid) return NextResponse.redirect(cartUrl)
  }

  const res = NextResponse.redirect(cartUrl)
  res.cookies.set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: THIRTY_DAYS,
    path: '/',
  })
  return res
}
