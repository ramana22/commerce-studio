#!/usr/bin/env tsx
/**
 * Catalog Validation Script — Phase 2
 *
 * Reads data/master-catalog.xlsx, validates every row against the Zod schema,
 * runs cross-row integrity checks, and prints a pass/fail report.
 *
 * Usage: pnpm --filter @sugar-store/catalog-import validate
 *        (run from the repository root)
 *
 * Exit codes:
 *   0 — all checks pass
 *   1 — one or more errors found (or file missing)
 */
import * as XLSX from 'xlsx'
import * as fs from 'node:fs'
import * as path from 'node:path'
import {
  ExcelCatalogRowSchema,
  REQUIRED_EXCEL_COLUMNS,
  type ExcelCatalogRow,
} from '@sugar-store/validators/excel-row'

// ── Paths ─────────────────────────────────────────────────────────────────────

function findRepoRoot(): string {
  let dir = path.resolve(__dirname)
  while (path.dirname(dir) !== dir) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir
    dir = path.dirname(dir)
  }
  throw new Error('Repository root not found (no pnpm-workspace.yaml in any parent directory)')
}

const REPO_ROOT = findRepoRoot()
const CATALOG_PATH = path.join(REPO_ROOT, 'data/master-catalog.xlsx')
const MEDIA_RAW_PATH = path.join(REPO_ROOT, 'data/media-raw')

// ── Formatting helpers ────────────────────────────────────────────────────────

const W = 56
const line = (ch = '─') => ch.repeat(W)

function banner(text: string): void {
  console.log()
  console.log(line('═'))
  console.log(` ${text}`)
  console.log(line('═'))
}

function row(icon: '✓' | '✗' | '─', label: string, detail = ''): void {
  const suffix = detail ? `  ${detail}` : ''
  console.log(`  ${icon}  ${label}${suffix}`)
}

// ── Type coercion (Excel → Zod) ───────────────────────────────────────────────

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

// ── Main ──────────────────────────────────────────────────────────────────────

interface RowResult {
  rowNum: number
  raw: Record<string, unknown>
  data?: ExcelCatalogRow
  errors?: string[]
}

