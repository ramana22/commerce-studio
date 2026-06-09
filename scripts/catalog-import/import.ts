#!/usr/bin/env tsx
/**
 * Catalog Import — Phase 4
 *
 * Idempotent upsert of transformed products via the Medusa Admin API.
 * Re-running is safe — existing products are updated, not duplicated.
 *
 * Prerequisites:
 *   1. Backend running:   pnpm --filter @sugar-store/backend dev
 *   2. Backend seeded:    pnpm backend:seed
 *   3. Admin user:        medusa user -e admin@sugar-store.com -p <password>
 *   4. .env vars set:     MEDUSA_ADMIN_EMAIL, MEDUSA_ADMIN_PASSWORD
 *                         (or MEDUSA_API_KEY for API-key auth)
 *
 * Usage:
 *   pnpm catalog:import --dry-run    # validate + preview, no writes
 *   pnpm catalog:import              # actually upsert products
 */
import 'dotenv/config'
import * as XLSX from 'xlsx'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { ExcelCatalogRowSchema, REQUIRED_EXCEL_COLUMNS, type ExcelCatalogRow } from '@sugar-store/validators/excel-row'
import { transformRows, type MedusaProductPayload } from './transform'

// ── Config ────────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes('--dry-run')
const MEDUSA_URL = (process.env['MEDUSA_URL'] ?? 'http://localhost:9000').replace(/\/$/, '')

// ── Paths ─────────────────────────────────────────────────────────────────────

function findRepoRoot(): string {
  let dir = path.resolve(__dirname)
  while (path.dirname(dir) !== dir) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir
    dir = path.dirname(dir)
  }
  throw new Error('Repository root not found')
}

// ── Type coercion (mirrors validate.ts) ───────────────────────────────────────

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

// ── Medusa Admin API helpers ───────────────────────────────────────────────────

async function getAuthHeader(): Promise<string> {
  const apiKey = process.env['MEDUSA_API_KEY']
  if (apiKey) return `Bearer ${apiKey}`

  const email = process.env['MEDUSA_ADMIN_EMAIL']
  const password = process.env['MEDUSA_ADMIN_PASSWORD']
  if (!email || !password) {
    throw new Error(
      'Set MEDUSA_ADMIN_EMAIL + MEDUSA_ADMIN_PASSWORD (or MEDUSA_API_KEY) in .env',
    )
  }

  const res = await fetch(`${MEDUSA_URL}/auth/user/emailpass`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Auth failed (${res.status}): ${text}`)
  }
  const data = (await res.json()) as { token: string }
  return `Bearer ${data.token}`
}

interface MedusaCategory {
  id: string
  handle: string
  name: string
}

async function fetchCategoryMap(auth: string): Promise<Map<string, string>> {
  const res = await fetch(`${MEDUSA_URL}/admin/product-categories?limit=100`, {
    headers: { Authorization: auth },
  })
  if (!res.ok) throw new Error(`Failed to fetch categories (${res.status})`)
  const data = (await res.json()) as { product_categories: MedusaCategory[] }
  const map = new Map<string, string>()
  for (const cat of data.product_categories) {
    map.set(cat.handle, cat.id)
    map.set(cat.name.toUpperCase(), cat.id)
  }
  return map
}

async function findProductByHandle(auth: string, handle: string): Promise<string | null> {
  const res = await fetch(
    `${MEDUSA_URL}/admin/products?handle=${encodeURIComponent(handle)}&limit=1`,
    { headers: { Authorization: auth } },
  )
  if (!res.ok) return null
  const data = (await res.json()) as { products: Array<{ id: string }> }
  return data.products[0]?.id ?? null
}

async function createProduct(
  auth: string,
  payload: Record<string, unknown>,
): Promise<{ id: string; handle: string }> {
  const res = await fetch(`${MEDUSA_URL}/admin/products`, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Create "${payload.handle}" failed (${res.status}): ${text}`)
  }
  const data = (await res.json()) as { product: { id: string; handle: string } }
  return data.product
}

