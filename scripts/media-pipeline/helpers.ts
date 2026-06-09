import * as fs from 'node:fs'
import * as path from 'node:path'

export function findRepoRoot(): string {
  let dir = path.resolve(__dirname)
  while (path.dirname(dir) !== dir) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir
    dir = path.dirname(dir)
  }
  throw new Error('Repository root not found (no pnpm-workspace.yaml in any parent directory)')
}

export function kb(bytes: number): string {
  return (bytes / 1024).toFixed(1)
}

export function formatRatio(original: number, processed: number): string {
  if (processed === 0) return 'n/a'
  return `${(original / processed).toFixed(1)}:1`
}

export function reductionPct(original: number, processed: number): string {
  if (original === 0) return 'n/a'
  return `${(((original - processed) / original) * 100).toFixed(0)}%`
}
