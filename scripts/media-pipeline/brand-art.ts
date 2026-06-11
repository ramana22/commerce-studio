#!/usr/bin/env tsx
/**
 * Generates the BodyScent brand image library — studio product renders,
 * label macros, dark editorials, lifestyle reels, mood art, campaign and hero
 * visuals — as optimised WebP into apps/storefront/public/images/.
 *
 * The storefront ships these as its demo catalog imagery (deterministically
 * keyed per product by lib/catalog/placeholder.ts) so the site looks like a
 * finished brand with zero external image hosts. Real product photography
 * (R2 / Sanity) always takes precedence at runtime.
 *
 * Everything is drawn as SVG and rasterised with sharp, in the same visual
 * system: warm cream studio light, mood-coloured liquids, gold/ink accents.
 *
 * Usage: pnpm --filter @sugar-store/media-pipeline brand-art
 */
import sharp from 'sharp'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { findRepoRoot, kb } from './helpers'

const OUT = path.join(findRepoRoot(), 'apps/storefront/public/images')

/** Mood palettes — keep in sync with apps/storefront/lib/catalog/scent.ts. */
interface Mood {
  slug: string
  /** Liquid gradient [light, deep]. */
  l1: string
  l2: string
  /** Deepest accent (shadows, dark scenes). */
  deep: string
  /** Soft backdrop tint. */
  tint: string
  /** Blend name engraved on the label. */
  blend: string
}

const MOODS: Mood[] = [
  { slug: 'fresh', l1: '#B9D29A', l2: '#5F8C4A', deep: '#3E6238', tint: '#EFF4E6', blend: 'VERT CITRON' },
  { slug: 'floral', l1: '#EFB6CC', l2: '#B45A7C', deep: '#7E3D57', tint: '#F9EAF0', blend: 'VELVET BLOOM' },
  { slug: 'sweet', l1: '#E8B06A', l2: '#A9622E', deep: '#7A4520', tint: '#F8EBDB', blend: 'PRALINE HOUR' },
  { slug: 'woody', l1: '#C99A62', l2: '#6B4A2F', deep: '#46301F', tint: '#F1EADE', blend: 'SANTAL NOIR' },
  { slug: 'spicy', l1: '#E08A4A', l2: '#A93C18', deep: '#732A12', tint: '#F8E6D6', blend: 'SAFFRON VEIL' },
  { slug: 'aqua', l1: '#9CC8DE', l2: '#36677F', deep: '#27485A', tint: '#E7F1F5', blend: 'SALT & SKY' },
  { slug: 'musky', l1: '#C3B0CE', l2: '#5D4B66', deep: '#41344A', tint: '#EFE9F1', blend: 'SKIN MUSK' },
]

const INK = '#1A1310'
const GOLD = '#C9923E'

/** Escape text destined for SVG <text> nodes. */
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/* ------------------------------------------------------------------ */
/* SVG building blocks                                                  */
/* ------------------------------------------------------------------ */

/** Shared defs: blurs, grain and vignette helpers (parameterised per doc). */
function commonDefs(w: number, h: number): string {
  return `
  <filter id="blur4" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4"/></filter>
  <filter id="blur10" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="10"/></filter>
  <filter id="blur24" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="24"/></filter>
  <filter id="blur48" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="48"/></filter>
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.55 0.55 0.55 0 0"/>
  </filter>
  <radialGradient id="vig" cx="0.5" cy="0.46" r="0.78">
    <stop offset="0.62" stop-color="${INK}" stop-opacity="0"/>
    <stop offset="1" stop-color="${INK}" stop-opacity="0.16"/>
  </radialGradient>
  <linearGradient id="goldcap" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#9C742B"/><stop offset="0.22" stop-color="#EBCB7E"/>
    <stop offset="0.5" stop-color="#C9923E"/><stop offset="0.78" stop-color="#EBCB7E"/>
    <stop offset="1" stop-color="#8A6420"/>
  </linearGradient>
  <linearGradient id="blackcap" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#0C0A09"/><stop offset="0.3" stop-color="#3A3431"/>
    <stop offset="0.55" stop-color="#191512"/><stop offset="1" stop-color="#070605"/>
  </linearGradient>
  <linearGradient id="steel" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#8E8A85"/><stop offset="0.3" stop-color="#E8E5E1"/>
    <stop offset="0.6" stop-color="#B9B5B0"/><stop offset="1" stop-color="#7A766F"/>
  </linearGradient>
  <rect id="grainRect" width="${w}" height="${h}"/>`
}