async function updateProduct(
  auth: string,
  id: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const res = await fetch(`${MEDUSA_URL}/admin/products/${id}`, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Update product ${id} failed (${res.status}): ${text}`)
  }
}

// ── Banner helpers ─────────────────────────────────────────────────────────────

const W = 56
const line = (ch = '─') => ch.repeat(W)

function banner(text: string): void {
  console.log()
  console.log(line('═'))
  console.log(` ${text}`)
  console.log(line('═'))
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  banner(`SUGAR STORE — CATALOG IMPORT${DRY_RUN ? ' (DRY RUN)' : ''}`)
  console.log()

  const REPO_ROOT = findRepoRoot()
  const CATALOG_PATH = path.join(REPO_ROOT, 'data/master-catalog.xlsx')

  // 1. Read & validate Excel ──────────────────────────────────────────────────
  if (!fs.existsSync(CATALOG_PATH)) {
    console.error('  ✗  data/master-catalog.xlsx not found')
    console.error('     Run: pnpm catalog:sample')
    process.exit(1)
  }

  const wb = XLSX.readFile(CATALOG_PATH)
  const sheetName = wb.SheetNames[0]!
  const sheet = wb.Sheets[sheetName]!
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: undefined,
    raw: true,
  })

  const headers = Object.keys(rawRows[0] ?? {})
  const missingCols = REQUIRED_EXCEL_COLUMNS.filter((c) => !headers.includes(c))
  if (missingCols.length > 0) {
    console.error(`  ✗  Missing required columns: ${missingCols.join(', ')}`)
    process.exit(1)
  }

  const validRows: ExcelCatalogRow[] = []
  const rowErrors: string[] = []
  rawRows.forEach((raw, i) => {
    const result = ExcelCatalogRowSchema.safeParse(preprocessRow(raw))
    if (result.success) {
      validRows.push(result.data)
    } else {
      const errs = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`)
      rowErrors.push(`  Row ${i + 2}: ${errs.join('; ')}`)
    }
  })

  console.log(`  ✓  ${rawRows.length} rows read, ${validRows.length} valid`)
  if (rowErrors.length > 0) {
    console.log(`  ✗  ${rowErrors.length} invalid rows (skipped):`)
    rowErrors.forEach((e) => console.log(`     ${e}`))
  }

  // 2. Transform ──────────────────────────────────────────────────────────────
  const products = transformRows(validRows)
  console.log(`  ✓  ${products.length} products transformed from ${validRows.length} variants`)

  if (DRY_RUN) {
    console.log()
    console.log('  DRY RUN — would upsert:')
    products.forEach((p) => {
      const meta = p.metadata
      console.log(
        `    • ${p.handle}  (${p.variants.length} variant${p.variants.length !== 1 ? 's' : ''}, category: ${String(meta['category'])})`,
      )
    })
    banner('DRY RUN COMPLETE — no changes made')
    console.log()
    return
  }

  // 3. Auth ───────────────────────────────────────────────────────────────────
  let auth: string
  try {
    auth = await getAuthHeader()
    console.log(`  ✓  Authenticated with Medusa at ${MEDUSA_URL}`)
  } catch (err) {
    console.error(`  ✗  ${(err as Error).message}`)
    process.exit(1)
  }

  // 4. Fetch categories ───────────────────────────────────────────────────────
  let categoryMap = new Map<string, string>()
  try {
    categoryMap = await fetchCategoryMap(auth)
    console.log(`  ✓  ${categoryMap.size / 2} categories fetched`)
  } catch {
    console.log('  ─  Could not fetch categories (run backend:seed first?)')
  }

  // 5. Upsert products ────────────────────────────────────────────────────────
  console.log()
  let created = 0
  let updated = 0
  let failed = 0

  type VariantApiPayload = Omit<(typeof products)[0]['variants'][0], '_inventory_quantity'>
  type ProductApiPayload = Omit<MedusaProductPayload, 'variants'> & {
    variants: VariantApiPayload[]
  }

  for (const product of products) {
    // Resolve category ID
    const catName = String(product.metadata['category'] ?? '')
    const categoryId = categoryMap.get(catName) ?? categoryMap.get(catName.toLowerCase())

    const apiVariants: VariantApiPayload[] = product.variants.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ _inventory_quantity: _iq, ...v }) => v,
    )

    const payload: ProductApiPayload = {
      ...product,
      ...(categoryId && { category_ids: [categoryId] }),
      variants: apiVariants,
    }

    try {
      const existingId = await findProductByHandle(auth, product.handle)

      if (existingId) {
        await updateProduct(auth, existingId, payload)
        console.log(`  ↻  ${product.handle}  (updated)`)
        updated++
      } else {
        await createProduct(auth, payload)
        console.log(`  ✓  ${product.handle}  (created)`)
        created++
      }
    } catch (err) {
      console.error(`  ✗  ${product.handle}: ${(err as Error).message}`)
      failed++
    }
  }

  banner(
    `DONE  ${created} created · ${updated} updated · ${failed} failed`,
  )
  console.log()

  if (failed > 0) process.exit(1)
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
