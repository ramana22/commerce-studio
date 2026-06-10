import { NextResponse, type NextRequest } from 'next/server'

/**
 * Funnel + Web-Vitals sink. Receives events from the storefront, logs them in a
 * structured line (so the funnel is observable in dev/server logs), and forwards
 * to a real analytics backend when `ANALYTICS_WEBHOOK_URL` is configured — any
 * endpoint that accepts JSON works (PostHog capture, a collector, etc.).
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let payload: {
    event?: string
    props?: Record<string, unknown>
    path?: string
    ts?: number
  }
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  if (!payload?.event) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const record = {
    type: 'analytics',
    event: payload.event,
    path: payload.path ?? null,
    ts: payload.ts ?? Date.now(),
    props: payload.props ?? {},
  }

  // Structured server log — the funnel is greppable even with no provider wired.
  console.log(`[analytics] ${record.event}`, JSON.stringify(record.props))

  const sink = process.env.ANALYTICS_WEBHOOK_URL
  if (sink) {
    try {
      await fetch(sink, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      })
    } catch {
      /* forwarding is best-effort */
    }
  }

  return new NextResponse(null, { status: 204 })
}
