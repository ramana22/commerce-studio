#!/usr/bin/env tsx
/**
 * Catalog Transform — Phase 4
 *
 * Groups validated ExcelCatalogRows by handle and converts them into
 * Medusa 2.x Admin API product payloads ready for import.ts to upsert.
 *
 * Standalone usage: pnpm --filter @sugar-store/catalog-import transform
 * Prints a summary of what would be imported to stdout.
 */
import * as XLSX from 'xlsx'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { ExcelCatalogRowSchema, type ExcelCatalogRow } from '@sugar-store/validators/excel-row'

// ── Medusa Admin API payload shapes ───────────────────────────────────────────

export interface MedusaPrice {
  currency_code: string
  amount: number
  compare_at_price?: number
}

export interface MedusaVariantPayload {
  title: string
  sku: string
  manage_inventory: boolean
  allow_backorder: boolean
  prices: MedusaPrice[]
  options: Record<string, string>
  metadata: Record<string, unknown>
  /** Used after creation to seed stock; not sent directly to API. */
  _inventory_quantity: number
}

export interface MedusaProductPayload {
  title: string
  handle: string
  description: string
  status: 'published' | 'draft'
  options: Array<{ title: string; values: string[] }>
  variants: MedusaVariantPayload[]
  metadata: Record<string, unknown>
  /** Resolved category IDs injected by import.ts before the API call. */
  category_ids?: string[]
}

// ── Core transform ────────────────────────────────────────────────────────────

/**
 * Groups Excel rows by handle (each group = one Medusa product)
 * and maps fields to the Medusa Admin API shape.
 *
 * Prices are stored in paise (INR × 100) as required by Medusa.
 */
export function transformRows(rows: ExcelCatalogRow[]): MedusaProductPayload[] {
  const grouped = new Map<string, ExcelCatalogRow[]>()
  for (const row of rows) {
    const group = grouped.get(row.handle) ?? []
    group.push(row)
    grouped.set(row.handle, group)
  }

  const products: MedusaProductPayload[] = []

  for (const [handle, variantRows] of grouped) {
    const first = variantRows[0]!
    const hasShades = variantRows.some((v) => !!v.shade_name)

    const options: MedusaProductPayload['options'] = hasShades
      ? [{ title: 'Shade', values: variantRows.map((v) => v.shade_name ?? 'Default') }]
      : []

    const variants: MedusaVariantPayload[] = variantRows.map((v) => {
      const priceInPaise = Math.round(v.price * 100)
      const mrpInPaise = Math.round(v.mrp * 100)

      const price: MedusaPrice = {
        currency_code: 'inr',
        amount: priceInPaise,
        ...(v.mrp > v.price && { compare_at_price: mrpInPaise }),
      }

      return {
        title: v.shade_name ?? 'Default',
        sku: v.sku,
        manage_inventory: true,
        allow_backorder: false,
        prices: [price],
        options: hasShades ? { Shade: v.shade_name ?? 'Default' } : ({} as Record<string, string>),
        metadata: {
          shade_hex: v.shade_hex ?? null,
          media_filename: v.main_image,
          hover_image: v.hover_image ?? null,
        },
        _inventory_quantity: v.stock,
      }
    })

    const galleryImages = first.gallery_images
      ? first.gallery_images
          .split(';')
          .map((s) => s.trim())
          .filter(Boolean)
      : []

    products.push({
      title: first.title,
      handle,
      description: first.description ?? '',
      status: 'published',
      options,
      variants,
      metadata: {
        category: first.category,
        subcategory: first.subcategory ?? null,
        is_new_launch: first.is_new_launch,
        is_bestseller: first.is_bestseller,
        badge: first.badge ?? null,
        review_count: first.review_count ?? null,
        main_image: first.main_image,
        hover_image: first.hover_image ?? null,
        gallery_images: galleryImages,
      },
    })
  }

  return products
}

// ── Standalone entrypoint ─────────────────────────────────────────────────────

function preprocessRow(raw: Record<string, unknown>): Record<string, unknown> {
  const toNum = (v: unknown): unknown => {
    if (typeof v === 'number') return v
    if (typeof v === 'string' && v.trim() !== '') {
      const n = Number(v.replace(/[₹,\s]/g, ''))
      return isNaN(n) ? v : n
    }
    return v
  }
  const toBool = (v: unknown): boolean => {
    if (typeof v === 'boolean') return v
    if (v === 1 || v === '1') return true
    const s = String(v ?? '').toLowerCase().trim()
    return s === 'true' || s === 'yes'
  }
  return {
    ...raw,
    price: toNum(raw['price']),
    mrp: toNum(raw['mrp']),
    stock: toNum(raw['stock']),
    review_count:
      raw['review_count'] != null && raw['review_count'] !== ''
        ? toNum(raw['review_count'])
        : undefined,
    is_new_launch: toBool(raw['is_new_launch']),
    is_bestseller: toBool(raw['is_bestseller']),
  }
}

function findRepoRoot(): string {
  let dir = path.resolve(__dirname)
  while (path.dirname(dir) !== dir) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir
    dir = path.dirname(dir)
  }
  throw new Error('Repository root not found (no pnpm-workspace.yaml in any parent directory)')
}

function main(): void {
  const REPO_ROOT = findRepoRoot()
  const CATALOG_PATH = path.join(REPO_ROOT, 'data/master-catalog.xlsx')

  if (!fs.existsSync(CATALOG_PATH)) {
    console.error('\n  No catalog found at data/master-catalog.xlsx')
    console.error('  Run: pnpm catalog:sample\n')
    process.exit(1)
  }

  const wb = XLSX.readFile(CATALOG_PATH)
  const sheetName = wb.SheetNames[0]!
  const sheet = wb.Sheets[sheetName]!
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: undefined,
    raw: true,
  })

  const validRows: ExcelCatalogRow[] = []
  let invalidCount = 0
  for (const raw of rawRows) {
    const result = ExcelCatalogRowSchema.safeParse(preprocessRow(raw))
    if (result.success) validRows.push(result.data)
    else invalidCount++
  }

  const products = transformRows(validRows)

  console.log(
    `\nTransformed ${validRows.length} row${validRows.length !== 1 ? 's' : ''} → ${products.length} product${products.length !== 1 ? 's' : ''}`,
  )
  if (invalidCount > 0) console.log(`  (${invalidCount} row${invalidCount !== 1 ? 's' : ''} skipped — schema errors)`)
  console.log()

  products.forEach((p, i) => {
    const meta = p.metadata
    const badges = [
      meta['is_new_launch'] && 'NEW',
      meta['is_bestseller'] && 'BESTSELLER',
      meta['badge'],
    ]
      .filter(Boolean)
      .join(', ')

    console.log(
      `  ${String(i + 1).padStart(2, ' ')}. ${p.handle}  [${p.variants.length} variant${p.variants.length !== 1 ? 's' : ''}]${badges ? `  (${badges})` : ''}`,
    )
    p.variants.forEach((v) => {
      const price = (v.prices[0]!.amount / 100).toFixed(0)
      const mrp = v.prices[0]!.compare_at_price
        ? ` / MRP ₹${(v.prices[0]!.compare_at_price / 100).toFixed(0)}`
        : ''
      console.log(`       ↳ ${v.title}  SKU: ${v.sku}  ₹${price}${mrp}  stock: ${v._inventory_quantity}`)
    })
  })
  console.log()
}

if (require.main === module) {
  main()
}
