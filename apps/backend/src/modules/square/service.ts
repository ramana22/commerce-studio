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

export interface SquareOptions {
  accessToken: string
  applicationId: string
  locationId: string
  /** 'sandbox' (default) or 'production'. */
  environment?: 'sandbox' | 'production'
  /** Optional — required only if you enable Square webhooks. */
  webhookSignatureKey?: string
}

interface InjectedDependencies {
  logger: Logger
}

interface SquarePayment {
  id: string
  status: 'APPROVED' | 'COMPLETED' | 'CANCELED' | 'FAILED' | 'PENDING'
  amount_money?: { amount: number; currency: string }
}

const SQUARE_VERSION = '2025-01-23'

/**
 * Square payment provider for Medusa v2.
 *
 * Talks to the Square Payments API directly (no SDK dependency). The storefront
 * tokenizes the customer's card with the Square Web Payments SDK and passes the
 * resulting single-use token into the payment session; this provider then creates
 * the Square payment on authorization and completes (captures) it on capture.
 */
export default class SquareProviderService extends AbstractPaymentProvider<SquareOptions> {
  static override identifier = 'square'

  protected readonly options_: SquareOptions
  protected readonly logger_: Logger

  constructor(container: Record<string, unknown>, options: SquareOptions) {
    super(container, options)
    this.options_ = options
    this.logger_ = (container as unknown as InjectedDependencies).logger
  }

