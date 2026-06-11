import crypto from 'node:crypto'
import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { sendEmail } from '../lib/email'
import { captureError } from '../lib/observability'

type Log = { info(m: string): void; warn(m: string): void; error(m: string): void }
type Query = {
  graph(config: {
    entity: string
    fields: string[]
    filters?: Record<string, unknown>
    pagination?: { take?: number }
  }): Promise<{ data: AbandonedCart[] }>
}
type CartService = {
  updateCarts(data: { id: string; metadata: Record<string, unknown> }): Promise<unknown>
}

interface CartItem {
  title: string
  product_title: string | null
  quantity: number
  unit_price: number
}
interface AbandonedCart {
  id: string
  email: string | null
  created_at: string
  completed_at: string | null
  currency_code: string
  metadata: Record<string, unknown> | null
  items?: CartItem[]
}

// Stage thresholds in minutes (env-overridable so the sequence is easy to test).
const STAGE_MINUTES = [
  0,
  Number(process.env.ABANDONED_STAGE1_MINUTES ?? 60), // +1h reminder
  Number(process.env.ABANDONED_STAGE2_MINUTES ?? 24 * 60), // +24h with contents
  Number(process.env.ABANDONED_STAGE3_MINUTES ?? 48 * 60), // +48h with incentive
]
const MAX_STAGE = 3
const INCENTIVE_CODE = process.env.ABANDONED_INCENTIVE_CODE ?? 'COMEBACK10'

function recoveryUrl(cartId: string): string {
  const base = (process.env.STOREFRONT_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const secret = process.env.RECOVERY_SECRET
  const token = secret
    ? crypto.createHmac('sha256', secret).update(cartId).digest('hex')
    : ''
  const q = token ? `?cart_id=${cartId}&token=${token}` : `?cart_id=${cartId}`
  return `${base}/cart/recover${q}`
}

function usd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

function itemsHtml(items: CartItem[]): string {
  return items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;">${i.product_title ?? i.title} × ${i.quantity}</td>` +
        `<td style="padding:6px 0;text-align:right;">${usd(i.unit_price * i.quantity)}</td></tr>`,
    )
    .join('')
}

function buildEmail(
  stage: number,
  cart: AbandonedCart,
  url: string,
): { subject: string; html: string; text: string } {
  const items = cart.items ?? []
  const button = `<a href="${url}" style="display:inline-block;background:#B5571F;color:#fff;text-decoration:none;padding:12px 28px;border-radius:9999px;font-weight:600;">Return to your bag</a>`
  const wrap = (inner: string) =>
    `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;color:#1A1310;">${inner}<p style="margin-top:28px;font-size:12px;color:#999;">You're receiving this because you started an order at BodyScent.</p></div>`

  if (stage === 1) {
    return {
      subject: 'You left something behind 🛍️',
      html: wrap(
        `<h1 style="font-size:22px;">Your scent is waiting</h1>` +
          `<p>You left a few things in your bag — they're still here. Pick up right where you left off.</p>` +
          `<p style="margin:24px 0;">${button}</p>`,
      ),
      text: `Your bag is waiting at BodyScent. Return to it: ${url}`,
    }
  }
  if (stage === 2) {
    return {
      subject: 'Still thinking it over? Your bag is saved',
      html: wrap(
        `<h1 style="font-size:22px;">Here's what's in your bag</h1>` +
          `<table style="width:100%;border-collapse:collapse;margin:12px 0;">${itemsHtml(items)}</table>` +
          `<p style="margin:24px 0;">${button}</p>`,
      ),
      text: `Your BodyScent bag is saved. Complete your order: ${url}`,
    }
  }
  return {
    subject: `A little something to complete your order — ${INCENTIVE_CODE}`,
    html: wrap(
      `<h1 style="font-size:22px;">Here's 10% off, on us</h1>` +
        `<p>Use code <strong style="background:#FCF6EF;padding:2px 8px;border-radius:6px;">${INCENTIVE_CODE}</strong> at checkout.</p>` +
        `<table style="width:100%;border-collapse:collapse;margin:12px 0;">${itemsHtml(items)}</table>` +
        `<p style="margin:24px 0;">${button}</p>`,
    ),
    text: `Complete your BodyScent order with ${INCENTIVE_CODE} for 10% off: ${url}`,
  }
}

/**
 * Hourly abandoned-cart recovery. For each active (un-completed) cart with an
 * email, sends a staged sequence — +1h reminder, +24h with contents, +48h with
 * an incentive — one stage per run, anchored on cart age. The sent stage is
 * recorded in the cart's metadata so each email goes out once; completed carts
 * are excluded, so converting suppresses all further sends.
 */
export default async function abandonedCartRecovery(
  container: MedusaContainer,
): Promise<void> {
  const logger = container.resolve<Log>(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve<Query>(ContainerRegistrationKeys.QUERY)
  const cartService = container.resolve(Modules.CART) as unknown as CartService

  try {
    const { data: carts } = await query.graph({
      entity: 'cart',
      fields: [
        'id',
        'email',
        'created_at',
        'completed_at',
        'currency_code',
        'metadata',
        'items.title',
        'items.product_title',
        'items.quantity',
        'items.unit_price',
      ],
      filters: { completed_at: null },
      pagination: { take: 1000 },
    })

    const now = Date.now()
    let sent = 0

    for (const cart of carts) {
      if (cart.completed_at || !cart.email) continue
      if (!cart.items || cart.items.length === 0) continue

      const recovery = (cart.metadata?.recovery ?? {}) as { stage?: number }
      const sentStage = Number(recovery.stage ?? 0)
      if (sentStage >= MAX_STAGE) continue

      const nextStage = sentStage + 1
      const ageMin = (now - new Date(cart.created_at).getTime()) / 60000
      if (ageMin < STAGE_MINUTES[nextStage]!) continue

      const url = recoveryUrl(cart.id)
      const email = buildEmail(nextStage, cart, url)
      const ok = await sendEmail({ to: cart.email, ...email }, logger)
      if (!ok) continue

      await cartService.updateCarts({
        id: cart.id,
        metadata: {
          ...(cart.metadata ?? {}),
          recovery: { stage: nextStage, last_sent_at: new Date().toISOString() },
        },
      })
      sent++
      logger.info(`[recovery] cart ${cart.id} → stage ${nextStage} (${cart.email})`)
    }

    logger.info(
      `[recovery] scanned ${carts.length} active carts, sent ${sent} recovery email(s)`,
    )
  } catch (err) {
    logger.error(`[recovery] job failed — ${(err as Error).message}`)
    await captureError(err, { scope: 'job/abandoned-cart-recovery' })
  }
}

export const config = {
  name: 'abandoned-cart-recovery',
  // Hourly.
  schedule: '0 * * * *',
}
