/**
 * Storefront navigation categories. The URL slug matches the Medusa category
 * handle, so `/for-her` maps directly to the `for-her` category.
 *
 * `tagline` and `accent` drive the category dropdown + showcase tiles so the
 * marketing UI stays data-driven from a single source.
 */
export interface NavCategory {
  slug: string
  handle: string
  label: string
  tagline?: string
  /** Two CSS colours used for the tile / dropdown gradient art. */
  accent?: [string, string]
}

export const NAV_CATEGORIES: NavCategory[] = [
  {
    slug: 'for-her',
    handle: 'for-her',
    label: 'For Her',
    tagline: 'Floral, fruity & gourmand',
    accent: ['#ECF7F1', '#2FA37A'],
  },
  {
    slug: 'for-him',
    handle: 'for-him',
    label: 'For Him',
    tagline: 'Woody, spicy & aquatic',
    accent: ['#E1EEE8', '#10221B'],
  },
  {
    slug: 'unisex',
    handle: 'unisex',
    label: 'Unisex',
    tagline: 'Oud, musk & amber',
    accent: ['#F4EEDC', '#C8A24A'],
  },
  {
    slug: 'bestsellers',
    handle: 'bestsellers',
    label: 'Bestsellers',
    tagline: 'Most-loved blends',
    accent: ['#ECF7F1', '#0E7C5A'],
  },
  {
    slug: 'gifting',
    handle: 'gifting',
    label: 'Gifting',
    tagline: 'Sets they will adore',
    accent: ['#EAF6F0', '#0B6147'],
  },
  {
    slug: 'combos',
    handle: 'combos',
    label: 'Combos',
    tagline: 'Build-your-own trios',
    accent: ['#D2ECE0', '#1A8B62'],
  },
]

export function findNavCategory(slug: string): NavCategory | undefined {
  return NAV_CATEGORIES.find((c) => c.slug === slug)
}
