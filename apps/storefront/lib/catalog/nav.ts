/**
 * Storefront navigation categories. The URL slug matches the Medusa category
 * handle, so `/lips` maps directly to the `lips` category.
 */
export interface NavCategory {
  slug: string
  handle: string
  label: string
}

export const NAV_CATEGORIES: NavCategory[] = [
  { slug: 'lips', handle: 'lips', label: 'Lips' },
  { slug: 'eyes', handle: 'eyes', label: 'Eyes' },
  { slug: 'face', handle: 'face', label: 'Face' },
  { slug: 'nails', handle: 'nails', label: 'Nails' },
  { slug: 'skin', handle: 'skin', label: 'Skin' },
  { slug: 'gifting', handle: 'gifting', label: 'Gifting' },
  { slug: 'sugar-pop', handle: 'sugar-pop', label: 'Sugar Pop' },
  { slug: '249-store', handle: '249-store', label: '₹249 Store' },
  { slug: 'kits', handle: 'kits', label: 'Kits' },
]

export function findNavCategory(slug: string): NavCategory | undefined {
  return NAV_CATEGORIES.find((c) => c.slug === slug)
}
