#!/usr/bin/env tsx
/**
 * GIF → MP4/WebM conversion step — Phase 3
 *
 * For every .gif in data/media-raw/:
 *   - MP4 (H.264, faststart, yuv420p) for broad browser support
 *   - WebM (VP9)  for smaller file size in supporting browsers
 *   - Poster JPEG (first frame, 1200w) for <video poster>
 *
 * Requires ffmpeg in PATH. Skips gracefully if not found.
 *
 * Usage: pnpm --filter @sugar-store/media-pipeline gif-to-mp4
 */
import { execSync, execFileSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { findRepoRoot, kb } from './helpers'

const REPO_ROOT = findRepoRoot()
const INPUT_DIR = path.join(REPO_ROOT, 'data/media-raw')
const OUTPUT_DIR = path.join(REPO_ROOT, 'data/media-processed')

function ffmpegAvailable(): boolean {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function convertGif(inputPath: string, name: string): void {
  const mp4 = path.join(OUTPUT_DIR, `${name}.mp4`)
  const webm = path.join(OUTPUT_DIR, `${name}.webm`)
  const poster = path.join(OUTPUT_DIR, `${name}-poster.jpg`)

  // MP4: H.264, faststart for web streaming, scale to even dimensions
  execFileSync('ffmpeg', [
    '-y', '-i', inputPath,
    '-movflags', 'faststart',
    '-pix_fmt', 'yuv420p',
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
    '-c:v', 'libx264',
    '-crf', '28',
    mp4,
  ], { stdio: 'ignore' })

  // WebM: VP9
  execFileSync('ffmpeg', [
    '-y', '-i', inputPath,
    '-c:v', 'libvpx-vp9',
    '-crf', '33',
    '-b:v', '0',
    webm,
  ], { stdio: 'ignore' })

  // Poster: first frame at 1200px wide
  execFileSync('ffmpeg', [
    '-y', '-i', inputPath,
    '-vframes', '1',
    '-q:v', '3',
    '-vf', 'scale=1200:-1',
    poster,
  ], { stdio: 'ignore' })
}

export function processGifs(): void {
  console.log(`\nGIF → video conversion`)

  if (!ffmpegAvailable()) {
    console.log('  ─  ffmpeg not found — install it to enable GIF conversion')
    console.log('     brew install ffmpeg  |  apt install ffmpeg')
    return
  }

  if (!fs.existsSync(INPUT_DIR)) {
    console.log('  ─  data/media-raw/ not found')
    return
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const gifs = fs.readdirSync(INPUT_DIR).filter((f) => path.extname(f).toLowerCase() === '.gif')

  if (gifs.length === 0) {
    console.log('  ─  No GIF files found')
    return
  }

  for (const filename of gifs) {
    const inputPath = path.join(INPUT_DIR, filename)
    const name = path.parse(filename).name
    const stat = fs.statSync(inputPath)

    if (stat.size === 0) {
      console.log(`  ─  ${filename} (empty)`)
      continue
    }

    try {
      convertGif(inputPath, name)
      const mp4Size = fs.statSync(path.join(OUTPUT_DIR, `${name}.mp4`)).size
      console.log(`  ✓  ${filename}  ${kb(stat.size)}KB → ${kb(mp4Size)}KB (mp4)`)
    } catch (err) {
      console.error(`  ✗  ${filename}: ${(err as Error).message}`)
    }
  }
}

function main(): void {
  processGifs()
}

if (require.main === module) {
  main()
}
