import { revalidatePath } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Webhook target for the Medusa `product.*` subscriber. Purges the ISR cache for
 * catalog-driven pages (homepage, collections, product pages) so catalog edits
 * appear without a redeploy.
 *
 * When REVALIDATE_SECRET is set, requests must send a matching
 * `x-revalidate-secret` header. Without it (local dev) the route is open.
 */
export async function POST(request: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET
  if (expected && request.headers.get('x-revalidate-secret') !== expected) {
    return NextResponse.json(
      { revalidated: false, error: 'Invalid revalidation secret' },
      { status: 401 },
    )
  }

  let body: { type?: string; id?: string } = {}
  try {
    body = (await request.json()) as { type?: string; id?: string }
  } catch {
    // An empty/non-JSON body is fine — fall back to a full catalog revalidation.
  }

  // Catalog data feeds the layout (cart/announcement), homepage, collection (PLP)
  // and product (PDP) pages, so purge everything under the root layout.
  revalidatePath('/', 'layout')

  return NextResponse.json({
    revalidated: true,
    type: body.type ?? 'all',
    id: body.id ?? null,
    now: Date.now(),
  })
}