function main(): void {
  banner('SUGAR STORE — CATALOG VALIDATION')
  console.log()

  // 1. File existence ──────────────────────────────────────────────────────────
  if (!fs.existsSync(CATALOG_PATH)) {
    row('✗', 'Catalog file', path.relative(REPO_ROOT, CATALOG_PATH))
    console.log()
    console.log('  File not found. Generate the sample first:')
    console.log('    pnpm --filter @sugar-store/catalog-import create-sample')
    process.exit(1)
  }
  console.log(`  File : ${path.relative(REPO_ROOT, CATALOG_PATH)}`)

  // 2. Read workbook ───────────────────────────────────────────────────────────
  const wb = XLSX.readFile(CATALOG_PATH)
  const sheetName = wb.SheetNames[0]
  if (!sheetName) {
    console.error('  Error: Workbook has no sheets.')
    process.exit(1)
  }
  const sheet = wb.Sheets[sheetName]!
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: undefined,
    raw: true,
  })
  console.log(`  Sheet: ${sheetName}`)
  console.log(`  Rows : ${rawRows.length}`)
  console.log()

  if (rawRows.length === 0) {
    console.log('  No data rows found.')
    process.exit(1)
  }

  // 3. Required columns ────────────────────────────────────────────────────────
  const headers = Object.keys(rawRows[0]!)
  const missingCols = REQUIRED_EXCEL_COLUMNS.filter((c) => !headers.includes(c))
  row(
    missingCols.length === 0 ? '✓' : '✗',
    'Required columns',
    missingCols.length > 0 ? `missing: ${missingCols.join(', ')}` : `${headers.length} columns found`,
  )

  if (missingCols.length > 0) {
    console.log('\n  Cannot continue — add missing columns and re-run.')
    process.exit(1)
  }

  // 4. Per-row schema validation ────────────────────────────────────────────────
  const results: RowResult[] = rawRows.map((raw, i) => {
    const processed = preprocessRow(raw)
    const result = ExcelCatalogRowSchema.safeParse(processed)
    if (result.success) return { rowNum: i + 2, raw, data: result.data }
    return {
      rowNum: i + 2,
      raw,
      errors: result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    }
  })

  const valid = results.filter((r) => !r.errors)
  const invalid = results.filter((r) => r.errors && r.errors.length > 0)

  row(
    invalid.length === 0 ? '✓' : '✗',
    'Schema validation',
    `${valid.length} valid${invalid.length > 0 ? `, ${invalid.length} invalid` : ''}`,
  )

  // 5. Duplicate SKU check ──────────────────────────────────────────────────────
  const skus = results.map((r) => (r.data?.sku ?? String(r.raw['sku'] ?? '')) as string)
  const dupeSKUs = [...new Set(skus.filter((sku, i) => sku && skus.indexOf(sku) !== i))]
  row(
    dupeSKUs.length === 0 ? '✓' : '✗',
    'Duplicate SKUs',
    dupeSKUs.length > 0 ? `duplicates: ${dupeSKUs.join(', ')}` : 'all unique',
  )

  // 6. Handle grouping ─────────────────────────────────────────────────────────
  const handleMap = new Map<string, number>()
  results.forEach((r) => {
    const h = r.data?.handle ?? String(r.raw['handle'] ?? '')
    if (h) handleMap.set(h, (handleMap.get(h) ?? 0) + 1)
  })
  row(
    '✓',
    'Handle grouping',
    `${handleMap.size} product${handleMap.size !== 1 ? 's' : ''}, ${rawRows.length} variant${rawRows.length !== 1 ? 's' : ''}`,
  )

  // 7. Price integrity (belt-and-suspenders — schema already checks per row) ───
  const priceViolations = results.filter((r) => r.data && r.data.mrp < r.data.price)
  row(
    priceViolations.length === 0 ? '✓' : '✗',
    'Price integrity (MRP ≥ price)',
    priceViolations.length > 0 ? `${priceViolations.length} row(s) violate this` : '',
  )

  // 8. Media file check ─────────────────────────────────────────────────────────
  const mediaRaw = fs.existsSync(MEDIA_RAW_PATH)
  if (!mediaRaw) {
    row('─', 'Media files', 'data/media-raw/ not found — run Phase 3 first')
  } else {
    const available = new Set(fs.readdirSync(MEDIA_RAW_PATH))
    const allRefs: string[] = []
    results.forEach((r) => {
      if (!r.data) return
      if (r.data.main_image) allRefs.push(r.data.main_image)
      if (r.data.hover_image) allRefs.push(r.data.hover_image)
      if (r.data.gallery_images) {
        r.data.gallery_images
          .split(';')
          .map((f) => f.trim())
          .filter(Boolean)
          .forEach((f) => allRefs.push(f))
      }
    })
    const missing = [...new Set(allRefs.filter((f) => !available.has(f)))]
    row(
      missing.length === 0 ? '✓' : '✗',
      'Media files in data/media-raw/',
      missing.length === 0
        ? `${allRefs.length} reference${allRefs.length !== 1 ? 's' : ''} all present`
        : `${missing.length} file${missing.length !== 1 ? 's' : ''} missing`,
    )
    if (missing.length > 0) {
      missing.forEach((f) => console.log(`       missing: ${f}`))
    }
  }

  // 9. Row error detail ─────────────────────────────────────────────────────────
  if (invalid.length > 0) {
    console.log()
    console.log(`  ROW ERRORS (${invalid.length})`)
    invalid.forEach((r) => {
      const handle = r.raw['handle'] ?? '?'
      const sku = r.raw['sku'] ?? '?'
      console.log()
      console.log(`  Row ${r.rowNum} [handle: ${handle}, sku: ${sku}]`)
      r.errors?.forEach((e) => console.log(`    - ${e}`))
    })
  }

  // 10. Final verdict ───────────────────────────────────────────────────────────
  const totalErrors = invalid.length + dupeSKUs.length + priceViolations.length

  banner(
    totalErrors === 0
      ? `RESULT: PASS  (${rawRows.length} rows · ${handleMap.size} products · 0 errors)`
      : `RESULT: FAIL  (${totalErrors} error${totalErrors !== 1 ? 's' : ''})`,
  )
  console.log()

  process.exit(totalErrors > 0 ? 1 : 0)
}

main()
