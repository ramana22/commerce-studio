import crypto from 'node:crypto'
import { AbstractPaymentProvider, MedusaError } from '@medusajs/framework/utils'
import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  Logger,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from '@medusajs/framework/types'

export interface RazorpayOptions {
  keyId: string
  keySecret: string
  /** Optional — required only if you enable Razorpay webhooks. */
  webhookSecret?: string
}

interface InjectedDependencies {
  logger: Logger
}

interface RazorpayPayment {
  id: string
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed'
  amount: number
  currency: string
}

const RAZORPAY_API = 'https://api.razorpay.com/v1'

/**
 * Razorpay payment provider for Medusa v2.
 *
 * Talks to Razorpay's REST API directly (no SDK dependency). The provider
 * creates an Order at session-initiation; the storefront opens Razorpay
 * Checkout with that order; on completion Medusa authorizes the payment by
 * verifying its captured/authorized status with Razorpay server-side.
 */
export default class RazorpayProviderService extends AbstractPaymentProvider<RazorpayOptions> {
  static override identifier = 'razorpay'

  protected readonly options_: RazorpayOptions
  protected readonly logger_: Logger

  constructor(container: Record<string, unknown>, options: RazorpayOptions) {
    super(container, options)
    this.options_ = options
    this.logger_ = (container as unknown as InjectedDependencies).logger
  }

