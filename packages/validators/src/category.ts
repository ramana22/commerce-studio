import { z } from 'zod'

export const CATEGORIES = [
  'LIPS',
  'EYES',
  'FACE',
  'NAILS',
  'SKIN',
  'GIFTING',
  'SUGAR_POP',
  '249_STORE',
  'KITS',
] as const

export const CategorySchema = z.enum(CATEGORIES)
export type Category = z.infer<typeof CategorySchema>
