#!/usr/bin/env tsx
/**
 * Creates data/master-catalog.xlsx with realistic Sugar Cosmetics sample data
 * and touch-creates placeholder files in data/media-raw/ so the media check passes.
 *
 * Usage: pnpm --filter @sugar-store/catalog-import create-sample
 *        (run from the repository root)
 */
import * as XLSX from 'xlsx'
import * as fs from 'node:fs'
import * as path from 'node:path'

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

type Row = {
  handle: string
  title: string
  description: string
  category: string
  subcategory?: string
  shade_name?: string
  shade_hex?: string
  sku: string
  price: number
  msrp: number
  stock: number
  is_new_launch: boolean
  is_bestseller: boolean
  badge?: string
  review_count?: number
  main_image: string
  hover_image?: string
  gallery_images?: string
}

const rows: Row[] = [
  // ── Glide Peptide Plumping Gloss Stick ────────────────────────────────────
  {
    handle: 'glide-peptide-plumping-gloss-stick',
    title: 'Glide Peptide Plumping Gloss Stick',
    description: 'Fuller, glossier lips with peptide-infused formula.',
    category: 'LIPS',
    shade_name: '01 Apricot Glow',
    shade_hex: 'E8A068',
    sku: 'GPGS-01',
    price: 16,
    msrp: 20,
    stock: 120,
    is_new_launch: true,
    is_bestseller: false,
    badge: 'NEW LAUNCH',
    review_count: 451,
    main_image: 'glide-peptide-plumping-gloss-stick-01.jpg',
    hover_image: 'glide-peptide-plumping-gloss-stick-01-hover.jpg',
    gallery_images:
      'glide-peptide-plumping-gloss-stick-01-g1.jpg;glide-peptide-plumping-gloss-stick-01-g2.jpg',
  },
  {
    handle: 'glide-peptide-plumping-gloss-stick',
    title: 'Glide Peptide Plumping Gloss Stick',
    description: 'Fuller, glossier lips with peptide-infused formula.',
    category: 'LIPS',
    shade_name: '02 Rose Petal',
    shade_hex: 'F47B7B',
    sku: 'GPGS-02',
    price: 16,
    msrp: 20,
    stock: 85,
    is_new_launch: true,
    is_bestseller: false,
    badge: 'NEW LAUNCH',
    review_count: 451,
    main_image: 'glide-peptide-plumping-gloss-stick-02.jpg',
    hover_image: 'glide-peptide-plumping-gloss-stick-02-hover.jpg',
  },
  {
    handle: 'glide-peptide-plumping-gloss-stick',
    title: 'Glide Peptide Plumping Gloss Stick',
    description: 'Fuller, glossier lips with peptide-infused formula.',
    category: 'LIPS',
    shade_name: '03 Berry Wine',
    shade_hex: '8B2252',
    sku: 'GPGS-03',
    price: 16,
    msrp: 20,
    stock: 60,
    is_new_launch: true,
    is_bestseller: false,
    badge: 'NEW LAUNCH',
    review_count: 451,
    main_image: 'glide-peptide-plumping-gloss-stick-03.jpg',
    hover_image: 'glide-peptide-plumping-gloss-stick-03-hover.jpg',
  },

  // ── Glide Peptide Serum Lipstick ──────────────────────────────────────────
  {
    handle: 'glide-peptide-serum-lipstick',
    title: 'Glide Peptide Serum Lipstick',
    description: "A serum-infused lipstick with 10-hour wear and a velvety matte finish.",
    category: 'LIPS',
    shade_name: '01 Nude Blush',
    shade_hex: 'D4897A',
    sku: 'GPSL-01',
    price: 14,
    msrp: 18,
    stock: 300,
    is_new_launch: true,
    is_bestseller: false,
    badge: 'NEW LAUNCH',
    review_count: 767,
    main_image: 'glide-peptide-serum-lipstick-01.jpg',
    hover_image: 'glide-peptide-serum-lipstick-01-hover.jpg',
  },
  {
    handle: 'glide-peptide-serum-lipstick',
    title: 'Glide Peptide Serum Lipstick',
    description: "A serum-infused lipstick with 10-hour wear and a velvety matte finish.",
    category: 'LIPS',
    shade_name: '02 Terracotta',
    shade_hex: 'C06042',
    sku: 'GPSL-02',
    price: 14,
    msrp: 18,
    stock: 250,
    is_new_launch: true,
    is_bestseller: false,
    badge: 'NEW LAUNCH',
    review_count: 767,
    main_image: 'glide-peptide-serum-lipstick-02.jpg',
    hover_image: 'glide-peptide-serum-lipstick-02-hover.jpg',
  },
  {
    handle: 'glide-peptide-serum-lipstick',
    title: 'Glide Peptide Serum Lipstick',
    description: "A serum-infused lipstick with 10-hour wear and a velvety matte finish.",
    category: 'LIPS',
    shade_name: '03 Burgundy Charm',
    shade_hex: '8B1A4E',
    sku: 'GPSL-03',
    price: 14,
    msrp: 18,
    stock: 180,
    is_new_launch: true,
    is_bestseller: false,
    badge: 'NEW LAUNCH',
    review_count: 767,
    main_image: 'glide-peptide-serum-lipstick-03.jpg',
    hover_image: 'glide-peptide-serum-lipstick-03-hover.jpg',
  },

  // ── Ace of Face Foundation Stick ──────────────────────────────────────────
  {
    handle: 'ace-of-face-foundation-stick',
    title: 'Ace of Face Foundation Stick',
    description: 'Buildable, blendable coverage in a stick format.',
    category: 'FACE',
    shade_name: '07 Vanilla Latte (Fair, Golden Undertone)',
    shade_hex: 'F5D5A8',
    sku: 'AAFS-07',
    price: 24,
    msrp: 28,
    stock: 200,
    is_new_launch: false,
    is_bestseller: true,
    badge: 'BESTSELLER',
    review_count: 862,
    main_image: 'ace-of-face-foundation-stick-07.jpg',
    hover_image: 'ace-of-face-foundation-stick-07-hover.jpg',
    gallery_images: 'ace-of-face-foundation-stick-07-g1.jpg',
  },
  {
    handle: 'ace-of-face-foundation-stick',
    title: 'Ace of Face Foundation Stick',
    description: 'Buildable, blendable coverage in a stick format.',
    category: 'FACE',
    shade_name: '10 Almond Toast (Light-Medium, Warm Undertone)',
    shade_hex: 'D4A47A',
    sku: 'AAFS-10',
    price: 24,
    msrp: 28,
    stock: 150,
    is_new_launch: false,
    is_bestseller: true,
    badge: 'BESTSELLER',
    review_count: 862,
    main_image: 'ace-of-face-foundation-stick-10.jpg',
    hover_image: 'ace-of-face-foundation-stick-10-hover.jpg',
  },
  {
    handle: 'ace-of-face-foundation-stick',
    title: 'Ace of Face Foundation Stick',
    description: 'Buildable, blendable coverage in a stick format.',
    category: 'FACE',
    shade_name: '14 Deep Mocha (Deep, Neutral Undertone)',
    shade_hex: '8B6347',
    sku: 'AAFS-14',
    price: 24,
    msrp: 28,
    stock: 90,
    is_new_launch: false,
    is_bestseller: true,
    badge: 'BESTSELLER',
    review_count: 862,
    main_image: 'ace-of-face-foundation-stick-14.jpg',
    hover_image: 'ace-of-face-foundation-stick-14-hover.jpg',
  },

  // ── Matte Match Transferproof Foundation ──────────────────────────────────
  {
    handle: 'matte-match-transferproof-foundation',
    title: 'Matte Match Transferproof Foundation',
    description: 'Up to 24HR wear, transferproof, matte finish foundation.',
    category: 'FACE',
    shade_name: '01 Pearl (Very Fair, Neutral Undertone)',
    shade_hex: 'F5E6D0',
    sku: 'MMTF-01',
    price: 13,
    msrp: 16,
    stock: 120,
    is_new_launch: false,
    is_bestseller: false,
    review_count: 1095,
    main_image: 'matte-match-transferproof-foundation-01.jpg',
    hover_image: 'matte-match-transferproof-foundation-01-hover.jpg',
  },
  {
    handle: 'matte-match-transferproof-foundation',
    title: 'Matte Match Transferproof Foundation',
    description: 'Up to 24HR wear, transferproof, matte finish foundation.',
    category: 'FACE',
    shade_name: '03 Ivory (Fair, Warm Undertone)',
    shade_hex: 'EDD5B2',
    sku: 'MMTF-03',
    price: 13,
    msrp: 16,
    stock: 100,
    is_new_launch: false,
    is_bestseller: false,
    review_count: 1095,
    main_image: 'matte-match-transferproof-foundation-03.jpg',
    hover_image: 'matte-match-transferproof-foundation-03-hover.jpg',
  },
  {
    handle: 'matte-match-transferproof-foundation',
    title: 'Matte Match Transferproof Foundation',
    description: 'Up to 24HR wear, transferproof, matte finish foundation.',
    category: 'FACE',
    shade_name: '06 Honey (Medium, Warm Undertone)',
    shade_hex: 'C9935C',
    sku: 'MMTF-06',
    price: 13,
    msrp: 16,
    stock: 80,
    is_new_launch: false,
    is_bestseller: false,
    review_count: 1095,
    main_image: 'matte-match-transferproof-foundation-06.jpg',
    hover_image: 'matte-match-transferproof-foundation-06-hover.jpg',
  },

  // ── Tan Ban 4% Niacinamide Sunscreen Light Gel ────────────────────────────
  {
    handle: 'tan-ban-4-niacinamide-sunscreen-light-gel',
    title: 'Tan Ban 4% Niacinamide Sunscreen Light Gel',
    description: "A lightweight water-gel sunscreen. Quick-absorbing, instantly cooling. SPF 50+ Broad Spectrum.",
    category: 'SKIN',
    sku: 'TBNSG-01',
    price: 19,
    msrp: 22,
    stock: 500,
    is_new_launch: false,
    is_bestseller: true,
    badge: 'BESTSELLER',
    review_count: 1030,
    main_image: 'tan-ban-4-niacinamide-sunscreen-light-gel.jpg',
    hover_image: 'tan-ban-4-niacinamide-sunscreen-light-gel-hover.jpg',
    gallery_images:
      'tan-ban-4-niacinamide-sunscreen-light-gel-g1.jpg;tan-ban-4-niacinamide-sunscreen-light-gel-g2.jpg',
  },

  // ── Partner in Shine Transferproof Lip Gloss ──────────────────────────────
  {
    handle: 'partner-in-shine-transferproof-lip-gloss',
    title: 'Partner in Shine Transferproof Lip Gloss',
    description: 'Unstoppable shine, limitless you. Non-sticky, transferproof gloss.',
    category: 'LIPS',
    shade_name: '01 Clear Quartz',
    shade_hex: 'F5C5C5',
    sku: 'PISTLG-01',
    price: 14,
    msrp: 18,
    stock: 200,
    is_new_launch: true,
    is_bestseller: false,
    badge: 'NEW LAUNCH',
    review_count: 649,
    main_image: 'partner-in-shine-transferproof-lip-gloss-01.jpg',
    hover_image: 'partner-in-shine-transferproof-lip-gloss-01-hover.jpg',
  },
  {
    handle: 'partner-in-shine-transferproof-lip-gloss',
    title: 'Partner in Shine Transferproof Lip Gloss',
    description: 'Unstoppable shine, limitless you. Non-sticky, transferproof gloss.',
    category: 'LIPS',
    shade_name: '02 Pink Bliss',
    shade_hex: 'F0808A',
    sku: 'PISTLG-02',
    price: 14,
    msrp: 18,
    stock: 175,
    is_new_launch: true,
    is_bestseller: false,
    badge: 'NEW LAUNCH',
    review_count: 649,
    main_image: 'partner-in-shine-transferproof-lip-gloss-02.jpg',
    hover_image: 'partner-in-shine-transferproof-lip-gloss-02-hover.jpg',
  },
]

