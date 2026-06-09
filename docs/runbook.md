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