  static override validateOptions(options: Record<string, unknown>): void {
    if (!options.accessToken || !options.applicationId || !options.locationId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Square provider requires `accessToken`, `applicationId` and `locationId` options.',
      )
    }
  }

  // ── REST helper ────────────────────────────────────────────────────────────

  private baseUrl(): string {
    return this.options_.environment === 'production'
      ? 'https://connect.squareup.com'
      : 'https://connect.squareupsandbox.com'
  }

  private async request<T>(
    path: string,
    init?: { method?: string; body?: unknown },
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl()}${path}`, {
      method: init?.method ?? 'GET',
      headers: {
        Authorization: `Bearer ${this.options_.accessToken}`,
        'Square-Version': SQUARE_VERSION,
        'Content-Type': 'application/json',
      },
      body: init?.body ? JSON.stringify(init.body) : undefined,
    })
    if (!res.ok) {
      const text = await res.text()
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Square request ${path} failed (${res.status}): ${text}`,
      )
    }
    return (await res.json()) as T
  }

  private mapStatus(
    status: SquarePayment['status'] | undefined,
  ): 'captured' | 'authorized' | 'pending' | 'error' | 'canceled' {
    switch (status) {
      case 'COMPLETED':
        return 'captured'
      case 'APPROVED':
        return 'authorized'
      case 'FAILED':
        return 'error'
      case 'CANCELED':
        return 'canceled'
      default:
        return 'pending'
    }
  }

  // ── Provider contract ────────────────────────────────────────────────────────

  /**
   * Square creates no server-side resource up front — it just exposes the public
   * application/location ids the storefront needs to render the Web Payments card
   * form. The card token is added to the session data before authorization.
   */
  async initiatePayment(
    input: InitiatePaymentInput,
  ): Promise<InitiatePaymentOutput> {
    const incoming = input.data ?? {}
    return {
      id: `sq_${crypto.randomUUID()}`,
      data: {
        application_id: this.options_.applicationId,
        location_id: this.options_.locationId,
        environment: this.options_.environment ?? 'sandbox',
        amount: Math.round(Number(input.amount)),
        currency_code: input.currency_code,
        // Single-use card token from the storefront's Web Payments tokenization,
        // forwarded so authorizePayment can create the Square payment.
        ...(incoming.token ? { token: incoming.token as string } : {}),
      },
      status: 'pending',
    }
  }

  async authorizePayment(
    input: AuthorizePaymentInput,
  ): Promise<AuthorizePaymentOutput> {
    const data = input.data ?? {}
    // Already authorized/captured on a previous attempt.
    if (data.square_payment_id) {
      const existing = await this.request<{ payment: SquarePayment }>(
        `/v2/payments/${data.square_payment_id as string}`,
      )
      return { status: this.mapStatus(existing.payment.status), data }
    }

    const token = data.token as string | undefined
    if (!token) return { status: 'pending', data }

    const amount = Math.round(Number(data.amount ?? 0))
    const currency = String(data.currency_code ?? 'usd').toUpperCase()

    const { payment } = await this.request<{ payment: SquarePayment }>(
      '/v2/payments',
      {
        method: 'POST',
        body: {
          source_id: token,
          idempotency_key: crypto.randomUUID(),
          location_id: this.options_.locationId,
          amount_money: { amount, currency },
          // Authorize only; capture happens in capturePayment.
          autocomplete: false,
        },
      },
    )

    return {
      status: this.mapStatus(payment.status),
      data: { ...data, square_payment_id: payment.id },
    }
  }

  async capturePayment(
    input: CapturePaymentInput,
  ): Promise<CapturePaymentOutput> {
    const paymentId = input.data?.square_payment_id as string | undefined
    if (!paymentId) return { data: input.data ?? {} }

    const existing = await this.request<{ payment: SquarePayment }>(
      `/v2/payments/${paymentId}`,
    )
    if (existing.payment.status === 'COMPLETED') {
      return { data: { ...input.data, captured: true } }
    }

    await this.request(`/v2/payments/${paymentId}/complete`, { method: 'POST' })
    return { data: { ...input.data, captured: true } }
  }

  async refundPayment(
    input: RefundPaymentInput,
  ): Promise<RefundPaymentOutput> {
    const paymentId = input.data?.square_payment_id as string | undefined
    if (!paymentId) return { data: input.data ?? {} }

    const currency = String(input.data?.currency_code ?? 'usd').toUpperCase()
    const refund = await this.request<{ refund: { id: string } }>(
      '/v2/refunds',
      {
        method: 'POST',
        body: {
          idempotency_key: crypto.randomUUID(),
          payment_id: paymentId,
          amount_money: { amount: Math.round(Number(input.amount)), currency },
        },
      },
    )
    return { data: { ...input.data, last_refund_id: refund.refund.id } }
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput,
  ): Promise<GetPaymentStatusOutput> {
    const paymentId = input.data?.square_payment_id as string | undefined
    if (!paymentId) return { status: 'pending', data: input.data ?? {} }

    const { payment } = await this.request<{ payment: SquarePayment }>(
      `/v2/payments/${paymentId}`,
    )
    const status = this.mapStatus(payment.status)
    return {
      status: status === 'canceled' ? 'canceled' : status,
      data: input.data ?? {},
    }
  }

  async retrievePayment(
    input: RetrievePaymentInput,
  ): Promise<RetrievePaymentOutput> {
    const paymentId = input.data?.square_payment_id as string | undefined
    if (!paymentId) return { data: input.data ?? {} }
    const { payment } = await this.request<{ payment: SquarePayment }>(
      `/v2/payments/${paymentId}`,
    )
    return { data: { ...input.data, payment } }
  }

  async updatePayment(
    input: UpdatePaymentInput,
  ): Promise<UpdatePaymentOutput> {
    // Nothing is created remotely until authorization, so an update just refreshes
    // the amount carried in the session data.
    return {
      data: {
        ...(input.data ?? {}),
        amount: Math.round(Number(input.amount)),
      },
    }
  }

  async cancelPayment(
    input: CancelPaymentInput,
  ): Promise<CancelPaymentOutput> {
    const paymentId = input.data?.square_payment_id as string | undefined
    if (!paymentId) return { data: input.data ?? {} }
    try {
      await this.request(`/v2/payments/${paymentId}/cancel`, { method: 'POST' })
    } catch {
      // Already captured/canceled — nothing to undo.
    }
    return { data: input.data ?? {} }
  }

  async deletePayment(
    input: DeletePaymentInput,
  ): Promise<DeletePaymentOutput> {
    return this.cancelPayment(input)
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload['payload'],
  ): Promise<WebhookActionResult> {
    const key = this.options_.webhookSignatureKey
    const signature = payload.headers?.['x-square-hmacsha256-signature'] as
      | string
      | undefined

    // Verify the webhook signature when a signature key is configured.
    if (key) {
      const notificationUrl = (payload.headers?.['x-square-notification-url'] as string) ?? ''
      const expected = crypto
        .createHmac('sha256', key)
        .update(notificationUrl + (payload.rawData as string | Buffer))
        .digest('base64')
      if (!signature || expected !== signature) {
        return { action: 'failed' }
      }
    }

    const body = payload.data as {
      type?: string
      data?: { object?: { payment?: SquarePayment } }
    }
    const payment = body.data?.object?.payment
    const amount = Number(payment?.amount_money?.amount ?? 0)
    const sessionId = payment?.id ?? ''

    switch (body.type) {
      case 'payment.updated':
        if (payment?.status === 'COMPLETED') {
          return { action: 'captured', data: { session_id: sessionId, amount } }
        }
        if (payment?.status === 'APPROVED') {
          return { action: 'authorized', data: { session_id: sessionId, amount } }
        }
        if (payment?.status === 'FAILED' || payment?.status === 'CANCELED') {
          return { action: 'failed', data: { session_id: sessionId, amount } }
        }
        return { action: 'not_supported' }
      default:
        return { action: 'not_supported' }
    }
  }
}