function main(): void {
  // ── 1. Write Excel ──────────────────────────────────────────────────────────
  fs.mkdirSync(path.dirname(CATALOG_PATH), { recursive: true })

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)

  // Freeze header row and set column widths
  ws['!freeze'] = { xSplit: 0, ySplit: 1 }
  ws['!cols'] = [
    { wch: 46 }, // handle
    { wch: 46 }, // title
    { wch: 50 }, // description
    { wch: 12 }, // category
    { wch: 14 }, // subcategory
    { wch: 30 }, // shade_name
    { wch: 10 }, // shade_hex
    { wch: 14 }, // sku
    { wch: 8 },  // price
    { wch: 8 },  // msrp
    { wch: 8 },  // stock
    { wch: 14 }, // is_new_launch
    { wch: 14 }, // is_bestseller
    { wch: 14 }, // badge
    { wch: 14 }, // review_count
    { wch: 54 }, // main_image
    { wch: 54 }, // hover_image
    { wch: 90 }, // gallery_images
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Products')
  XLSX.writeFile(wb, CATALOG_PATH)
  console.log(`Wrote ${rows.length} rows → ${path.relative(REPO_ROOT, CATALOG_PATH)}`)

  // ── 2. Touch placeholder media files ───────────────────────────────────────
  fs.mkdirSync(MEDIA_RAW_PATH, { recursive: true })

  const mediaRefs = new Set<string>()
  rows.forEach((r) => {
    mediaRefs.add(r.main_image)
    if (r.hover_image) mediaRefs.add(r.hover_image)
    if (r.gallery_images) {
      r.gallery_images
        .split(';')
        .map((f) => f.trim())
        .filter(Boolean)
        .forEach((f) => mediaRefs.add(f))
    }
  })

  for (const file of mediaRefs) {
    const dest = path.join(MEDIA_RAW_PATH, file)
    if (!fs.existsSync(dest)) {
      fs.writeFileSync(dest, '') // placeholder — real images dropped here manually
    }
  }
  console.log(`Touched ${mediaRefs.size} placeholder files → data/media-raw/`)
  console.log(`\nDone. Run: pnpm --filter @sugar-store/catalog-import validate`)
}

main()
