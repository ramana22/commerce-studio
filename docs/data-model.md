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
| Shipping options (Standard ₹49, Express ₹99) | Customer delivery choices |
| Manual payment provider (`pp_system_default`) | Completes checkout without a gateway |
| Tax region (India) | Tax calculation |

Real payments (Razorpay) and GST replace the manual provider in Phase 9.

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
- **Prices** are stored in paise (INR × 100) on import, so every Medusa amount
  is divided by 100 for display (`lib/medusa/money.ts`).
- **Validation** of checkout input reuses `@sugar-store/validators/checkout`.

## Shared Types (`packages/types`)

TypeScript types are inferred from Zod schemas in `packages/validators` — one
definition serves the import scripts, the API client, and the storefront.
