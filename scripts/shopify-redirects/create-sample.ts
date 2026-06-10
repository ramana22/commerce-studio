#!/usr/bin/env tsx
/**
 * Writes a sample Shopify "URL Redirects" CSV to data/shopify-redirects.csv so
 * the redirect builder can be exercised before the real export is available.
 */
import * as fs from 'node:fs'
import * as path from 'node:path'

function findRepoRoot(): string {
  let dir = path.resolve(__dirname)
  while (path.dirname(dir) !== dir) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir
    dir = path.dirname(dir)
  }
  throw new Error('Repository root not found')
}

const SAMPLE = `Redirect from,Redirect to
/collections/lipstick,/lips
/collections/eyeshadow,/eyes
/products/old-matte-lipstick,/products/matte-lipstick-ruby
/pages/about-us,/about
/blogs/news/launch,/
`

function main(): void {
  const root = findRepoRoot()
  const dataDir = path.join(root, 'data')
  fs.mkdirSync(dataDir, { recursive: true })
  const outPath = path.join(dataDir, 'shopify-redirects.csv')
  fs.writeFileSync(outPath, SAMPLE)
  console.log(`\n  ✓  Sample written → data/shopify-redirects.csv\n`)
}

if (require.main === module) main()
