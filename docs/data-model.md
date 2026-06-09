# Data Model

> Describes the core entities and how they map between Medusa, Sanity, and the storefront.
> Populated progressively through Phases 2–6.

## Medusa Entities

- **Product** — title, handle, status, metadata (badges, shade_hex, hover_media_url, review_count)
- **ProductVariant** — SKU, price, inventory, shade name
- **ProductCollection** — maps to navigation categories (LIPS, EYES, FACE, etc.)
- **Order** — cart → payment → fulfillment lifecycle

## Sanity Documents

- **Homepage** — array of block references (heroVideo, categoryTiles, productCarousel, …)
- **AnnouncementBar** — rotating messages with CTA
- **CategoryBanner** — per-collection hero image/video
- **CartUpsells** — products shown in cart drawer "LIMITED TIME BONUS" rail

## Shared Types (`packages/types`)

TypeScript types are inferred from Zod schemas in `packages/validators` — one
definition serves the import scripts, the API client, and the storefront.
