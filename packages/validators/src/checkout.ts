import { z } from 'zod'

/**
 * US postal address used for shipping and billing.
 * Field names mirror Medusa's address payload so the schema output can be
 * passed straight to the Store API.
 */
export const AddressSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  address_1: z.string().min(1, 'Address is required'),
  address_2: z.string().optional().default(''),
  city: z.string().min(1, 'City is required'),
  /** US state (two-letter code or name) — stored in Medusa's `province` field. */
  province: z.string().min(1, 'State is required'),
  // US ZIP code: 5 digits, optionally followed by a 4-digit ZIP+4 extension.
  postal_code: z.string().regex(/^\d{5}(-\d{4})?$/, 'Enter a valid ZIP code'),
  country_code: z.string().length(2).default('us'),
  phone: z
    .string()
    .regex(/^\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/, 'Enter a valid US phone number'),
})
export type Address = z.infer<typeof AddressSchema>

/** Contact step — the email an order confirmation is sent to. */
export const CheckoutContactSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})
export type CheckoutContact = z.infer<typeof CheckoutContactSchema>

/**
 * Full checkout payload. When `billing_same_as_shipping` is true the billing
 * address is omitted and the shipping address is reused server-side.
 */
export const CheckoutSchema = CheckoutContactSchema.extend({
  shipping_address: AddressSchema,
  billing_same_as_shipping: z.boolean().default(true),
  billing_address: AddressSchema.optional(),
}).refine(
  (d) => d.billing_same_as_shipping || d.billing_address !== undefined,
  {
    message: 'Billing address is required when it differs from shipping',
    path: ['billing_address'],
  },
)
export type CheckoutInput = z.infer<typeof CheckoutSchema>
