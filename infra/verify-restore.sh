#!/usr/bin/env bash
# Prove the nightly backup is actually restorable (Phase 10 "restore test").
#
# Pulls the latest dump from R2, restores it into a throwaway database, runs a
# couple of sanity queries, then drops the throwaway db. Read-only against your
# real data — it never touches the production database.
#
# Requires: rclone (R2 remote named 'r2'), psql, and a Postgres admin URL with
# CREATE/DROP DATABASE rights.
#
# Usage:
#   CLOUDFLARE_R2_BUCKET_NAME=sugar-store-media \
#   ADMIN_DATABASE_URL=postgres://user:pass@host:5432/postgres \
#     ./infra/verify-restore.sh
set -euo pipefail

: "${CLOUDFLARE_R2_BUCKET_NAME:?Set CLOUDFLARE_R2_BUCKET_NAME}"
: "${ADMIN_DATABASE_URL:?Set ADMIN_DATABASE_URL (a postgres URL with CREATE DATABASE rights)}"

WORK="$(mktemp -d)"
TESTDB="restore_test_$(date +%s)"
BASE="${ADMIN_DATABASE_URL%/*}" # strip the trailing /<dbname>
cleanup() { rm -rf "${WORK}"; }
trap cleanup EXIT

echo "[verify] Finding the latest backup in R2…"
LATEST="$(rclone lsf "r2:${CLOUDFLARE_R2_BUCKET_NAME}/backups/" | sort | tail -1)"
[ -n "${LATEST}" ] || { echo "[verify] No backups found under backups/"; exit 1; }
echo "[verify] Latest backup: ${LATEST}"

rclone copyto "r2:${CLOUDFLARE_R2_BUCKET_NAME}/backups/${LATEST}" "${WORK}/${LATEST}"

echo "[verify] Creating throwaway database ${TESTDB}…"
psql "${ADMIN_DATABASE_URL}" -v ON_ERROR_STOP=1 -c "CREATE DATABASE ${TESTDB};"

# Always drop the throwaway db, even if the restore/queries fail.
drop_db() { psql "${ADMIN_DATABASE_URL}" -c "DROP DATABASE IF EXISTS ${TESTDB};" >/dev/null 2>&1 || true; }
trap 'drop_db; cleanup' EXIT

echo "[verify] Restoring into ${TESTDB}…"
gunzip -c "${WORK}/${LATEST}" | psql "${BASE}/${TESTDB}" -v ON_ERROR_STOP=1 >/dev/null

echo "[verify] Sanity checks:"
psql "${BASE}/${TESTDB}" -t -c 'SELECT count(*) FROM "order";'   | xargs echo "  orders  :"
psql "${BASE}/${TESTDB}" -t -c 'SELECT count(*) FROM product;'   | xargs echo "  products:"
psql "${BASE}/${TESTDB}" -t -c 'SELECT count(*) FROM customer;'  | xargs echo "  customers:"

echo "[verify] ✅ Backup '${LATEST}' restored and validated successfully."
