#!/usr/bin/env bash
# Nightly pg_dump → Cloudflare R2
# Cron: 0 2 * * * /path/to/infra/backup.sh >> /var/log/sugar-backup.log 2>&1
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/tmp/sugar_store_${TIMESTAMP}.sql.gz"

echo "[backup] Starting dump at ${TIMESTAMP}"
pg_dump "${DATABASE_URL}" | gzip > "${BACKUP_FILE}"

echo "[backup] Uploading to R2..."
# Requires rclone configured with R2 remote named 'r2'
rclone copy "${BACKUP_FILE}" "r2:${CLOUDFLARE_R2_BUCKET_NAME}/backups/"

rm -f "${BACKUP_FILE}"
echo "[backup] Done."
