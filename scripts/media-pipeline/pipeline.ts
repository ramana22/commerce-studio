#!/usr/bin/env tsx
/**
 * Full media pipeline — Phase 3
 *
 * Runs all steps in sequence:
 *   1. process-images  (resize + AVIF/WebP + EXIF strip)
 *   2. gif-to-mp4      (GIF → MP4/WebM/poster, requires ffmpeg)
 *   3. upload-r2       (only if --upload flag passed AND credentials set)
 *
 * Usage:
 *   pnpm --filter @sugar-store/media-pipeline pipeline           # process only
 *   pnpm --filter @sugar-store/media-pipeline pipeline --upload  # process + upload
 */
import * as fs from 'node:fs'
import * as path from 'node:path'
import { processImages } from './process-images'
import { processGifs } from './gif-to-mp4'
import { uploadToR2 } from './upload-r2'
import { findRepoRoot, kb, reductionPct } from './helpers'

const W = 56
const line = (ch = '─') => ch.repeat(W)

function banner(text: string): void {
  console.log()
  console.log(line('═'))
  console.log(` ${text}`)
  console.log(line('═'))
}

async function main(): Promise<void> {
  const shouldUpload = process.argv.includes('--upload')

  banner('SUGAR STORE — MEDIA PIPELINE')

  const REPO_ROOT = findRepoRoot()
  const INPUT_DIR = path.join(REPO_ROOT, 'data/media-raw')

  if (!fs.existsSync(INPUT_DIR)) {
    console.log(`\n  ✗  data/media-raw/ not found`)
    console.log('     Run: pnpm catalog:sample  (creates placeholder files)')
    process.exit(1)
  }

  // Step 1: Images
  const assets = await processImages()
  const totalOriginal = Object.values(assets).reduce((s, a) => s + a.originalBytes, 0)
  const totalProcessed = Object.values(assets).reduce((s, a) => s + a.processedBytes, 0)

  // Step 2: GIFs (requires ffmpeg, skips gracefully)
  processGifs()

  // Step 3: R2 upload (opt-in)
  if (shouldUpload) {
    await uploadToR2()
  } else {
    console.log('\n  (pass --upload to push to Cloudflare R2)')
  }

  // Summary
  banner(
    `DONE  ${Object.keys(assets).length} images · ${kb(totalOriginal)}KB → ${kb(totalProcessed)}KB · ${reductionPct(totalOriginal, totalProcessed)} smaller`,
  )
  console.log()
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
