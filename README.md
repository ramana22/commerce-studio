# Sugar Store

A high-performance, animated e-commerce monorepo for Sugar Cosmetics built on Next.js 15, Medusa 2, and Sanity v3.

## Stack

| Layer | Technology |
|-------|-----------|
| Storefront | Next.js 15 (App Router) · Tailwind CSS · Motion |
| Backend | Medusa 2.x |
| CMS | Sanity Studio v3 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Media | Cloudflare R2 |
| Package manager | pnpm workspaces |
| Build orchestration | Turbo |

## Prerequisites

- Node.js ≥ 22
- pnpm ≥ 10
- Docker + Docker Compose

## Setup

### 1. Clone and install

```bash
git clone <repo-url> sugar-store
cd sugar-store
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Open .env and fill in DATABASE_URL, REDIS_URL, and the secrets
```

### 3. Start infrastructure

```bash
docker-compose up -d
# PostgreSQL → localhost:5432
# Redis      → localhost:6379
```

### 4. Verify the skeleton

```bash
pnpm typecheck   # TypeScript across all packages
pnpm lint        # ESLint across all packages
```

### 5. Start development

```bash
pnpm dev   # starts all apps via Turbo in parallel
```

Or run a single app:

```bash
cd apps/storefront && pnpm dev   # localhost:3000
cd apps/backend    && pnpm dev   # localhost:9000
cd apps/cms        && pnpm dev   # localhost:3333
```

## Workspace Layout

```
apps/
  storefront/         Next.js customer-facing store
  backend/            Medusa commerce API
  cms/                Sanity Studio content management

packages/
  config/             Shared ESLint · TypeScript · Prettier configs
  types/              Shared TypeScript types (inferred from validators)
  validators/         Shared Zod schemas — single source of truth

scripts/
  catalog-import/     Excel → Medusa product import (Phase 2)
  media-pipeline/     Image / video processing + R2 upload (Phase 3)
  shopify-redirects/  Build 301 redirect map from Shopify export (Phase 9)

data/                 Gitignored — raw catalog, media assets
infra/                Deployment and backup docs
docs/                 Architecture, data model, runbooks
```

## Root Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in watch mode |
| `pnpm build` | Production build across all apps |
| `pnpm lint` | ESLint across all packages |
| `pnpm typecheck` | TypeScript check across all packages |
| `pnpm format` | Prettier format all files |

## Build Phases

| Phase | Scope |
|-------|-------|
| **1** | Monorepo skeleton (this phase) |
| **2** | Validators + Excel catalog validation |
| **3** | Media pipeline (resize, AVIF/WebP, R2 upload) |
| **4** | Medusa backend + idempotent product import |
| **5** | Money path — cart → checkout → order |
| **6** | Sanity CMS block schemas |
| **7** | Storefront with real data |
| **8** | Extraordinary UI layer (Motion, Lighthouse budgets) |
| **9** | Hardening + cutover (real payments, sales tax, monitoring) |
