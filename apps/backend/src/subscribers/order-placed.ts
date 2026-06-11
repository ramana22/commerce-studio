import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { capturePaymentWorkflow } from '@medusajs/medusa/core-flows'
import { captureError } from '../lib/observability'

/** Minimal logger surface used by this subscriber. */
type Log = {
  info(message: string): void
  warn(message: string): void
  error(message: string): void
}

/** Minimal query surface used by this subscriber. */
type Query = {
  graph(config: {
    entity: string
    filters?: Record<string, unknown>
    fields: string[]
  }): Promise<{ data: unknown[] }>
}

interface PlacedOrder {
  id: string
  display_id: number
  email: string | null
  currency_code: string
  total: number
  items?: Array<{ title: string; quantity: number }>
  payment_collections?: Array<{
    payments?: Array<{ id: string; captured_at: string | null }>
  }>
}

/**
 * order.placed → email the customer a confirmation and (optionally) capture the
 * authorized payment so the order reaches a paid state.
 *
 * The email is sent through SendGrid when SENDGRID_API_KEY + EMAIL_FROM are set;
 * otherwise the confirmation is logged so the flow stays verifiable in dev.
 * Auto-capture is on by default and can be disabled with PAYMENT_AUTO_CAPTURE=false.
 */
export default async function orderPlacedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>): Promise<void> {
  const logger = container.resolve<Log>(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve<Query>(ContainerRegistrationKeys.QUERY)

  const { data } = await query.graph({
    entity: 'order',
    filters: { id: event.data.id },
    fields: [
      'id',
      'display_id',
      'email',
      'currency_code',
      'total',
      'items.title',
      'items.quantity',
      'payment_collections.payments.id',
      'payment_collections.payments.captured_at',
    ],
  })

  const order = data[0] as PlacedOrder | undefined
  if (!order) {
    logger.warn(`order.placed: order ${event.data.id} not found`)
    return
  }

  await sendConfirmationEmail(order, logger)

  if (process.env.PAYMENT_AUTO_CAPTURE !== 'false') {
    await captureOrderPayments(order, container, logger)
  }
}

/** Send the confirmation via SendGrid when configured; otherwise log it. */
async function sendConfirmationEmail(order: PlacedOrder, logger: Log): Promise<void> {
  const itemLines = (order.items ?? [])
    .map((i) => `  • ${i.title} × ${i.quantity}`)
    .join('\n')
  const total = (Number(order.total) / 100).toFixed(2)
  const subject = `Your Sugar order #${order.display_id} is confirmed`
  const body =
    `Hi,\n\nThanks for shopping with Sugar Cosmetics — we've received your order.\n\n` +
    `${itemLines}\n\nTotal: $${total}\n\nWe'll email you again when it ships.\n\n— Sugar Cosmetics`

  const apiKey = process.env.SENDGRID_API_KEY
  const from = process.env.EMAIL_FROM

  if (apiKey && from && order.email) {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: order.email }] }],
          from: { email: from, name: 'Sugar Cosmetics' },
          subject,
          content: [{ type: 'text/plain', value: body }],
        }),
      })
      if (!res.ok) {
        throw new Error(`SendGrid responded ${res.status}: ${await res.text()}`)
      }
      logger.info(
        `order.placed: confirmation emailed to ${order.email} (order #${order.display_id})`,
      )
    } catch (err) {
      logger.error(`order.placed: email send failed — ${(err as Error).message}`)
      await captureError(err, {
        scope: 'order.placed/email',
        order_id: order.id,
        display_id: order.display_id,
      })
    }
    return
  }

  // No email provider configured — log so the wiring stays observable in dev.
  logger.info(
    `order.placed: confirmation for order #${order.display_id} → ${order.email ?? 'no email'}\n` +
      `  ${subject}\n  ${body.replace(/\n/g, '\n  ')}`,
  )
}

/** Capture authorized payments so the order moves to a paid state. */
async function captureOrderPayments(
  order: PlacedOrder,
  container: MedusaContainer,
  logger: Log,
): Promise<void> {
  const payments = (order.payment_collections ?? []).flatMap((pc) => pc.payments ?? [])
  for (const payment of payments) {
    if (!payment?.id || payment.captured_at) continue
    try {
      await capturePaymentWorkflow(container).run({ input: { payment_id: payment.id } })
      logger.info(
        `order.placed: captured payment ${payment.id} (order #${order.display_id})`,
      )
    } catch (err) {
      logger.error(
        `order.placed: capture failed for ${payment.id} — ${(err as Error).message}`,
      )
      await captureError(err, {
        scope: 'order.placed/capture',
        order_id: order.id,
        display_id: order.display_id,
        payment_id: payment.id,
      })
    }
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed',
}
