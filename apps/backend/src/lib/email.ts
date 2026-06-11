/**
 * Transactional email helper. Prefers Resend (Phase 12), falls back to SendGrid,
 * and logs when neither is configured so flows stay observable in dev. Returns
 * whether the message was "handled" (sent, or logged in dev) — callers use this
 * to decide whether to advance a sequence.
 */
type Log = { info(m: string): void; error(m: string): void }

export interface EmailInput {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(
  input: EmailInput,
  logger?: Log,
): Promise<boolean> {
  const from = process.env.EMAIL_FROM ?? 'noreply@bodyscent.com'
  const fromName = 'BodyScent'

  // 1. Resend (preferred).
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${fromName} <${from}>`,
          to: input.to,
          subject: input.subject,
          html: input.html,
          text: input.text,
        }),
      })
      if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`)
      return true
    } catch (err) {
      logger?.error(`[email] Resend failed — ${(err as Error).message}`)
      return false
    }
  }

  // 2. SendGrid (fallback).
  const sendgridKey = process.env.SENDGRID_API_KEY
  if (sendgridKey) {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sendgridKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: input.to }] }],
          from: { email: from, name: fromName },
          subject: input.subject,
          content: [
            { type: 'text/plain', value: input.text ?? '' },
            { type: 'text/html', value: input.html },
          ],
        }),
      })
      if (!res.ok) throw new Error(`SendGrid ${res.status}: ${await res.text()}`)
      return true
    } catch (err) {
      logger?.error(`[email] SendGrid failed — ${(err as Error).message}`)
      return false
    }
  }

  // 3. No provider — log so the flow is observable in dev, and treat as handled.
  logger?.info(`[email] (no provider) → ${input.to}: ${input.subject}`)
  return true
}