function grainAndVignette(w: number, h: number, grainOpacity = 0.045): string {
  return `
  <rect width="${w}" height="${h}" fill="url(#vig)"/>
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity="${grainOpacity}"/>`
}

function svgDoc(w: number, h: number, body: string, defs = ''): Buffer {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs>${commonDefs(w, h)}${defs}</defs>
${body}
</svg>`,
  )
}

interface BottleOpts {
  /** 1 classic flacon · 2 roll-on · 3 orb · 4 square cologne. */
  shape: 1 | 2 | 3 | 4
  mood: Mood
  /** Unique id suffix so gradients never collide within a doc. */
  uid: string
  /** Render the engraved label (off for silhouettes). */
  label?: boolean
  /** Label number, e.g. "Nº 03". */
  no?: string
  /** Subtitle under the rule; defaults to the mood blend name. */
  blend?: string
  /** Dark-scene styling (stronger rims, dimmer glass). */
  dark?: boolean
  /** Pure silhouette for backdrops (no label, near-black glass). */
  silhouette?: boolean
  /** Stronger glass body for renders on transparent canvases (hero). */
  glassBoost?: boolean
}

/**
 * A perfume bottle drawn in local coords — origin at the centre of the base,
 * body extending upward (negative y). Place with translate(cx floorY).
 * Returns gradient defs and the body group separately.
 */
function bottle(o: BottleOpts): { defs: string; body: string; width: number; height: number } {
  const { mood, uid } = o
  const sil = o.silhouette === true
  const dark = o.dark === true || sil

  const boost = o.glassBoost === true
  const glassFill = sil
    ? 'rgba(14,10,8,0.94)'
    : dark
      ? 'rgba(20,14,10,0.45)'
      : boost
        ? 'rgba(252,248,242,0.72)'
        : 'rgba(255,255,255,0.42)'
  const glassStroke = sil
    ? 'rgba(255,255,255,0.10)'
    : dark
      ? 'rgba(255,255,255,0.38)'
      : boost
        ? 'rgba(255,255,255,0.95)'
        : 'rgba(255,255,255,0.85)'

  const defs = `
  <linearGradient id="liq${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${mood.l1}"/><stop offset="1" stop-color="${mood.l2}"/>
  </linearGradient>
  <linearGradient id="glass${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${glassFill}"/>
    <stop offset="1" stop-color="${sil ? 'rgba(8,6,5,0.96)' : dark ? 'rgba(26,19,16,0.55)' : boost ? 'rgba(252,248,242,0.4)' : 'rgba(255,255,255,0.16)'}"/>
  </linearGradient>`

  // Geometry per shape: [bodyW, bodyH, bodyRx, liquidInset, liquidLevel(0–1 of bodyH)]
  const G: Record<number, [number, number, number, number, number]> = {
    1: [300, 420, 34, 12, 0.74],
    2: [150, 440, 58, 11, 0.72],
    3: [320, 330, 118, 13, 0.7],
    4: [330, 380, 18, 12, 0.76],
  }
  const [W, H, RX, IN, LV] = G[o.shape]!
  const liqH = Math.round(H * LV) - IN
  const liqY = -(IN + liqH)
  const liqRx = Math.max(10, RX - IN)

  // --- glass body + liquid -----------------------------------------
  let body = `
  <rect x="${-W / 2}" y="${-H}" width="${W}" height="${H}" rx="${RX}" fill="url(#glass${uid})" stroke="${glassStroke}" stroke-width="${sil ? 2 : 3}"/>
  <rect x="${-W / 2 + IN}" y="${liqY}" width="${W - IN * 2}" height="${liqH}" rx="${liqRx}" fill="url(#liq${uid})" opacity="${sil ? 0.32 : 0.96}"/>
  <ellipse cx="0" cy="${liqY + 4}" rx="${W / 2 - IN - 4}" ry="9" fill="${mood.l1}" opacity="${sil ? 0.25 : 0.8}"/>`

  if (!sil) {
    body += `
  <ellipse cx="0" cy="${liqY + liqH * 0.45}" rx="${W * 0.3}" ry="${liqH * 0.32}" fill="#FFFFFF" opacity="0.10" filter="url(#blur24)"/>
  <rect x="${-W / 2 + IN + 8}" y="${-H + 26}" width="${Math.max(16, W * 0.08)}" height="${H - 56}" rx="${Math.max(8, W * 0.04)}" fill="#FFFFFF" opacity="${dark ? 0.18 : 0.3}" filter="url(#blur4)"/>
  <rect x="${W / 2 - IN - 16}" y="${-H + 40}" width="9" height="${H - 80}" rx="4.5" fill="${INK}" opacity="0.10"/>
  <ellipse cx="0" cy="-13" rx="${W / 2 - 18}" ry="12" fill="#FFFFFF" opacity="${dark ? 0.10 : 0.2}"/>`
  } else {
    // Rim lights so silhouettes read against dark scenes.
    body += `
  <rect x="${-W / 2 + 2}" y="${-H + 22}" width="6" height="${H - 50}" rx="3" fill="#FFFFFF" opacity="0.3" filter="url(#blur4)"/>
  <rect x="${W / 2 - 9}" y="${-H + 30}" width="6" height="${H - 64}" rx="3" fill="${GOLD}" opacity="0.4" filter="url(#blur4)"/>
  <rect x="${W * 0.16}" y="${liqY + 14}" width="14" height="${liqH - 36}" rx="7" fill="${mood.l1}" opacity="0.35" filter="url(#blur4)"/>`
  }

  // --- collar + cap --------------------------------------------------
  const capGrad = o.shape === 2 || o.shape === 4 ? 'url(#blackcap)' : 'url(#goldcap)'
  const collarGrad = o.shape === 2 ? 'url(#steel)' : 'url(#goldcap)'
  const capW = o.shape === 2 ? 92 : o.shape === 3 ? 88 : 110
  const capH = o.shape === 2 ? 74 : o.shape === 3 ? 66 : 92
  const colW = o.shape === 2 ? 80 : 58
  const colH = o.shape === 2 ? 30 : 34
  const capY = -H - colH - capH
  body += `
  <rect x="${-colW / 2}" y="${-H - colH}" width="${colW}" height="${colH + 6}" fill="${collarGrad}" opacity="${sil ? 0.5 : 1}"/>
  <rect x="${-capW / 2}" y="${capY}" width="${capW}" height="${capH}" rx="13" fill="${capGrad}" opacity="${sil ? 0.85 : 1}"/>`
  if (!sil) {
    body += `
  <rect x="${-capW / 2 + 14}" y="${capY + 8}" width="5" height="${capH - 16}" rx="2.5" fill="#FFFFFF" opacity="0.35"/>
  <rect x="${capW / 2 - 19}" y="${capY + 8}" width="5" height="${capH - 16}" rx="2.5" fill="${INK}" opacity="0.25"/>
  <rect x="${-capW / 2}" y="${capY + capH - 7}" width="${capW}" height="7" rx="3.5" fill="${INK}" opacity="0.3"/>`
  } else {
    body += `
  <rect x="${-capW / 2}" y="${capY}" width="${capW}" height="5" rx="2.5" fill="${GOLD}" opacity="0.5"/>`
  }

  // --- label ----------------------------------------------------------
  if (o.label !== false && !sil) {
    const lw = o.shape === 2 ? 118 : o.shape === 3 ? 180 : 196
    const lh = o.shape === 2 ? 168 : o.shape === 3 ? 128 : 152
    const cy = o.shape === 3 ? -H * 0.52 : -H * 0.5
    const top = cy - lh / 2
    const brand = o.shape === 2 ? 15.5 : 23
    const blend = esc((o.blend ?? mood.blend).toUpperCase())
    body += `
  <rect x="${-lw / 2}" y="${top}" width="${lw}" height="${lh}" rx="9" fill="#FDF9F2" stroke="#E5D6BE" stroke-width="1.6"/>
  <text x="0" y="${top + lh * 0.2}" font-family="serif" font-size="13" font-style="italic" fill="${GOLD}" text-anchor="middle">${o.no ?? 'Nº 01'}</text>
  <text x="0" y="${top + lh * 0.42}" font-family="serif" font-size="${brand}" font-weight="600" letter-spacing="${o.shape === 2 ? 1.6 : 4}" fill="${INK}" text-anchor="middle">BODYSCENT</text>
  <line x1="${-lw * 0.22}" y1="${top + lh * 0.52}" x2="${lw * 0.22}" y2="${top + lh * 0.52}" stroke="${GOLD}" stroke-width="1.8"/>
  <text x="0" y="${top + lh * 0.68}" font-family="sans-serif" font-size="${o.shape === 2 ? 9 : 11.5}" letter-spacing="2.6" fill="#6E5E4E" text-anchor="middle">${blend}</text>
  <text x="0" y="${top + lh * 0.84}" font-family="sans-serif" font-size="${o.shape === 2 ? 7.5 : 9}" letter-spacing="1.6" fill="#A39482" text-anchor="middle">PURE PERFUME OIL</text>`
  }

  return { defs, body, width: W, height: H + colH + capH }
}

/** Place a bottle on a floor line with contact shadow and fading reflection. */
function placedBottle(
  o: BottleOpts & { cx: number; floorY: number; scale?: number; reflection?: boolean; canvasW: number; canvasH: number },
): { defs: string; body: string } {
  const b = bottle(o)
  const s = o.scale ?? 1
  const shadowRx = (b.width / 2) * s * 1.25
  let defs = b.defs
  let out = `
  <ellipse cx="${o.cx}" cy="${o.floorY + 10 * s}" rx="${shadowRx}" ry="${22 * s}" fill="${INK}" opacity="${o.dark || o.silhouette ? 0.5 : 0.2}" filter="url(#blur10)"/>
  <g id="bt${o.uid}" transform="translate(${o.cx} ${o.floorY}) scale(${s})">${b.body}</g>`
  if (o.reflection !== false) {
    defs += `
  <linearGradient id="rg${o.uid}" x1="0" y1="${o.floorY}" x2="0" y2="${o.floorY + 230 * s}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.85"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
  </linearGradient>
  <mask id="rm${o.uid}"><rect x="0" y="${o.floorY}" width="${o.canvasW}" height="${230 * s}" fill="url(#rg${o.uid})"/></mask>`
    out += `
  <use href="#bt${o.uid}" xlink:href="#bt${o.uid}" transform="translate(0 ${2 * o.floorY}) scale(1 -1)" opacity="0.14" mask="url(#rm${o.uid})"/>`
  }
  return { defs, body: out }
}

/* ------------------------------------------------------------------ */
/* Scenes                                                               */
/* ------------------------------------------------------------------ */

/** Warm studio product shot — wall/floor split, spotlight, one bottle. */
function studioShot(mood: Mood, shape: 1 | 2 | 3 | 4, no: string): Buffer {
  const W = 800
  const H = 1000
  const floorY = 830
  const p = placedBottle({
    shape,
    mood,
    uid: 'a',
    no,
    cx: 400,
    floorY,
    scale: 1,
    canvasW: W,
    canvasH: H,
  })
  const defs = `
  <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FFFDF9"/><stop offset="0.7" stop-color="${mood.tint}"/><stop offset="1" stop-color="${mood.tint}"/>
  </linearGradient>
  <radialGradient id="spot" cx="0.5" cy="0.4" r="0.62">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.78"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${INK}" stop-opacity="0.07"/><stop offset="1" stop-color="${INK}" stop-opacity="0.015"/>
  </linearGradient>
  ${p.defs}`
  const body = `
  <rect width="${W}" height="${H}" fill="url(#wall)"/>
  <ellipse cx="400" cy="420" rx="430" ry="400" fill="url(#spot)"/>
  <ellipse cx="190" cy="250" rx="220" ry="200" fill="${mood.l1}" opacity="0.16" filter="url(#blur48)"/>
  <ellipse cx="650" cy="700" rx="200" ry="180" fill="${mood.l2}" opacity="0.10" filter="url(#blur48)"/>
  <rect y="${floorY}" width="${W}" height="${H - floorY}" fill="url(#floor)"/>
  <line x1="0" y1="${floorY}" x2="${W}" y2="${floorY}" stroke="${INK}" stroke-opacity="0.05" stroke-width="2"/>
  ${p.body}
  ${grainAndVignette(W, H)}`
  return svgDoc(W, H, body, defs)
}

/** Macro crop of the classic flacon — the label fills the frame. */
function detailShot(mood: Mood, no: string): Buffer {
  const W = 800
  const H = 1000
  const p = placedBottle({
    shape: 1,
    mood,
    uid: 'd',
    no,
    cx: 400,
    floorY: 1330,
    scale: 2.05,
    reflection: false,
    canvasW: W,
    canvasH: H,
  })
  const defs = `
  <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FFFDF9"/><stop offset="1" stop-color="${mood.tint}"/>
  </linearGradient>
  <radialGradient id="spot" cx="0.5" cy="0.34" r="0.7">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.7"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
  </radialGradient>
  ${p.defs}`
  const body = `
  <rect width="${W}" height="${H}" fill="url(#wall)"/>
  <ellipse cx="400" cy="330" rx="460" ry="380" fill="url(#spot)"/>
  <ellipse cx="160" cy="180" rx="260" ry="220" fill="${mood.l1}" opacity="0.22" filter="url(#blur48)"/>
  <ellipse cx="680" cy="260" rx="220" ry="200" fill="${mood.l2}" opacity="0.12" filter="url(#blur48)"/>
  ${p.body}
  ${grainAndVignette(W, H, 0.05)}`
  return svgDoc(W, H, body, defs)
}

/** Dark editorial shot — spotlight drama and gold dust. */
function editorialShot(mood: Mood, no: string): Buffer {
  const W = 800
  const H = 1000
  const floorY = 840
  const p = placedBottle({
    shape: 1,
    mood,
    uid: 'e',
    no,
    dark: true,
    cx: 400,
    floorY,
    scale: 1.02,
    canvasW: W,
    canvasH: H,
  })
  const dust = Array.from({ length: 16 })
    .map((_, i) => {
      const x = 90 + ((i * 173) % 640)
      const y = 110 + ((i * 257) % 600)
      const r = 2 + (i % 4)
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="${GOLD}" opacity="${0.12 + (i % 3) * 0.1}" filter="url(#blur4)"/>`
    })
    .join('')
  const defs = `
  <radialGradient id="dbg" cx="0.5" cy="0.38" r="0.85">
    <stop offset="0" stop-color="#3A2417"/><stop offset="0.55" stop-color="#221710"/><stop offset="1" stop-color="#120D0A"/>
  </radialGradient>
  <radialGradient id="halo" cx="0.5" cy="0.42" r="0.4">
    <stop offset="0" stop-color="${mood.l2}" stop-opacity="0.5"/><stop offset="1" stop-color="${mood.l2}" stop-opacity="0"/>
  </radialGradient>
  ${p.defs}`
  const body = `
  <rect width="${W}" height="${H}" fill="url(#dbg)"/>
  <ellipse cx="400" cy="430" rx="380" ry="380" fill="url(#halo)"/>
  ${dust}
  ${p.body}
  ${grainAndVignette(W, H, 0.06)}`
  return svgDoc(W, H, body, defs)
}

