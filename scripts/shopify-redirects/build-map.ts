#!/usr/bin/env tsx
/**
 * Shopify → Storefront redirect map builder — Phase 9
 *
 * Reads a Shopify "URL Redirects" CSV export (Online Store → Navigation →
 * URL Redirects → Export) and emits a Next.js redirects file consumed by
 * `apps/storefront/next.config.ts`.
 *
 * It also appends structural redirects for Shopify's URL conventions
 * (/collections/* → /*) so collection links keep working without per-row entries.
 *
 * Usage:
 *   pnpm redirects:sample   # writes a sample data/shopify-redirects.csv
 *   pnpm redirects:build    # generates apps/storefront/redirects.generated.json
 */
import * as XLSX from 'xlsx'
import * as fs from 'node:fs'
import * as path from 'node:path'

interface Redirect {
  source: string
  destination: string
  permanent: boolean
}

function findRepoRoot(): string {
  let dir = path.resolve(__dirname)
  while (path.dirname(dir) !== dir) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir
    dir = path.dirname(dir)
  }
  throw new Error('Repository root not found')
}

/** Normalize any URL or path to a site-relative path beginning with "/". */
function toPath(value: string): string | null {
  const v = value.trim()
  if (!v) return null
  try {
    if (/^https?:\/\//i.test(v)) {
      const u = new URL(v)
      return u.pathname + u.search
    }
  } catch {
    return null
  }
  return v.startsWith('/') ? v : `/${v}`
}

/** Rewrite Shopify collection paths to the storefront's category slug. */
function mapDestination(p: string): string {
  const m = p.match(/^\/collections\/([^/?#]+)$/)
  if (m) return `/${m[1]}`
  if (p === '/collections' || p === '/collections/all') return '/'
  return p
}

// Case-insensitive header lookup for the Shopify export columns.
function pick(row: Record<string, unknown>, keys: string[]): string {
  const lower = new Map(
    Object.entries(row).map(([k, v]) => [k.toLowerCase().trim(), v]),
  )
  for (const key of keys) {
    const val = lower.get(key)
    if (typeof val === 'string' && val.trim()) return val
  }
  return ''
}

function readCsv(csvPath: string): Redirect[] {
  if (!fs.existsSync(csvPath)) return []
  const wb = XLSX.readFile(csvPath)
  const sheet = wb.Sheets[wb.SheetNames[0]!]!
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
  })

  const out: Redirect[] = []
  for (const row of rows) {
    const from = toPath(pick(row, ['redirect from', 'from', 'source', 'path']))
    const toRaw = toPath(pick(row, ['redirect to', 'to', 'destination', 'target']))
    if (!from || !toRaw) continue
    const destination = mapDestination(toRaw)
    if (from === destination) continue
    out.push({ source: from, destination, permanent: true })
  }
  return out
}

// Structural redirects for Shopify's default URL shapes.
const STRUCTURAL: Redirect[] = [
  { source: '/collections/:slug', destination: '/:slug', permanent: true },
  { source: '/collections', destination: '/', permanent: true },
  { source: '/pages/:slug', destination: '/:slug', permanent: true },
]

function main(): void {
  const root = findRepoRoot()
  const csvPath = path.join(root, 'data/shopify-redirects.csv')
  const outPath = path.join(root, 'apps/storefront/redirects.generated.json')

  const explicit = readCsv(csvPath)

  // Explicit rows win over structural ones; dedupe by source (first wins).
  const seen = new Set<string>()
  const merged: Redirect[] = []
  for (const r of [...explicit, ...STRUCTURAL]) {
    if (seen.has(r.source)) continue
    seen.add(r.source)
    merged.push(r)
  }

  fs.writeFileSync(outPath, JSON.stringify(merged, null, 2) + '\n')

  console.log(
    `\n  ✓  ${merged.length} redirects written → apps/storefront/redirects.generated.json`,
  )
  console.log(
    `     (${explicit.length} from CSV${explicit.length === 0 ? ' — none found, structural only' : ''}, ${STRUCTURAL.length} structural)\n`,
  )
}

if (require.main === module) main()
