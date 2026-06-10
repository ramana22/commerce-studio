#!/usr/bin/env bash
# Restore a gzipped pg_dump (produced by infra/backup.sh) into a target database.
#
# Usage:
#   TARGET_DATABASE_URL=postgres://user:pass@host:5432/dbname \
#     ./infra/restore.sh /path/to/sugar_store_YYYYMMDD_HHMMSS.sql.gz
#
# The target database must already exist and be empty (or you accept overwrites).
set -euo pipefail

DUMP="${1:?Usage: restore.sh <dump.sql.gz>}"
TARGET="${TARGET_DATABASE_URL:?Set TARGET_DATABASE_URL to the database to restore into}"

[ -f "${DUMP}" ] || { echo "[restore] File not found: ${DUMP}"; exit 1; }

echo "[restore] Restoring ${DUMP} → ${TARGET%%\?*}"
gunzip -c "${DUMP}" | psql "${TARGET}" >/dev/null
echo "[restore] Done."