  static override validateOptions(options: Record<string, unknown>): void {
    if (!options.keyId || !options.keySecret) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Razorpay provider requires `keyId` and `keySecret` options.',
      )
    }
  }

  // ── REST helper ────────────────────────────────────────────────────────────

  private authHeader(): string {
    const token = Buffer.from(
      `${this.options_.keyId}:${this.options_.keySecret}`,
    ).toString('base64')
    return `Basic ${token}`
  }

  private async request<T>(
    path: string,
    init?: { method?: string; body?: unknown },
  ): Promise<T> {
    const res = await fetch(`${RAZORPAY_API}${path}`, {
      method: init?.method ?? 'GET',
      headers: {
        Authorization: this.authHeader(),
        'Content-Type': 'application/json',
      },
      body: init?.body ? JSON.stringify(init.body) : undefined,
    })
    if (!res.ok) {
      const text = await res.text()
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Razorpay request ${path} failed (${res.status}): ${text}`,
      )
    }
    return (await res.json()) as T
  }

  /** Find the most relevant payment on a Razorpay order. */
  private async orderPayment(
    orderId: string,
  ): Promise<RazorpayPayment | undefined> {
    const { items } = await this.request<{ items: RazorpayPayment[] }>(
      `/orders/${orderId}/payments`,
    )
    return (
      items.find((p) => p.status === 'captured') ??
      items.find((p) => p.status === 'authorized') ??
      items[0]
    )
  }

  // ── Provider contract ────────────────────────────────────────────────────────

  async initiatePayment(
    input: InitiatePaymentInput,
  ): Promise<InitiatePaymentOutput> {
    const amount = Math.round(Number(input.amount))
    const order = await this.request<{ id: string; amount: number }>(
      '/orders',
      {
        method: 'POST',
        body: {
          amount,
          currency: input.currency_code.toUpperCase(),
          notes: { source: 'sugar-store' },
        },
      },
    )

    return {
      id: order.id,
      // Exposed to the storefront — public values only.
      data: {
        razorpay_order_id: order.id,
        amount,
        currency_code: input.currency_code,
        key_id: this.options_.keyId,
      },
      status: 'pending',
    }
  }

  async authorizePayment(
    input: AuthorizePaymentInput,
  ): Promise<AuthorizePaymentOutput> {
    const orderId = input.data?.razorpay_order_id as string | undefined
    if (!orderId) return { status: 'error', data: input.data ?? {} }

    const payment = await this.orderPayment(orderId)
    if (!payment) return { status: 'pending', data: input.data ?? {} }

    const status =
      payment.status === 'captured'
        ? ('captured' as const)
        : payment.status === 'authorized'
          ? ('authorized' as const)
          : ('pending' as const)

    return {
      status,
      data: { ...input.data, razorpay_payment_id: payment.id },
    }
  }

  async capturePayment(
    input: CapturePaymentInput,
  ): Promise<CapturePaymentOutput> {
    const paymentId = input.data?.razorpay_payment_id as string | undefined
    if (!paymentId) return { data: input.data ?? {} }

    const existing = await this.request<RazorpayPayment>(
      `/payments/${paymentId}`,
    )
    if (existing.status === 'captured') {
      return { data: { ...input.data, captured: true } }
    }

    await this.request(`/payments/${paymentId}/capture`, {
      method: 'POST',
      body: { amount: existing.amount, currency: existing.currency },
    })
    return { data: { ...input.data, captured: true } }
  }

  async refundPayment(
    input: RefundPaymentInput,
  ): Promise<RefundPaymentOutput> {
    const paymentId = input.data?.razorpay_payment_id as string | undefined
    if (!paymentId) return { data: input.data ?? {} }

    const refund = await this.request<{ id: string }>(
      `/payments/${paymentId}/refund`,
      { method: 'POST', body: { amount: Math.round(Number(input.amount)) } },
    )
    return { data: { ...input.data, last_refund_id: refund.id } }
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput,
  ): Promise<GetPaymentStatusOutput> {
    const orderId = input.data?.razorpay_order_id as string | undefined
    if (!orderId) return { status: 'pending', data: input.data ?? {} }

    const payment = await this.orderPayment(orderId)
    switch (payment?.status) {
      case 'captured':
        return { status: 'captured', data: input.data ?? {} }
      case 'authorized':
        return { status: 'authorized', data: input.data ?? {} }
      case 'failed':
        return { status: 'error', data: input.data ?? {} }
      default:
        return { status: 'pending', data: input.data ?? {} }
    }
  }

  async retrievePayment(
    input: RetrievePaymentInput,
  ): Promise<RetrievePaymentOutput> {
    const orderId = input.data?.razorpay_order_id as string | undefined
    if (!orderId) return { data: input.data ?? {} }
    const order = await this.request<Record<string, unknown>>(
      `/orders/${orderId}`,
    )
    return { data: { ...input.data, order } }
  }

  async updatePayment(
    input: UpdatePaymentInput,
  ): Promise<UpdatePaymentOutput> {
    // Razorpay orders are immutable; re-initiate with the new amount.
    return this.initiatePayment(input)
  }

  async cancelPayment(
    input: CancelPaymentInput,
  ): Promise<CancelPaymentOutput> {
    // Razorpay has no order-cancel endpoint; nothing to do remotely.
    return { data: input.data ?? {} }
  }

  async deletePayment(
    input: DeletePaymentInput,
  ): Promise<DeletePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload['payload'],
  ): Promise<WebhookActionResult> {
    const secret = this.options_.webhookSecret
    const signature = payload.headers?.['x-razorpay-signature'] as
      | string
      | undefined

    // Verify the webhook signature when a secret is configured.
    if (secret) {
      const expected = crypto
        .createHmac('sha256', secret)
        .update(payload.rawData as string | Buffer)
        .digest('hex')
      if (!signature || expected !== signature) {
        return { action: 'failed' }
      }
    }

    const body = payload.data as {
      event?: string
      payload?: {
        payment?: { entity?: { order_id?: string; amount?: number; notes?: Record<string, unknown> } }
      }
    }
    const entity = body.payload?.payment?.entity
    const sessionId = (entity?.notes?.session_id as string) ?? ''
    const amount = Number(entity?.amount ?? 0)

    switch (body.event) {
      case 'payment.captured':
        return { action: 'captured', data: { session_id: sessionId, amount } }
      case 'payment.authorized':
        return { action: 'authorized', data: { session_id: sessionId, amount } }
      case 'payment.failed':
        return { action: 'failed', data: { session_id: sessionId, amount } }
      default:
        return { action: 'not_supported' }
    }
  }
}
