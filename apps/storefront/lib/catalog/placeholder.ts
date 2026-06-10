/**
 * Generated perfume-bottle placeholder images.
 *
 * The demo catalog ships without real photography, so instead of random
 * grayscale stock photos we render a clean, coloured perfume-bottle SVG per
 * product (encoded as a data URI). The liquid colour is derived deterministically
 * from a seed, so each product keeps a stable, scent-appropriate look. Real
 * images (R2 / Sanity URLs) always take precedence — see `displayImage`.
 */

/** Scent-coloured liquid gradients [top, bottom]. */
const SCENTS: [string, string][] = [
  ['#F6B24A', '#C9692F'], // amber
  ['#E58AA6', '#B23A5E'], // rose
  ['#86CBA8', '#2E7D5B'], // green
  ['#83B6D8', '#2E6B8E'], // aqua
  ['#C3A2E0', '#7E4FB0'], // violet
  ['#E8C26A', '#B8902E'], // gold
  ['#E89B6A', '#B5571F'], // copper
  ['#6FBFB6', '#287F77'], // teal
]

function hash(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return h
}

/** A coloured perfume-bottle illustration as an inline SVG data URI. */
export function bottleImage(seed: string): string {
  const h = hash(seed)
  const [c1, c2] = SCENTS[h % SCENTS.length]!
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>
<defs>
<linearGradient id='bg' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#FBF5EE'/><stop offset='1' stop-color='#F1E2CF'/></linearGradient>
<linearGradient id='liq' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/></linearGradient>
</defs>
<rect width='400' height='500' fill='url(#bg)'/>
<ellipse cx='200' cy='432' rx='96' ry='16' fill='#1A1310' opacity='0.10'/>
<rect x='168' y='66' width='64' height='48' rx='10' fill='#241d1a'/>
<rect x='184' y='112' width='32' height='26' fill='${c2}' opacity='0.5'/>
<rect x='120' y='134' width='160' height='268' rx='28' fill='url(#liq)' stroke='#ffffff' stroke-opacity='0.45' stroke-width='2'/>
<rect x='142' y='156' width='20' height='200' rx='10' fill='#ffffff' opacity='0.2'/>
<rect x='156' y='212' width='88' height='86' rx='8' fill='#ffffff' opacity='0.92'/>
<circle cx='200' cy='236' r='11' fill='${c2}'/>
<rect x='170' y='258' width='60' height='6' rx='3' fill='${c2}' opacity='0.55'/>
</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/** True when a URL is missing or a seeded picsum placeholder (not real media). */
export function isPlaceholder(url: string | null | undefined): boolean {
  return !url || url.includes('picsum.photos')
}

/** Real image when present, else a generated coloured bottle keyed by `seed`. */
export function displayImage(
  url: string | null | undefined,
  seed: string,
): string {
  return isPlaceholder(url) ? bottleImage(seed) : (url as string)
}
