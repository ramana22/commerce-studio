# Storefront Deployment (Vercel)

The Next.js storefront deploys to Vercel from this monorepo.

## Project settings

| Setting | Value |
|---------|-------|
| Root Directory | `apps/storefront` |
| Framework Preset | Next.js |
| Install Command | `pnpm install` (run at repo root automatically) |
| Build Command | `pnpm redirects:build && next build` |
| Node.js Version | 22.x |

> The custom build command regenerates the Shopify→storefront redirect map from
> `data/shopify-redirects.csv` before building. If you don't commit that CSV,
> only the structural redirects (`/collections/*` → `/*`) are emitted.

## Environment variables

Set these in the Vercel project (Production + Preview):

| Variable | Purpose |
|----------|---------|
| `MEDUSA_BACKEND_URL` / `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | Backend API URL |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | From `pnpm backend:seed` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | Sanity content |
| `NEXT_PUBLIC_MEDIA_BASE_URL` | R2 public media domain |
| `NEXT_PUBLIC_SQUARE_APPLICATION_ID`, `NEXT_PUBLIC_SQUARE_LOCATION_ID` | Enables the Square card form |
| `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN` | Error monitoring |

## Image hosts

`next.config.ts` allow-lists `cdn.sanity.io`, `media.sugarcosmetics.com`, and the
host parsed from `NEXT_PUBLIC_MEDIA_BASE_URL`. Add any additional CDN domains there.

## Health check

`GET /api/health` returns `{ "status": "ok" }` for uptime monitors.

## Cutover (DNS)

1. Deploy the backend and storefront; verify checkout end-to-end on a preview URL.
2. Generate the redirect map from the real Shopify export
   (`data/shopify-redirects.csv` → `pnpm redirects:build`) and redeploy.
3. Point the apex/`www` DNS at Vercel.
4. Watch Sentry and the Square dashboard for the first live orders.
