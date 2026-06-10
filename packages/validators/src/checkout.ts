import { z } from 'zod'

/**
 * Indian postal address used for shipping and billing.
 * Field names mirror Medusa's address payload so the schema output can be
 * passed straight to the Store API.
 */
export const AddressSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  address_1: z.string().min(1, 'Address is required'),
  address_2: z.string().optional().default(''),
  city: z.string().min(1, 'City is required'),
  /** Indian state — stored in Medusa's `province` field. */
  province: z.string().min(1, 'State is required'),
  postal_code: z.string().regex(/^\d{6}$/, 'PIN code must be 6 digits'),
  country_code: z.string().length(2).default('in'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
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
