# Runbook

> Operational procedures for common tasks. Populated as phases are completed.

## Local Development

```bash
# Start infrastructure
docker-compose up -d

# Install dependencies
pnpm install

# Start all apps
pnpm dev
```

## Catalog Import (Phase 2+)

```bash
# Validate the spreadsheet
pnpm --filter catalog-import validate

# Run the import (idempotent)
pnpm --filter catalog-import import
```

## Media Pipeline (Phase 3+)

```bash
# Process raw assets → optimized + R2 upload
pnpm --filter media-pipeline process
```

## Database Backup / Restore

```bash
# Manual backup
./infra/backup.sh

# Restore
gunzip -c backup.sql.gz | psql $DATABASE_URL
```

## Shopify Redirects (Phase 9)

```bash
# 1. Export Shopify URL redirects (Online Store → Navigation → URL Redirects → Export)
#    and save the CSV to data/shopify-redirects.csv. Or scaffold a sample:
pnpm redirects:sample

# 2. Generate the Next.js redirect map (also runs in the Vercel build command)
pnpm redirects:build   # → apps/storefront/redirects.generated.json
```

Structural redirects (`/collections/:slug` → `/:slug`, `/pages/:slug` → `/:slug`)
are always emitted; explicit CSV rows take precedence.

## Payments — Razorpay (Phase 9)

Razorpay activates automatically once `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET`
(backend) and `NEXT_PUBLIC_RAZORPAY_KEY_ID` (storefront) are set, and the region
includes the provider (re-run `pnpm backend:seed` on a fresh DB, or add it in Admin).

```
Checkout → startRazorpayPayment (creates Razorpay order)
        → Razorpay Checkout modal (test card: 4111 1111 1111 1111)
        → finalizeOrder → cart.complete → provider verifies capture → Order
```

Without Razorpay keys the storefront falls back to the manual test provider.

## Monitoring (Phase 9)

- Backend: set `SENTRY_DSN` — initialized in `medusa-config.js` at startup.
- Storefront: set `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` — the server
  `instrumentation.ts` hook reports server + edge errors. (Client RUM is left
  off to protect the bundle budget; enable later if needed.)
- Health checks: storefront `GET /api/health`; backend `GET /health`.

## Production Deploy

- Backend: `infra/deploy-backend.md` (Docker Compose or PM2 + Caddy).
- Storefront: `infra/deploy-storefront.md` (Vercel).

### Cutover checklist

1. Backend deployed, migrated, seeded; admin user created.
2. Catalog imported (`pnpm catalog:import`) and media uploaded.
3. Storefront env vars set; checkout verified on a preview URL.
4. `data/shopify-redirects.csv` in place; `pnpm redirects:build` run.
5. Sentry receiving events; backups scheduled.
6. Point DNS at Vercel; monitor first live orders in the Razorpay dashboard.
