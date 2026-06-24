/**
 * Scent intelligence layer — moods, note pyramids and wear attributes.
 *
 * Fragrance products sell on feeling, so the storefront organises the catalog
 * around scent moods (Fresh, Floral, Sweet…) in addition to the Medusa
 * categories. Until the catalog carries real scent metadata, each product gets
 * a deterministic profile derived from its handle — the same approach used by
 * `pseudoRating` and `bottleImage`, so a product always keeps the same mood,
 * notes and wear stats everywhere it appears (cards, PLP filters, PDP, mood
 * pages).
 *
 * Pure TypeScript with no server/client dependencies so both RSC and client
 * components (PLP filtering) can share it.
 */
import { CATEGORIES } from '@sugar-store/validators/category'

export interface ScentMood {
  slug: string
  label: string
  tagline: string
  description: string
  /** [soft tint, deep accent] for gradient art. */
  accent: [string, string]
  /** Mid-tone aura/glow colour for interactive art. */
  aura: string
  /** Characteristic notes used in marketing copy. */
  signatureNotes: string[]
}

export const SCENT_MOODS: ScentMood[] = [
  {
    slug: 'fresh',
    label: 'Fresh',
    tagline: 'Crisp, green & energising',
    description:
      'Cold citrus, crushed leaves and morning air. For the ones who like their presence felt like an open window.',
    accent: ['#EAF3E4', '#4F7C4A'],
    aura: '#8FBC8B',
    signatureNotes: ['Bergamot', 'Green Tea', 'Vetiver'],
  },
  {
    slug: 'floral',
    label: 'Floral',
    tagline: 'Romantic, soft & timeless',
    description:
      'Velvet rose, night jasmine and a trace of powder. Worn close, it reads like a love letter.',
    accent: ['#F9E7EE', '#B45A7C'],
    aura: '#E3A2BC',
    signatureNotes: ['Damask Rose', 'Jasmine', 'Peony'],
  },
  {
    slug: 'sweet',
    label: 'Sweet',
    tagline: 'Warm gourmand comfort',
    description:
      'Caramelised sugar, vanilla orchid and praline. Dangerously edible — the scent of staying in close.',
    accent: ['#F7E8D8', '#A9622E'],
    aura: '#D99A5B',
    signatureNotes: ['Vanilla', 'Tonka Bean', 'Praline'],
  },
  {
    slug: 'woody',
    label: 'Woody',
    tagline: 'Grounded, deep & refined',
    description:
      'Sandalwood, cedar and smoked vetiver. Quiet confidence that lingers long after you leave the room.',
    accent: ['#EFE7DA', '#6B4A2F'],
    aura: '#A07850',
    signatureNotes: ['Sandalwood', 'Cedarwood', 'Vetiver'],
  },
  {
    slug: 'spicy',
    label: 'Spicy',
    tagline: 'Bold, magnetic & fiery',
    description:
      'Saffron, pink pepper and a leather heart. For evenings that are not meant to end early.',
    accent: ['#F7E2D2', '#A93C18'],
    aura: '#D97742',
    signatureNotes: ['Saffron', 'Pink Pepper', 'Oud'],
  },
  {
    slug: 'aqua',
    label: 'Aqua',
    tagline: 'Clean, marine & weightless',
    description:
      'Sea salt, grapefruit and driftwood. The closest a bottle gets to a shoreline at first light.',
    accent: ['#E2EFF4', '#36677F'],
    aura: '#7FB2CC',
    signatureNotes: ['Sea Salt', 'Marine Accord', 'Driftwood'],
  },
  {
    slug: 'musky',
    label: 'Musky',
    tagline: 'Skin-like, sensual & soft',
    description:
      'Cashmere musk, iris and warm suede. Barely there — until someone leans in.',
    accent: ['#ECE6EE', '#5D4B66'],
    aura: '#9C86A8',
    signatureNotes: ['White Musk', 'Iris', 'Cashmeran'],
  },
]

export function findMood(slug: string): ScentMood | undefined {
  return SCENT_MOODS.find((m) => m.slug === slug)
}

/**
 * True when a product should get fragrance-only UI (scent mood badge, notes
 * teaser, Scent DNA panel). Real Sugar Cosmetics imports tag
 * `metadata.category` with one of the uppercase CATEGORIES enum values (LIPS,
 * FACE, ...) — see packages/validators/src/category.ts. BodyScent demo
 * fragrances tag it with a lowercase storefront nav handle (for-her, unisex,
 * ...) or leave it unset, so anything that isn't a recognised real-catalog
 * category is treated as a fragrance.
 */
export function isFragranceProduct(category: string | null | undefined): boolean {
  return !category || !(CATEGORIES as readonly string[]).includes(category)
}

export function moodHref(slug: string): string {
  return `/scents/${slug}`
}

/** Generated mood-art panel (see scripts/media-pipeline/brand-art.ts). */
export function moodArtUrl(slug: string): string {
  return `/images/moods/mood-${slug}.webp`
}

