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
    accent: ['#F8E7D6', '#E3A877'],
  },
  {
    slug: 'for-him',
    handle: 'for-him',
    label: 'For Him',
    tagline: 'Woody, spicy & aquatic',
    accent: ['#E7DBCB', '#3B2730'],
  },
  {
    slug: 'unisex',
    handle: 'unisex',
    label: 'Unisex',
    tagline: 'Oud, musk & amber',
    accent: ['#F1E2C9', '#C9923E'],
  },
  {
    slug: 'bestsellers',
    handle: 'bestsellers',
    label: 'Bestsellers',
    tagline: 'Most-loved blends',
    accent: ['#FCF6EF', '#B5571F'],
  },
  {
    slug: 'gifting',
    handle: 'gifting',
    label: 'Gifting',
    tagline: 'Sets they will adore',
    accent: ['#F8E7D6', '#CC6E2C'],
  },
  {
    slug: 'combos',
    handle: 'combos',
    label: 'Combos',
    tagline: 'Build-your-own trios',
    accent: ['#EFC9A9', '#974318'],
  },
]

export function findNavCategory(slug: string): NavCategory | undefined {
  return NAV_CATEGORIES.find((c) => c.slug === slug)
}
