import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

/** Minimal logger surface used by this subscriber. */
type Log = {
  info(message: string): void
  warn(message: string): void
  debug(message: string): void
}

/**
 * product.{created,updated,deleted} → ping the storefront's revalidate route so
 * Next.js purges the ISR cache for catalog pages and the change shows up without
 * a full redeploy.
 *
 * Set STOREFRONT_URL to enable; REVALIDATE_SECRET (optional) is forwarded so the
 * route can authenticate the request.
 */
export default async function productUpdatedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>): Promise<void> {
  const logger = container.resolve<Log>(ContainerRegistrationKeys.LOGGER)

  const storefrontUrl = process.env.STOREFRONT_URL
  if (!storefrontUrl) {
    logger.debug(`${event.name}: STOREFRONT_URL not set — skipping revalidation`)
    return
  }

  const secret = process.env.REVALIDATE_SECRET
  const endpoint = `${storefrontUrl.replace(/\/$/, '')}/api/revalidate`

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(secret ? { 'x-revalidate-secret': secret } : {}),
      },
      body: JSON.stringify({ type: 'product', id: event.data.id, event: event.name }),
    })
    if (!res.ok) {
      throw new Error(`${res.status}: ${await res.text()}`)
    }
    logger.info(`${event.name}: revalidated storefront for product ${event.data.id}`)
  } catch (err) {
    logger.warn(
      `${event.name}: storefront revalidation failed (${endpoint}) — ${(err as Error).message}`,
    )
  }
}

export const config: SubscriberConfig = {
  event: ['product.created', 'product.updated', 'product.deleted'],
}
