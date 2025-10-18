#!/usr/bin/env bash
set -euo pipefail
# backup_lspp.sh - copy and gzip the SQLite DB to exports and optionally upload to S3

OUT_DIR="server/exports/backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUT_DIR"
cp server/lspp.db "$OUT_DIR/"
gzip -9 "$OUT_DIR/lspp.db"

# Optional: upload to S3 if AWS CLI configured and BUCKET env var set
if [[ -n "${BUCKET:-}" ]]; then
  aws s3 cp "$OUT_DIR/lspp.db.gz" "s3://${BUCKET}/lspp-backups/" --acl private
fi

echo "Backup written to $OUT_DIR"
