import { z } from 'zod'
import { CategorySchema } from './category'

export const ProductImageSchema = z.object({
  filename: z.string().min(1),
  url: z.string().url().optional(),
  alt: z.string().optional(),
  position: z.number().int().min(1),
})
export type ProductImage = z.infer<typeof ProductImageSchema>

export const ProductVariantSchema = z
  .object({
    sku: z.string().min(1, 'SKU is required'),
    shade_name: z.string().optional(),
    shade_hex: z
      .string()
      .regex(/^[0-9A-Fa-f]{6}$/, 'Must be a 6-character hex colour (no leading #)')
      .optional(),
    price: z.number().positive('Price must be positive'),
    mrp: z.number().positive('MRP must be positive'),
    stock: z.number().int().min(0, 'Stock cannot be negative'),
    media_filename: z.string().optional(),
  })
  .refine((d) => d.mrp >= d.price, {
    message: 'MRP must be ≥ selling price',
    path: ['mrp'],
  })
export type ProductVariant = z.infer<typeof ProductVariantSchema>

export const ProductSchema = z.object({
  handle: z.string().regex(/^[a-z0-9-]+$/, 'Handle must be lowercase kebab-case'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: CategorySchema,
  subcategory: z.string().optional(),
  is_new_launch: z.boolean().default(false),
  is_bestseller: z.boolean().default(false),
  badge: z.string().optional(),
  review_count: z.number().int().min(0).optional(),
  main_image: z.string().min(1, 'Main image filename is required'),
  hover_image: z.string().optional(),
  gallery_images: z.array(z.string()).default([]),
  variants: z.array(ProductVariantSchema).min(1, 'At least one variant required'),
})
export type Product = z.infer<typeof ProductSchema>
