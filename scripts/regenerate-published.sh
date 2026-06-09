#!/bin/bash
# Regenerate all 30 published tazo composites with no dark ring
cd /home/smouj/.openclaw/workspace/Trading-Tazos-Game

# Get published tazos from DB
readarray -t TAZOS < <(sqlite3 prisma/dev.db "
  SELECT f.slug || '/' || t.slug
  FROM Tazo t JOIN Franchise f ON t.franchiseId = f.id
  WHERE t.publishStatus = 'published'
  ORDER BY f.slug, t.number
")

TOTAL=${#TAZOS[@]}
echo "Regenerating $TOTAL published tazos..."

for i in "${!TAZOS[@]}"; do
  fs="${TAZOS[$i]%%/*}"
  slug="${TAZOS[$i]##*/}"
  python3 scripts/generate-tazo-art.py --force "--franchise=$fs" "--slug=$slug" 2>&1 | tail -1
  echo "  $((i+1))/$TOTAL $fs/$slug"
done

echo "Done! $TOTAL tazos regenerated."
