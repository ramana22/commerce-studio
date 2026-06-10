#!/usr/bin/env tsx
/**
 * Creates real JPEG test images in data/media-raw/ so the media pipeline
 * has actual pixel data to process (1500×1500px solid-colour JPEGs).
 *
 * Overwrites any 0-byte placeholder files left by create-sample.ts.
 *
 * Usage: pnpm --filter @sugar-store/media-pipeline create-test-images
 */
import sharp from 'sharp'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { findRepoRoot, kb } from './helpers'
import { IMAGE_EXTS } from './types'

const REPO_ROOT = findRepoRoot()
const MEDIA_RAW = path.join(REPO_ROOT, 'data/media-raw')

// Product-category colour palette
const PALETTE: Array<{ r: number; g: number; b: number }> = [
  { r: 232, g: 137, b: 104 }, // warm coral  — LIPS
  { r: 245, g: 213, b: 168 }, // warm beige  — FACE / foundation
  { r: 139, g: 34,  b: 82  }, // deep berry  — LIPS dark
  { r: 200, g: 96,  b: 66  }, // terracotta  — LIPS mid
  { r: 245, g: 230, b: 208 }, // ivory        — FACE light
  { r: 201, g: 147, b: 92  }, // honey        — FACE medium
  { r: 144, g: 198, b: 149 }, // sage green  — SKIN
  { r: 100, g: 180, b: 190 }, // aqua        — misc
]

async function main(): Promise<void> {
  if (!fs.existsSync(MEDIA_RAW)) {
    fs.mkdirSync(MEDIA_RAW, { recursive: true })
  }

  const files = fs
    .readdirSync(MEDIA_RAW)
    .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))

  console.log(`Creating test images in data/media-raw/ (${files.length} files)…`)
  console.log()

  let created = 0
  let skipped = 0

  for (let i = 0; i < files.length; i++) {
    const filename = files[i]!
    const dest = path.join(MEDIA_RAW, filename)
    const stat = fs.statSync(dest)

    const colour = PALETTE[i % PALETTE.length]!

    // If already a real image (> 1KB), skip
    if (stat.size > 1024) {
      console.log(`  ─  ${filename}  (already ${kb(stat.size)}KB — skipping)`)
      skipped++
      continue
    }

    // Create 1500×1500 solid-colour JPEG
    await sharp({
      create: {
        width: 1500,
        height: 1500,
        channels: 3,
        background: colour,
      },
    })
      .jpeg({ quality: 90 })
      .toFile(dest)

    const newStat = fs.statSync(dest)
    console.log(`  ✓  ${filename}  → ${kb(newStat.size)}KB`)
    created++
  }

  console.log()
  console.log(`Created: ${created}  Skipped: ${skipped}`)
  console.log(`\nRun next: pnpm --filter @sugar-store/media-pipeline process`)
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
