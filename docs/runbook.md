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

## Payments — Square (Phase 9)

Square activates automatically once `SQUARE_ACCESS_TOKEN` + `SQUARE_APPLICATION_ID`
+ `SQUARE_LOCATION_ID` (backend) and `NEXT_PUBLIC_SQUARE_APPLICATION_ID` +
`NEXT_PUBLIC_SQUARE_LOCATION_ID` (storefront) are set, and the region includes the
provider (re-run `pnpm backend:seed` on a fresh DB, or add it in Admin).

```
Checkout → Square Web Payments card form (sandbox test card: 4111 1111 1111 1111)
        → tokenize card → placeSquareOrder (opens session carrying the token)
        → cart.complete → provider creates the Square payment → Order
```

Without Square keys the storefront falls back to the manual test provider.

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
6. Point DNS at Vercel; monitor first live orders in the Square dashboard.

## Instrumentation & Analytics (Phase 10)

### Funnel + Web Vitals (RUM)

The storefront emits funnel events and per-page Core Web Vitals to
`POST /api/analytics`:

- Funnel: `product_viewed` → `add_to_cart` → `checkout_started` → `purchase`.
- Web Vitals: `web_vital` (LCP, CLS, INP, FCP, TTFB) from real sessions.

Every event is logged server-side (greppable with `[analytics]`), so the funnel
is observable even with no provider. To pipe into a dashboard, set
`ANALYTICS_WEBHOOK_URL` to any JSON sink (PostHog capture endpoint, a collector,
etc.) — events are forwarded verbatim.

### Error tracking on the money path

With `SENTRY_DSN` set, errors are captured (not just logged) on:

- Storefront checkout server actions (`placeOrder`, `placeSquareOrder`,
  `completeCart`).
- Backend `order.placed` subscriber (confirmation email + payment capture).
- Square **webhook** path — a failed signature verification is reported as an
  `error`-level event; refund failures are captured with context.

### Daily reconciliation job

`apps/backend/src/jobs/reconcile-orders.ts` runs daily at 02:00 and flags:

- **stuck** orders — older than 1h with no captured payment, and
- **mismatched** orders — captured amount ≠ order total.

Findings are logged (`[reconcile]`) and sent to Sentry so they alert. The job is
read-only. Run it on demand to verify: `npx medusa exec ./src/jobs/reconcile-orders.ts`.

## Backups & Restore (Phase 10)

Backups run nightly via `infra/backup.sh` (`pg_dump` → gzip → R2 `backups/`).

**Restore a specific dump** into a target database:

```bash
TARGET_DATABASE_URL=postgres://user:pass@host:5432/dbname \
  ./infra/restore.sh /path/to/sugar_store_YYYYMMDD_HHMMSS.sql.gz
```

**Prove backups work (do this at least once, then quarterly).** Pulls the latest
R2 dump, restores into a throwaway DB, runs sanity counts, and drops it — never
touching production:

```bash
CLOUDFLARE_R2_BUCKET_NAME=sugar-store-media \
ADMIN_DATABASE_URL=postgres://user:pass@host:5432/postgres \
  ./infra/verify-restore.sh
```

Record the date of the last successful restore test here:

| Date | Backup file | Restored by | Result |
|------|-------------|-------------|--------|
| _TBD_ | _run verify-restore.sh_ | | |
