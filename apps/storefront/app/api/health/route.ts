import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/** Lightweight liveness probe for load balancers / uptime monitors. */
export function GET() {
  return NextResponse.json({ status: 'ok', service: 'storefront' })
}
