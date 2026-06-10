#!/usr/bin/env tsx
/**
 * Image processing step — Phase 3
 *
 * For every image in data/media-raw/:
 *   - Resize to 400w / 800w / 1200w
 *   - Output AVIF (q80) + WebP (q85) for each size
 *   - EXIF stripped automatically by sharp (default behaviour)
 *
 * Usage: pnpm --filter @sugar-store/media-pipeline process
 */
import sharp from 'sharp'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { WIDTHS, IMAGE_EXTS, type AssetEntry, type MediaManifest } from './types'
import { findRepoRoot, kb, formatRatio, reductionPct } from './helpers'

const REPO_ROOT = findRepoRoot()
const INPUT_DIR = path.join(REPO_ROOT, 'data/media-raw')
const OUTPUT_DIR = path.join(REPO_ROOT, 'data/media-processed')
const MANIFEST_PATH = path.join(REPO_ROOT, 'data/media-manifest.json')

async function processOne(
  filename: string,
): Promise<{ entry: AssetEntry; skipped: false } | { skipped: true; reason: string }> {
  const inputPath = path.join(INPUT_DIR, filename)
  const stat = fs.statSync(inputPath)

  if (stat.size === 0) return { skipped: true, reason: 'empty file' }

  const name = path.parse(filename).name
  let processedBytes = 0

  const sizes: AssetEntry['sizes'] = {
    '400w': { avif: '', webp: '' },
    '800w': { avif: '', webp: '' },
    '1200w': { avif: '', webp: '' },
  }

  for (const width of WIDTHS) {
    const key = `${width}w` as keyof AssetEntry['sizes']
    const avifName = `${name}-${width}w.avif`
    const webpName = `${name}-${width}w.webp`
    const avifPath = path.join(OUTPUT_DIR, avifName)
    const webpPath = path.join(OUTPUT_DIR, webpName)

    const base = sharp(inputPath).resize(width, null, { withoutEnlargement: false })

    await base.clone().avif({ quality: 80, effort: 4 }).toFile(avifPath)
    await base.clone().webp({ quality: 85, effort: 4 }).toFile(webpPath)

    processedBytes += fs.statSync(avifPath).size + fs.statSync(webpPath).size
    sizes[key] = { avif: avifName, webp: webpName }
  }

  return {
    skipped: false,
    entry: {
      sizes,
      originalBytes: stat.size,
      processedBytes,
      uploaded: false,
    },
  }
}

export async function processImages(): Promise<Record<string, AssetEntry>> {
  if (!fs.existsSync(INPUT_DIR)) {
    throw new Error(`Input directory not found: ${INPUT_DIR}`)
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const files = fs
    .readdirSync(INPUT_DIR)
    .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))

  console.log(`\nImage processing`)
  console.log(`  Input : data/media-raw/ (${files.length} image files)`)
  console.log(`  Output: data/media-processed/`)
  console.log()

  const assets: Record<string, AssetEntry> = {}

  for (const filename of files) {
    const result = await processOne(filename)
    if (result.skipped) {
      console.log(`  ─  ${filename} (${result.reason})`)
    } else {
      assets[filename] = result.entry
      const ratio = formatRatio(result.entry.originalBytes, result.entry.processedBytes)
      console.log(
        `  ✓  ${filename}  ${kb(result.entry.originalBytes)}KB → ${kb(result.entry.processedBytes)}KB  (${ratio})`,
      )
    }
  }

  return assets
}

async function main(): Promise<void> {
  const assets = await processImages()

  const totalOriginal = Object.values(assets).reduce((s, a) => s + a.originalBytes, 0)
  const totalProcessed = Object.values(assets).reduce((s, a) => s + a.processedBytes, 0)
  const processedCount = Object.keys(assets).length

  console.log()
  console.log(`  Processed : ${processedCount} images → ${processedCount * WIDTHS.length * 2} files`)
  console.log(`  Original  : ${kb(totalOriginal)} KB`)
  console.log(`  Output    : ${kb(totalProcessed)} KB`)
  console.log(`  Reduction : ${reductionPct(totalOriginal, totalProcessed)} (${formatRatio(totalOriginal, totalProcessed)})`)

  // Write / merge manifest
  let manifest: MediaManifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    r2BaseUrl: '',
    totals: {
      sourceImages: processedCount,
      processedFiles: processedCount * WIDTHS.length * 2,
      originalKb: Math.round(totalOriginal / 1024),
      processedKb: Math.round(totalProcessed / 1024),
      reductionPct: reductionPct(totalOriginal, totalProcessed),
    },
    assets,
  }

  if (fs.existsSync(MANIFEST_PATH)) {
    const existing = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8')) as MediaManifest
    manifest = { ...existing, ...manifest, assets: { ...existing.assets, ...assets } }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
  console.log(`\n  Manifest: data/media-manifest.json`)
}

if (require.main === module) {
  main().catch((err: unknown) => {
    console.error(err)
    process.exit(1)
  })
}
