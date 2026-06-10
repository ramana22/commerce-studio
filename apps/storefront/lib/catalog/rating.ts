/**
 * Deterministic pseudo-rating so the catalog feels alive without a reviews
 * backend. Stable per product (derived from the id) — the same product always
 * resolves to the same rating/count.
 */
export function pseudoRating(id: string): { rating: number; count: number } {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  const rating = 4 + (h % 10) / 10 // 4.0 – 4.9
  const count = 24 + (h % 920) // 24 – 943
  return { rating: Math.round(rating * 10) / 10, count }
}
