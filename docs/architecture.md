# Architecture

> High-level overview of the Sugar Store monorepo.
> Detailed per-phase decisions recorded as phases are implemented.

## Overview

```
Browser → Vercel Edge (Next.js storefront)
               │
               ├── Medusa API (VPS / Railway)
               │     ├── PostgreSQL
               │     └── Redis
               │
               ├── Sanity CDN (CMS content)
               └── Cloudflare R2 (media)
```

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend | Next.js 15 App Router | Server components + ISR for SEO |
| Commerce | Medusa 2.x | Open-source, self-hosted, fully extensible |
| CMS | Sanity v3 | GROQ queries, real-time preview, portable text |
| Media | Cloudflare R2 | S3-compatible, no egress fees |
| Package manager | pnpm workspaces | Fast, disk-efficient, strict isolation |
| Build orchestration | Turbo | Incremental builds, remote caching ready |

## Data Flow

1. Editor publishes content in Sanity Studio
2. Sanity webhook → Medusa `product.updated` subscriber → calls `/api/revalidate`
3. Next.js ISR purges the affected page cache
4. Next request fetches fresh data from Sanity + Medusa

## UI Layer (Phase 8)

The "extraordinary" storefront experience is built on a small, consistent
foundation rather than ad-hoc per-component styling:

| Concern | Approach |
|---------|----------|
| Type | `next/font` — Syne (display) + Manrope (body) via CSS variables |
| Colour | Tailwind theme overrides `pink-*` to the Sugar magenta so the brand is cohesive everywhere |
| Animation | `motion` (Framer Motion). Reusable primitives: `Reveal`, `StaggerGroup/Item`, page `template.tsx` transitions |
| Reduced motion | `MotionConfig reducedMotion="user"` + a `prefers-reduced-motion` CSS reset |
| Images | `next/image` via `<AppImage>` (AVIF/WebP, lazy, fade-in). Hosts allow-listed in `next.config.ts` (Sanity CDN + media host) |
| Cart UX | Animated slide-in `CartDrawer` (opens on add-to-bag) with `AnimatePresence` line transitions |
| Performance | `lighthouse-budget.json` resource/timing budgets; videos `preload` lazily; `@sanity/client` kept out of client bundles |

Motion components are isolated client components; pages and content blocks stay
server-rendered and pass data through to them.
