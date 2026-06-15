#!/bin/bash
# ============================================================
# Trading Tazos Game — Deploy Script
# VPS: rpgvps (76.13.37.123)
#
# Preserves live DB — does NOT reset user data on deploy.
# Only copies seed DB on first-ever deploy.
# ============================================================
set -e

APP_DIR="/home/smouj/apps/ttg/Trading-Tazos-Game"
SRC_DB="$APP_DIR/prisma/dev.db"
STANDALONE_DIR="$APP_DIR/.next/standalone"
STANDALONE_DB="$STANDALONE_DIR/prisma/dev.db"

echo "═══════════════════════════════════════"
echo " TTG Deploy v2 — DB-safe"
echo "═══════════════════════════════════════"

# 1. Stop PM2
echo "▶ Stopping PM2…"
pm2 stop ttg
sleep 2

# 2. Checkpoint WAL on BOTH DBs
echo "▶ WAL checkpoint…"
sqlite3 "$SRC_DB" 'PRAGMA wal_checkpoint(TRUNCATE);' 2>/dev/null || true
if [ -f "$STANDALONE_DB" ]; then
  sqlite3 "$STANDALONE_DB" 'PRAGMA wal_checkpoint(TRUNCATE);' 2>/dev/null || true
fi

# 3. Copy seed DB ONLY if standalone doesn't exist (first deploy)
if [ ! -f "$STANDALONE_DB" ]; then
  echo "▶ First deploy — creating standalone DB from seed…"
  mkdir -p "$STANDALONE_DIR/prisma"
  cp "$SRC_DB" "$STANDALONE_DB"
  echo "  Seed DB copied."
else
  echo "▶ Live DB found — PRESERVING user data (not overwriting)."
  echo "  Users: $(sqlite3 "$STANDALONE_DB" 'SELECT count(*) FROM User;')"
  echo "  UserTazos: $(sqlite3 "$STANDALONE_DB" 'SELECT count(*) FROM UserTazo;')"
  echo "  Instances: $(sqlite3 "$STANDALONE_DB" 'SELECT count(*) FROM TazoInstance;')"
fi

# 4. Sync standalone assets
echo "▶ Syncing static assets…"
cp -r "$APP_DIR/.next/static" "$STANDALONE_DIR/.next/static"
cp -r "$APP_DIR/public" "$STANDALONE_DIR/public" 2>/dev/null || true
echo "  Assets synced."

# 5. Run DB backup (safety net)
echo "▶ Backing up live DB…"
BACKUP_DIR="$APP_DIR/backups"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/ttg-$(date +%Y%m%d-%H%M%S).db"
sqlite3 "$STANDALONE_DB" ".backup '$BACKUP_FILE'"
echo "  Backup: $BACKUP_FILE"

# 6. Keep only last 20 backups
cd "$BACKUP_DIR" && ls -t ttg-*.db 2>/dev/null | tail -n +21 | xargs rm -f 2>/dev/null || true

# 7. Sync
sync

# 8. Restart PM2
echo "▶ Restarting PM2…"
pm2 restart ttg
sleep 5

# 9. Verify
echo ""
echo "▶ Verification:"
pm2 status | grep ttg
curl -sI -o /dev/null -w "  /api/health: %{http_code}
" https://tradingtazosgame.com/api/health

echo ""
echo "═══════════════════════════════════════"
echo " Deploy complete — live data preserved"
echo "═══════════════════════════════════════"
