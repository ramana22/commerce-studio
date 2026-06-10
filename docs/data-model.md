# Data Model

> Describes the core entities and how they map between Medusa, Sanity, and the storefront.
> Populated progressively through Phases 2–6.

## Medusa Entities

- **Product** — title, handle, status, metadata (badges, shade_hex, hover_media_url, review_count)
- **ProductVariant** — SKU, price, inventory, shade name
- **ProductCollection** — maps to navigation categories (LIPS, EYES, FACE, etc.)
- **Order** — cart → payment → fulfillment lifecycle

## Sanity Schemas (Phase 6)

Schemas live in `apps/cms/schemaTypes`, grouped into reusable objects, homepage
blocks, and documents.

### Objects (reusable)

- **cta** — label + link + style (primary / secondary / text)
- **seo** — meta title, description, social share image
- **productRef** — links a placement to a Medusa product by `handle`
- **responsiveVideo** — desktop MP4 + optional mobile MP4 + required poster

### Homepage blocks

Composed in any order inside `homepage.blocks`:

- **heroVideo** — full-bleed background video with overlaid copy + CTA
- **categoryTiles** — grid of image tiles linking to categories
- **productCarousel** — rail sourced from a hand-picked list, a category, bestsellers, or new launches
- **reelCarousel** — Instagram-style vertical videos, each optionally shoppable
- **offerBanner** — promo strip with optional background image + countdown

### Documents

- **homepage** *(singleton)* — `blocks[]` + SEO
- **announcementBar** *(singleton)* — rotating messages, interval, colours
- **categoryBanner** — per-category hero (image or video); one per Medusa category handle
- **cartUpsells** *(singleton)* — "LIMITED TIME BONUS" product rail for the cart drawer

### Medusa linkage

Sanity and Medusa are separate systems. Merchandised products are referenced by
the stable Medusa **handle** (via `productRef` / `categoryHandle`); the
storefront resolves live product data (price, stock, media) at request time.
Singletons are pinned to a fixed document id and locked down in
`sanity.config.ts` (no create / duplicate / delete).

## Money Path (Phase 5)

The cart → checkout → order flow lives in the storefront's `lib/` layer and is
backed by the resources created in `apps/backend/src/scripts/seed.ts`.

### Backend prerequisites (seeded)

| Resource | Purpose |
|----------|---------|
| Sales channel | Scopes the storefront's products and publishable key |
| Publishable API key | Authorizes Store API requests from the storefront |
| Stock location + manual fulfillment provider | Allows fulfillment of orders |
| Shipping profile + fulfillment set + service zone | Where/how items ship |
| Shipping options (Standard $5.99, Express $14.99) | Customer delivery choices |
| Manual payment provider (`pp_system_default`) | Completes checkout without a gateway |
| Tax region (US sales tax, tax-exclusive) | Tax calculation |

Real payments (Square) replace the manual provider in Phase 9.

### Storefront flow

```
add to bag ─▶ POST /store/carts (create) ─▶ cart cookie (_sugar_cart_id)
                     │
                     ├─ createLineItem / updateLineItem / deleteLineItem
                     ▼
checkout ─▶ cart.update (email + addresses)
         ─▶ addShippingMethod (selected option)
         ─▶ initiatePaymentSession (manual)
         ─▶ cart.complete ─▶ Order ─▶ /order/confirmed/[id]
```

- **Cart id** is held in an httpOnly cookie; reads happen in server components
  (`lib/cart/cart-service.ts`), mutations in server actions (`lib/cart/actions.ts`).
- **Prices** are stored in cents (USD × 100) on import, so every Medusa amount
  is divided by 100 for display (`lib/medusa/money.ts`).
- **Validation** of checkout input reuses `@sugar-store/validators/checkout`.

## Storefront Rendering (Phase 7)

The storefront composes each page from two sources: **Sanity** for editorial
content/layout and **Medusa** for live commerce data.

```
Homepage      Sanity homepage.blocks ─▶ BlockRenderer
                 productCarousel ─┬─ manual      ─▶ Medusa by handle
                                  ├─ category    ─▶ Medusa by category
                                  └─ bestsellers/new ─▶ Medusa + metadata filter

Category /[slug]   slug == Medusa handle
                   Sanity categoryBanner (hero)  +  Medusa products (grid)

Product /products/[handle]   Medusa product ─▶ ProductDetail (shades, gallery, price)

Announcement bar   Sanity announcementBar (rotating, client-side)
```

Key modules:

- `lib/sanity/` — CDN client, GROQ queries, typed results, image URL builder.
  `sanityFetch` returns `null` (and the UI degrades) when Sanity is unconfigured.
- `lib/catalog/` — Medusa product service + mappers (`ProductCard`, `ProductDetail`),
  and `nav.ts` (the slug ⇄ handle ⇄ label map).
- `lib/media/url.ts` — prefixes catalog image paths with the public media base.
- Sanity links products by **handle**; the storefront resolves live price/stock
  at request time, so content and commerce stay decoupled.

Pages render dynamically (the layout reads the cart cookie); Sanity reads are
ISR-revalidated (60s). Image optimization with `next/image` and motion land in
Phase 8.

## Shared Types (`packages/types`)

TypeScript types are inferred from Zod schemas in `packages/validators` — one
definition serves the import scripts, the API client, and the storefront.
