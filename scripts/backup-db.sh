#!/bin/bash
# TTG SQLite Backup — daily rotation, keeps 7 days
set -e
DB="/home/smouj/apps/ttg/Trading-Tazos-Game/prisma/dev.db"
BACKUP_DIR="/home/smouj/backups/ttg"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d-%H%M)
cp "$DB" "$BACKUP_DIR/dev.db.$TIMESTAMP"
find "$BACKUP_DIR" -name "dev.db.*" -mtime +7 -delete
echo "$(date -Iseconds) backup OK: dev.db.$TIMESTAMP ($(stat -c%s $BACKUP_DIR/dev.db.$TIMESTAMP) bytes)"
