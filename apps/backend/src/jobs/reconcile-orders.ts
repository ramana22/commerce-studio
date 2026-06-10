import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { captureMessage, captureError } from '../lib/observability'

/** Minimal logger surface used by this job. */
type Log = {
  info(message: string): void
  warn(message: string): void
  error(message: string): void
}

/** Minimal query surface used by this job. */
type Query = {
  graph(config: {
    entity: string
    fields: string[]
    pagination?: { take?: number; skip?: number }
  }): Promise<{ data: ReconOrder[] }>
}

interface ReconOrder {
  id: string
  display_id: number
  status: string
  total: number
  created_at: string
  payment_collections?: Array<{
    payments?: Array<{ amount: number; captured_at: string | null }>
  }>
}

// Orders older than this with no captured payment are considered "stuck".
const STUCK_AFTER_MS = 60 * 60 * 1000 // 1 hour
// Only look back a bounded window so the job stays cheap.
const WINDOW_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
// Allow a 1-cent rounding tolerance on captured-vs-total comparisons.
const AMOUNT_TOLERANCE = 1

/**
 * Daily reconciliation — flags orders whose money state looks wrong so they
 * never silently rot:
 *   • stuck      — older than 1h with no captured payment
 *   • mismatched — captured amount ≠ order total (beyond rounding)
 *
 * Findings are logged and sent to Sentry (so they alert). Read-only: it never
 * mutates orders — a human decides what to do.
 */
export default async function reconcileOrders(
  container: MedusaContainer,
): Promise<void> {
  const logger = container.resolve<Log>(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve<Query>(ContainerRegistrationKeys.QUERY)

  try {
    const now = Date.now()
    const { data: orders } = await query.graph({
      entity: 'order',
      fields: [
        'id',
        'display_id',
        'status',
        'total',
        'created_at',
        'payment_collections.payments.amount',
        'payment_collections.payments.captured_at',
      ],
      pagination: { take: 1000 },
    })

    const stuck: ReconOrder[] = []
    const mismatched: Array<{ order: ReconOrder; captured: number }> = []

    for (const order of orders) {
      const createdMs = new Date(order.created_at).getTime()
      if (now - createdMs > WINDOW_MS) continue // outside the look-back window

      const payments = (order.payment_collections ?? []).flatMap(
        (pc) => pc.payments ?? [],
      )
      const captured = payments.filter((p) => p.captured_at)
      const capturedTotal = captured.reduce((s, p) => s + Number(p.amount ?? 0), 0)

      if (now - createdMs > STUCK_AFTER_MS && captured.length === 0) {
        stuck.push(order)
      } else if (
        captured.length > 0 &&
        Math.abs(capturedTotal - Number(order.total)) > AMOUNT_TOLERANCE
      ) {
        mismatched.push({ order, captured: capturedTotal })
      }
    }

    if (stuck.length === 0 && mismatched.length === 0) {
      logger.info(
        `[reconcile] OK — ${orders.length} recent orders, no stuck or mismatched payments`,
      )
      return
    }

    const summary = `[reconcile] ${stuck.length} stuck (uncaptured >1h), ${mismatched.length} payment/total mismatch(es)`
    logger.warn(summary)
    for (const o of stuck) {
      logger.warn(`[reconcile]   STUCK   #${o.display_id} (${o.id}) status=${o.status} total=${o.total}`)
    }
    for (const { order: o, captured } of mismatched) {
      logger.warn(`[reconcile]   MISMATCH #${o.display_id} (${o.id}) total=${o.total} captured=${captured}`)
    }

    await captureMessage(summary, 'warning', {
      stuck: stuck.map((o) => o.id),
      mismatched: mismatched.map((m) => m.order.id),
    })
  } catch (err) {
    logger.error(`[reconcile] job failed — ${(err as Error).message}`)
    await captureError(err, { scope: 'job/reconcile-orders' })
  }
}

export const config = {
  name: 'reconcile-orders',
  // Daily at 02:00 (server time).
  schedule: '0 2 * * *',
}
