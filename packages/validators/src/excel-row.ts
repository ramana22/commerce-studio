import { z } from 'zod'
import { CategorySchema } from './category'

/**
 * Shape of one row in master-catalog.xlsx.
 * One row = one variant.  Multiple rows with the same handle = one product with multiple shades.
 */
export const ExcelCatalogRowSchema = z
  .object({
    handle: z
      .string()
      .min(1, 'Handle is required')
      .regex(/^[a-z0-9-]+$/, 'Handle must be lowercase kebab-case (a-z, 0-9, hyphens only)'),

    title: z.string().min(1, 'Title is required'),

    description: z.string().optional().default(''),

    category: CategorySchema,

    subcategory: z.string().optional(),

    shade_name: z.string().optional(),

    // 6-char hex without leading #  e.g. "E85462"
    shade_hex: z
      .string()
      .regex(/^[0-9A-Fa-f]{6}$/, 'Must be a 6-character hex colour code (no leading #)')
      .optional(),

    sku: z.string().min(1, 'SKU is required'),

    price: z
      .number({ invalid_type_error: 'Price must be a number' })
      .positive('Price must be positive'),

    msrp: z
      .number({ invalid_type_error: 'MSRP must be a number' })
      .positive('MSRP must be positive'),

    stock: z
      .number({ invalid_type_error: 'Stock must be a number' })
      .int('Stock must be a whole number')
      .min(0, 'Stock cannot be negative'),

    is_new_launch: z.boolean().default(false),

    is_bestseller: z.boolean().default(false),

    badge: z.string().optional(),

    review_count: z.number().int().min(0).optional(),

    main_image: z.string().min(1, 'Main image filename is required'),

    hover_image: z.string().optional(),

    // Semicolon-separated filenames  e.g. "img-a.jpg;img-b.jpg"
    gallery_images: z.string().optional(),
  })
  .refine((d) => d.msrp >= d.price, {
    message: 'MSRP must be ≥ selling price',
    path: ['msrp'],
  })

export type ExcelCatalogRow = z.infer<typeof ExcelCatalogRowSchema>

export const REQUIRED_EXCEL_COLUMNS = [
  'handle',
  'title',
  'category',
  'sku',
  'price',
  'msrp',
  'stock',
  'main_image',
] as const

export type RequiredExcelColumn = (typeof REQUIRED_EXCEL_COLUMNS)[number]
