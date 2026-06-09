#!/usr/bin/env tsx
/**
 * Cloudflare R2 upload — Phase 3
 *
 * Uploads everything in data/media-processed/ to R2 and rewrites
 * data/media-manifest.json so asset paths become public R2 URLs.
 *
 * Required env vars (copy from .env.example):
 *   CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID,
 *   CLOUDFLARE_R2_SECRET_ACCESS_KEY, CLOUDFLARE_R2_BUCKET_NAME,
 *   CLOUDFLARE_R2_PUBLIC_URL
 *
 * Usage: pnpm --filter @sugar-store/media-pipeline upload
 */
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { findRepoRoot, kb } from './helpers'
import type { MediaManifest } from './types'

const REPO_ROOT = findRepoRoot()
const PROCESSED_DIR = path.join(REPO_ROOT, 'data/media-processed')
const MANIFEST_PATH = path.join(REPO_ROOT, 'data/media-manifest.json')

const CONTENT_TYPES: Record<string, string> = {
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
}

function requireEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error(`Missing required environment variable: ${name}`)
  return val
}

function credentialsPresent(): boolean {
  return !!(
    process.env['CLOUDFLARE_ACCOUNT_ID'] &&
    process.env['CLOUDFLARE_R2_ACCESS_KEY_ID'] &&
    process.env['CLOUDFLARE_R2_SECRET_ACCESS_KEY'] &&
    process.env['CLOUDFLARE_R2_BUCKET_NAME'] &&
    process.env['CLOUDFLARE_R2_PUBLIC_URL']
  )
}

async function uploadFile(
  client: S3Client,
  bucket: string,
  localPath: string,
  key: string,
): Promise<void> {
  const ext = path.extname(localPath)
  const contentType = CONTENT_TYPES[ext] ?? 'application/octet-stream'
  const body = fs.readFileSync(localPath)

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      // Long cache: assets are content-addressed by filename
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  )
}

export async function uploadToR2(): Promise<void> {
  console.log('\nR2 upload')

  if (!credentialsPresent()) {
    console.log('  ─  R2 credentials not set — skipping upload')
    console.log('     Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID,')
    console.log('     CLOUDFLARE_R2_SECRET_ACCESS_KEY, CLOUDFLARE_R2_BUCKET_NAME,')
    console.log('     CLOUDFLARE_R2_PUBLIC_URL in .env and re-run')
    return
  }

  const accountId = requireEnv('CLOUDFLARE_ACCOUNT_ID')
  const bucket = requireEnv('CLOUDFLARE_R2_BUCKET_NAME')
  const publicUrl = requireEnv('CLOUDFLARE_R2_PUBLIC_URL').replace(/\/$/, '')

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv('CLOUDFLARE_R2_ACCESS_KEY_ID'),
      secretAccessKey: requireEnv('CLOUDFLARE_R2_SECRET_ACCESS_KEY'),
    },
  })

  if (!fs.existsSync(PROCESSED_DIR)) {
    console.log('  ─  data/media-processed/ not found — run `process` step first')
    return
  }

  const files = fs.readdirSync(PROCESSED_DIR).filter((f) => !f.startsWith('.'))
  console.log(`  Uploading ${files.length} files to r2://${bucket}/products/`)

  let uploaded = 0
  let totalBytes = 0

  for (const filename of files) {
    const localPath = path.join(PROCESSED_DIR, filename)
    const key = `products/${filename}`
    const size = fs.statSync(localPath).size

    try {
      await uploadFile(client, bucket, localPath, key)
      totalBytes += size
      uploaded++
      if (uploaded % 10 === 0) console.log(`  ${uploaded}/${files.length}…`)
    } catch (err) {
      console.error(`  ✗  ${filename}: ${(err as Error).message}`)
    }
  }

  console.log(`  ✓  ${uploaded} files uploaded  (${kb(totalBytes)} KB total)`)

  // Rewrite manifest with R2 URLs
  if (!fs.existsSync(MANIFEST_PATH)) return

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8')) as MediaManifest
  manifest.r2BaseUrl = publicUrl
  manifest.generatedAt = new Date().toISOString()

  for (const entry of Object.values(manifest.assets)) {
    for (const sizeSet of Object.values(entry.sizes)) {
      if (sizeSet.avif && !sizeSet.avif.startsWith('http')) {
        sizeSet.avif = `${publicUrl}/products/${sizeSet.avif}`
      }
      if (sizeSet.webp && !sizeSet.webp.startsWith('http')) {
        sizeSet.webp = `${publicUrl}/products/${sizeSet.webp}`
      }
      entry.uploaded = true
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
  console.log('  ✓  Manifest updated with R2 URLs')
}

async function main(): Promise<void> {
  await uploadToR2()
}

if (require.main === module) {
  main().catch((err: unknown) => {
    console.error(err)
    process.exit(1)
  })
}
