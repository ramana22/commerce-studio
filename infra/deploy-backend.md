# Backend Deployment (VPS)

> Runbook for deploying Medusa + Postgres + Redis to a VPS (e.g. DigitalOcean, Hetzner).
> Populated in Phase 9.

## Stack

- Ubuntu 24.04 LTS
- PostgreSQL 16 (managed or self-hosted)
- Redis 7
- Node.js 22 via nvm
- PM2 for process management
- Caddy for TLS termination

## Steps

1. Provision VPS (2 vCPU / 4 GB RAM minimum)
2. Install Postgres + Redis via docker-compose or managed service
3. Set environment variables (see `../.env.example`)
4. Run `pnpm build` inside `apps/backend`
5. Start with PM2: `pm2 start dist/index.js --name medusa`
6. Configure Caddy reverse proxy to port 9000
7. Run initial seed: `pnpm seed`
8. Set up nightly backup (see `backup.sh`)
