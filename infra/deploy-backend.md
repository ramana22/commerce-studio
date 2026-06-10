# Backend Deployment (Medusa)

Runbook for deploying the Medusa backend (API + Postgres + Redis) to a VPS.
The storefront deploys separately to Vercel (see `deploy-storefront.md`).

## Stack

- Ubuntu 24.04 LTS, 2 vCPU / 4 GB RAM minimum
- PostgreSQL 16, Redis 7
- Node.js 22 (only needed for the PM2 path)
- TLS via Caddy (automatic certificates)

## Option A — Docker Compose (recommended)

```bash
# On the server, with the repo checked out and .env filled in:
docker compose -f infra/docker-compose.prod.yml up -d --build

# First-time data setup (run once):
docker compose -f infra/docker-compose.prod.yml exec backend npx medusa exec ./src/scripts/seed.ts
docker compose -f infra/docker-compose.prod.yml exec backend npx medusa user \
  -e admin@sugar-store.com -p '<strong-password>'
```

- `infra/Dockerfile.backend` builds the Medusa server (`medusa build`).
- The container runs `medusa db:migrate` on start, then `medusa start`.
- Caddy terminates TLS and proxies to the backend (edit `infra/Caddyfile`
  with your API domain).

## Option B — PM2 (no Docker)

```bash
# Provision Postgres + Redis (managed or self-hosted), set DATABASE_URL / REDIS_URL.
pnpm install
pnpm --filter @sugar-store/backend build
pnpm --filter @sugar-store/backend exec medusa db:migrate
pnpm backend:seed

pm2 start infra/ecosystem.config.js
pm2 save && pm2 startup
# Put Caddy or Nginx in front, proxying 443 → 9000.
```

## Required environment

Set everything from `../.env.example`. Production essentials:

| Variable | Notes |
|----------|-------|
| `DATABASE_URL`, `REDIS_URL` | Connection strings |
| `JWT_SECRET`, `COOKIE_SECRET` | Long random values (`openssl rand -hex 32`) |
| `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS` | Production origins |
| `SQUARE_ACCESS_TOKEN`, `SQUARE_APPLICATION_ID`, `SQUARE_LOCATION_ID` | Enables the Square provider |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | If webhooks are enabled |
| `SENTRY_DSN` | Backend error monitoring |

## Square webhook (optional but recommended)

Create a webhook in the Square dashboard pointing to:

```
https://<api-domain>/hooks/payment/square_square
```

Subscribe to `payment.captured`, `payment.authorized`, `payment.failed` and set
the signing secret as `RAZORPAY_WEBHOOK_SECRET`.

## Backups

`backup.sh` does a nightly `pg_dump` → R2. Schedule via cron:

```bash
0 2 * * * /path/to/infra/backup.sh >> /var/log/sugar-backup.log 2>&1
```