/** 9:16 campaign/lifestyle art for the reels rail. */
function reelShot(cfg: {
  mood: Mood
  cx: number
  scale: number
  shape: 1 | 2 | 3 | 4
  second?: { shape: 1 | 2 | 3 | 4; cx: number; scale: number }
  streakAngle: number
}): Buffer {
  const W = 600
  const H = 1067
  const floorY = 905
  const { mood } = cfg
  const main = placedBottle({
    shape: cfg.shape,
    mood,
    uid: 'r1',
    silhouette: true,
    cx: cfg.cx,
    floorY,
    scale: cfg.scale,
    canvasW: W,
    canvasH: H,
  })
  const second = cfg.second
    ? placedBottle({
        shape: cfg.second.shape,
        mood,
        uid: 'r2',
        silhouette: true,
        cx: cfg.second.cx,
        floorY,
        scale: cfg.second.scale,
        canvasW: W,
        canvasH: H,
      })
    : null
  const defs = `
  <linearGradient id="rbg" x1="0" y1="0" x2="0.4" y2="1">
    <stop offset="0" stop-color="${mood.l2}"/><stop offset="0.55" stop-color="${mood.deep}"/><stop offset="1" stop-color="#0F0B09"/>
  </linearGradient>
  <radialGradient id="rglow" cx="0.5" cy="0.34" r="0.6">
    <stop offset="0" stop-color="${mood.l1}" stop-opacity="0.5"/><stop offset="1" stop-color="${mood.l1}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="rbottom" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0F0B09" stop-opacity="0"/><stop offset="1" stop-color="#0F0B09" stop-opacity="0.88"/>
  </linearGradient>
  ${main.defs}${second ? second.defs : ''}`
  const bokeh = [
    [120, 240, 70, mood.l1, 0.2],
    [470, 160, 54, '#FFFFFF', 0.12],
    [520, 460, 80, mood.l1, 0.14],
    [90, 620, 60, '#FFFFFF', 0.08],
  ]
    .map(([x, y, r, c, op]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${op}" filter="url(#blur24)"/>`)
    .join('')
  const body = `
  <rect width="${W}" height="${H}" fill="url(#rbg)"/>
  <ellipse cx="300" cy="360" rx="340" ry="360" fill="url(#rglow)"/>
  ${bokeh}
  <rect x="-160" y="380" width="1000" height="120" fill="#FFFFFF" opacity="0.07" filter="url(#blur48)" transform="rotate(${cfg.streakAngle} 300 440)"/>
  ${second ? second.body : ''}
  ${main.body}
  <rect y="${H - 330}" width="${W}" height="330" fill="url(#rbottom)"/>
  ${grainAndVignette(W, H, 0.055)}`
  return svgDoc(W, H, body, defs)
}

/** Abstract mood-art panel (explorer preview + mood page hero backdrop). */
function moodArt(mood: Mood): Buffer {
  const W = 900
  const H = 1100
  const defs = `
  <linearGradient id="mbg" x1="0" y1="0" x2="0.35" y2="1">
    <stop offset="0" stop-color="${mood.tint}"/><stop offset="1" stop-color="${mood.l2}"/>
  </linearGradient>`
  const body = `
  <rect width="${W}" height="${H}" fill="url(#mbg)"/>
  <ellipse cx="700" cy="230" rx="360" ry="320" fill="${mood.l1}" opacity="0.6" filter="url(#blur48)"/>
  <ellipse cx="170" cy="600" rx="320" ry="300" fill="${mood.l2}" opacity="0.5" filter="url(#blur48)"/>
  <ellipse cx="620" cy="900" rx="330" ry="280" fill="${mood.deep}" opacity="0.5" filter="url(#blur48)"/>
  <ellipse cx="380" cy="380" rx="240" ry="220" fill="#FFFFFF" opacity="0.16" filter="url(#blur48)"/>
  <circle cx="300" cy="330" r="290" fill="none" stroke="${GOLD}" stroke-opacity="0.3" stroke-width="2"/>
  <circle cx="660" cy="800" r="200" fill="none" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="1.6"/>
  ${grainAndVignette(W, H, 0.05)}`
  return svgDoc(W, H, body, defs)
}

/** "Golden Hour Edit" campaign visual — dusk light over an amber trio. */
function campaignGoldenHour(): Buffer {
  const W = 900
  const H = 1100
  const floorY = 920
  const sweet = MOODS.find((m) => m.slug === 'sweet')!
  const woody = MOODS.find((m) => m.slug === 'woody')!
  const spicy = MOODS.find((m) => m.slug === 'spicy')!
  const b1 = placedBottle({ shape: 1, mood: sweet, uid: 'g1', silhouette: true, cx: 300, floorY, scale: 1.05, canvasW: W, canvasH: H })
  const b2 = placedBottle({ shape: 2, mood: spicy, uid: 'g2', silhouette: true, cx: 560, floorY, scale: 1.12, canvasW: W, canvasH: H })
  const b3 = placedBottle({ shape: 3, mood: woody, uid: 'g3', silhouette: true, cx: 700, floorY, scale: 0.82, canvasW: W, canvasH: H })
  const defs = `
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#F6C97E"/><stop offset="0.45" stop-color="#D98A4E"/>
    <stop offset="0.75" stop-color="#8A4218"/><stop offset="1" stop-color="#2B1709"/>
  </linearGradient>
  <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#FFF3DC" stop-opacity="0.95"/><stop offset="0.5" stop-color="#F6C97E" stop-opacity="0.5"/>
    <stop offset="1" stop-color="#F6C97E" stop-opacity="0"/>
  </radialGradient>
  ${b1.defs}${b2.defs}${b3.defs}`
  const shadows = [
    [300, 1.05],
    [560, 1.12],
    [700, 0.82],
  ]
    .map(
      ([cx, s]) =>
        `<ellipse cx="${(cx as number) - 130 * (s as number)}" cy="${floorY + 16}" rx="${190 * (s as number)}" ry="14" fill="#1A0E06" opacity="0.4" filter="url(#blur10)" transform="rotate(-2 ${cx} ${floorY})"/>`,
    )
    .join('')
  const body = `
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <circle cx="620" cy="330" r="330" fill="url(#sun)"/>
  <circle cx="620" cy="330" r="96" fill="#FFF6E4" opacity="0.9" filter="url(#blur24)"/>
  <rect y="340" width="${W}" height="26" fill="#FFE9C2" opacity="0.22" filter="url(#blur10)"/>
  <rect y="430" width="${W}" height="18" fill="#FFE9C2" opacity="0.16" filter="url(#blur10)"/>
  <rect y="${floorY}" width="${W}" height="${H - floorY}" fill="#1F1006" opacity="0.78"/>
  ${shadows}
  ${b3.body}${b1.body}${b2.body}
  ${grainAndVignette(W, H, 0.06)}`
  return svgDoc(W, H, body, defs)
}

/** Transparent hero flacon render for the homepage editions. */
function heroFlacon(liquid: [string, string], no: string, blend: string): Buffer {
  const W = 560
  const H = 840
  const mood: Mood = {
    slug: 'hero',
    l1: liquid[0],
    l2: liquid[1],
    deep: liquid[1],
    tint: '#FBF5EE',
    blend,
  }
  const b = bottle({ shape: 1, mood, uid: 'h', no, blend, glassBoost: true })
  const s = 1.22
  const floorY = 800
  const body = `
  <ellipse cx="280" cy="${floorY + 6}" rx="200" ry="26" fill="${liquid[1]}" opacity="0.5" filter="url(#blur24)"/>
  <ellipse cx="280" cy="${floorY + 8}" rx="150" ry="16" fill="${INK}" opacity="0.45" filter="url(#blur10)"/>
  <g transform="translate(280 ${floorY}) scale(${s})">${b.body}</g>`
  return svgDoc(W, H, body, b.defs)
}

/** Atelier scene behind the brand-story panel. */
function storyAtelier(): Buffer {
  const W = 1000
  const H = 800
  const floorY = 660
  const vials = [
    [180, 0.42, 'sweet', 2],
    [310, 0.52, 'spicy', 1],
    [455, 0.38, 'woody', 3],
    [580, 0.5, 'floral', 2],
    [720, 0.44, 'musky', 1],
    [840, 0.36, 'sweet', 4],
  ] as const
  const placed = vials.map(([cx, s, slug, shape], i) =>
    placedBottle({
      shape: shape as 1 | 2 | 3 | 4,
      mood: MOODS.find((m) => m.slug === slug)!,
      uid: `v${i}`,
      silhouette: true,
      cx: cx as number,
      floorY,
      scale: s as number,
      canvasW: W,
      canvasH: H,
    }),
  )
  const defs = `
  <linearGradient id="room" x1="0" y1="0" x2="0.7" y2="1">
    <stop offset="0" stop-color="#3A2517"/><stop offset="0.6" stop-color="#231509"/><stop offset="1" stop-color="#140C06"/>
  </linearGradient>
  <linearGradient id="window" x1="0" y1="0" x2="1" y2="0.4">
    <stop offset="0" stop-color="#FFE9BE" stop-opacity="0.5"/><stop offset="1" stop-color="#FFE9BE" stop-opacity="0"/>
  </linearGradient>
  ${placed.map((p) => p.defs).join('')}`
  const dust = Array.from({ length: 14 })
    .map((_, i) => {
      const x = 60 + ((i * 211) % 880)
      const y = 80 + ((i * 149) % 480)
      return `<circle cx="${x}" cy="${y}" r="${2 + (i % 3)}" fill="#F6C97E" opacity="${0.15 + (i % 3) * 0.1}" filter="url(#blur4)"/>`
    })
    .join('')
  const body = `
  <rect width="${W}" height="${H}" fill="url(#room)"/>
  <rect x="-150" y="-120" width="760" height="520" fill="url(#window)" transform="rotate(18 200 100)" filter="url(#blur48)"/>
  ${dust}
  <rect y="${floorY}" width="${W}" height="${H - floorY}" fill="#0E0805" opacity="0.6"/>
  <line x1="0" y1="${floorY}" x2="${W}" y2="${floorY}" stroke="#F6C97E" stroke-opacity="0.14" stroke-width="2"/>
  ${placed.map((p) => p.body).join('')}
  ${grainAndVignette(W, H, 0.06)}`
  return svgDoc(W, H, body, defs)
}

/* ------------------------------------------------------------------ */
/* Main                                                                 */
/* ------------------------------------------------------------------ */

async function writeWebp(svg: Buffer, rel: string, quality = 82): Promise<void> {
  const out = path.join(OUT, rel)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  await sharp(svg).webp({ quality, effort: 5 }).toFile(out)
  const size = fs.statSync(out).size
  console.log(`  ✓ ${rel}  (${kb(size)} KB)`)
}

async function main(): Promise<void> {
  console.log(`Rendering BodyScent brand art → ${path.relative(process.cwd(), OUT)}\n`)

  console.log('Products — studio shots (7 moods × 4 shapes)')
  for (const [mi, mood] of MOODS.entries()) {
    const no = `Nº 0${mi + 1}`
    for (const shape of [1, 2, 3, 4] as const) {
      await writeWebp(studioShot(mood, shape, no), `products/product-${mood.slug}-${shape}.webp`)
    }
  }

  console.log('Products — label macros + dark editorials')
  for (const [mi, mood] of MOODS.entries()) {
    const no = `Nº 0${mi + 1}`
    await writeWebp(detailShot(mood, no), `products/detail-${mood.slug}.webp`)
    await writeWebp(editorialShot(mood, no), `products/editorial-${mood.slug}.webp`)
  }

  console.log('Lifestyle reels')
  const reels: Parameters<typeof reelShot>[0][] = [
    { mood: MOODS.find((m) => m.slug === 'fresh')!, cx: 240, scale: 1.0, shape: 2, streakAngle: -22 },
    { mood: MOODS.find((m) => m.slug === 'floral')!, cx: 330, scale: 1.08, shape: 1, streakAngle: 18 },
    { mood: MOODS.find((m) => m.slug === 'woody')!, cx: 220, scale: 0.95, shape: 4, second: { shape: 2, cx: 420, scale: 0.8 }, streakAngle: -16 },
    { mood: MOODS.find((m) => m.slug === 'sweet')!, cx: 300, scale: 1.14, shape: 1, streakAngle: 24 },
    { mood: MOODS.find((m) => m.slug === 'spicy')!, cx: 360, scale: 1.02, shape: 3, streakAngle: -26 },
    { mood: MOODS.find((m) => m.slug === 'aqua')!, cx: 260, scale: 1.05, shape: 2, second: { shape: 3, cx: 430, scale: 0.7 }, streakAngle: 20 },
  ]
  for (const [i, cfg] of reels.entries()) {
    await writeWebp(reelShot(cfg), `lifestyle/reel-0${i + 1}.webp`)
  }

  console.log('Mood art')
  for (const mood of MOODS) {
    await writeWebp(moodArt(mood), `moods/mood-${mood.slug}.webp`)
  }

  console.log('Campaign + story')
  await writeWebp(campaignGoldenHour(), 'campaign/golden-hour.webp')
  await writeWebp(storyAtelier(), 'campaign/story-atelier.webp')

  console.log('Hero flacons')
  await writeWebp(heroFlacon(['#E8A04C', '#B5571F'], 'Nº 01', 'AMBER OUD'), 'hero/hero-amber.webp', 90)
  await writeWebp(heroFlacon(['#E58AA6', '#B23A5E'], 'Nº 02', 'VELVET BLOOM'), 'hero/hero-bloom.webp', 90)
  await writeWebp(heroFlacon(['#A07850', '#5F4632'], 'Nº 03', 'NOIR VETIVER'), 'hero/hero-noir.webp', 90)

  const total = fs
    .readdirSync(OUT, { recursive: true, withFileTypes: true })
    .filter((d) => d.isFile())
    .reduce((sum, d) => sum + fs.statSync(path.join(d.parentPath, d.name)).size, 0)
  console.log(`\nDone — library total ${(total / 1024 / 1024).toFixed(2)} MB`)
}

void main()