/** Mood-coherent note pools — [top, heart, base] options per mood. */
const NOTE_POOLS: Record<string, [string[], string[], string[]]> = {
  fresh: [
    ['Bergamot', 'Lemon Zest', 'Green Apple', 'Basil'],
    ['Neroli', 'Green Tea', 'Lily of the Valley', 'Petitgrain'],
    ['White Musk', 'Cedar', 'Vetiver', 'Oakmoss'],
  ],
  floral: [
    ['Pear Blossom', 'Pink Pepper', 'Mandarin', 'Lychee'],
    ['Damask Rose', 'Jasmine', 'Peony', 'Orange Blossom'],
    ['Sandalwood', 'Soft Musk', 'Amberwood', 'Powdery Iris'],
  ],
  sweet: [
    ['Caramelised Sugar', 'Bergamot', 'Bitter Almond', 'Black Cherry'],
    ['Vanilla Orchid', 'Tonka Bean', 'Jasmine Sambac', 'Coconut Cream'],
    ['Praline', 'Benzoin', 'Sandalwood', 'Brown Sugar'],
  ],
  woody: [
    ['Cardamom', 'Bergamot', 'Violet Leaf', 'Cypress'],
    ['Cedarwood', 'Orris', 'Patchouli', 'Smoked Tea'],
    ['Sandalwood', 'Vetiver', 'Amber', 'Guaiac Wood'],
  ],
  spicy: [
    ['Saffron', 'Pink Pepper', 'Cinnamon', 'Bergamot'],
    ['Clove', 'Nutmeg', 'Rose Absolute', 'Incense'],
    ['Oud', 'Leather', 'Tobacco', 'Dark Amber'],
  ],
  aqua: [
    ['Sea Salt', 'Grapefruit', 'Frozen Mint', 'Calabrian Lime'],
    ['Marine Accord', 'Clary Sage', 'Lavender', 'Rosemary'],
    ['Driftwood', 'Ambergris', 'Mineral Musk', 'Teakwood'],
  ],
  musky: [
    ['Aldehydes', 'Iris', 'Bergamot', 'Carrot Seed'],
    ['White Musk', 'Heliotrope', 'Suede', 'Rice Powder'],
    ['Cashmeran', 'Vanilla', 'Skin Musk', 'Blond Woods'],
  ],
}

export type IntensityLabel = 'Soft' | 'Moderate' | 'Bold'
export type SillageLabel = 'Intimate' | 'Moderate' | 'Room-filling'

const OCCASIONS = [
  'Everyday',
  'Office',
  'Date Night',
  'Evenings Out',
  'Special Occasions',
] as const

export type Occasion = (typeof OCCASIONS)[number]

export const INTENSITY_LABELS: IntensityLabel[] = ['Soft', 'Moderate', 'Bold']
export const LONGEVITY_HOURS = [8, 10, 12] as const
export const OCCASION_OPTIONS: readonly Occasion[] = OCCASIONS

export interface ScentProfile {
  mood: ScentMood
  top: string[]
  heart: string[]
  base: string[]
  /** 1–5 concentration strength. */
  intensity: number
  intensityLabel: IntensityLabel
  longevityHours: (typeof LONGEVITY_HOURS)[number]
  sillage: SillageLabel
  occasion: Occasion
}

function hash(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return h
}

/** Two distinct picks from a pool, stable for a given hash slice. */
function pick2(pool: string[], h: number): string[] {
  const a = h % pool.length
  const b = (a + 1 + ((h >> 4) % (pool.length - 1))) % pool.length
  return [pool[a]!, pool[b]!]
}

/**
 * Deterministic scent profile for a product. Seed with the product handle so
 * the profile is stable across builds and identical on server and client.
 */
export function scentProfile(seed: string): ScentProfile {
  const h = hash(seed)
  const mood = SCENT_MOODS[h % SCENT_MOODS.length]!
  const [topPool, heartPool, basePool] = NOTE_POOLS[mood.slug]!

  const intensity = 2 + (h % 4) // 2–5
  const intensityLabel: IntensityLabel =
    intensity <= 2 ? 'Soft' : intensity <= 3 ? 'Moderate' : 'Bold'
  const sillage: SillageLabel =
    intensity <= 2 ? 'Intimate' : intensity <= 4 ? 'Moderate' : 'Room-filling'

  return {
    mood,
    top: pick2(topPool, h),
    heart: pick2(heartPool, h >> 3),
    base: pick2(basePool, h >> 6),
    intensity,
    intensityLabel,
    longevityHours: LONGEVITY_HOURS[h % LONGEVITY_HOURS.length]!,
    sillage,
    occasion: OCCASIONS[(h >> 5) % OCCASIONS.length]!,
  }
}

/** Short "Bergamot · Rose · Amber" teaser line for product cards. */
export function notesTeaser(profile: ScentProfile): string {
  return [profile.top[0], profile.heart[0], profile.base[0]].join(' · ')
}
