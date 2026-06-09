#!/usr/bin/env node
/**
 * Register all tazo definitions from all-tazos.json into the database.
 * - Skips existing tazos (by slug+franchise)
 * - Sets initial status to 'pending_review' (not published — wait for art)
 * - Generates imageUrl path for future art composite
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  const dataPath = path.join(__dirname, 'all-tazos.json');
  if (!fs.existsSync(dataPath)) {
    console.error('❌ all-tazos.json not found. Run: python3 scripts/generate-tazo-data.py');
    process.exit(1);
  }

  const tazos = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`📦 Loading ${tazos.length} tazo definitions...`);

  // Get franchise/collection mappings from DB
  const franchises = await prisma.franchise.findMany({
    include: { collections: true },
  });
  const franchiseMap = {};
  const collectionMap = {};
  for (const f of franchises) {
    franchiseMap[f.slug] = f.id;
    if (f.collections.length > 0) {
      collectionMap[f.slug] = f.collections[0].id;
    }
  }
  console.log('  Franchises:', Object.keys(franchiseMap).join(', '));

  let created = 0, skipped = 0, errors = 0;

  for (const t of tazos) {
    const franchiseId = franchiseMap[t.franchise];
    const collectionId = collectionMap[t.franchise];

    if (!franchiseId) {
      console.error(`  ❌ Unknown franchise: ${t.franchise}`);
      errors++;
      continue;
    }

    // Check for existing
    const existing = await prisma.tazo.findFirst({
      where: { slug: t.slug, franchiseId },
    });

    if (existing) {
      skipped++;
      // Update stats if needed (don't touch existing art/publish status)
      if (process.argv.includes('--update-stats')) {
        await prisma.tazo.update({
          where: { id: existing.id },
          data: {
            rarity: existing.rarity || t.rarity,
            role: existing.role || t.role,
            ...(t.skill && !existing.skill ? { skill: t.skill, skillDesc: t.skillDesc } : {}),
          },
        });
      }
      continue;
    }

    const imageUrl = `/tazos-generated/${t.franchise}/${t.slug}.png`;

    try {
      await prisma.tazo.create({
        data: {
          name: t.name,
          displayName: t.displayName || t.name,
          slug: t.slug,
          franchiseId,
          collectionId,
          number: '',
          rarity: t.rarity || 'common',
          role: t.role || 'balanced',
          category: t.category || 'tazos',
          imageUrl,
          condition: 'mint',
          physicalType: 'cardboard',
          sourceStatus: 'pending_visual_check',
          publishStatus: 'pending_review',
          skill: t.skill || '',
          skillDesc: t.skillDesc || '',
          ...t.stats,
        },
      });
      created++;
    } catch (e) {
      console.error(`  ❌ Error creating ${t.slug}: ${e.message}`);
      errors++;
    }

    if (created % 50 === 0) {
      console.log(`  ... ${created} created, ${skipped} skipped`);
    }
  }

  // Count totals
  const counts = await prisma.tazo.groupBy({
    by: ['franchiseId'],
    _count: true,
  });
  const countMap = {};
  for (const c of counts) {
    const fr = franchises.find(f => f.id === c.franchiseId);
    countMap[fr?.slug || c.franchiseId] = c._count;
  }

  console.log(`\n🎴 Registration complete!`);
  console.log(`   Created: ${created} | Skipped: ${skipped} | Errors: ${errors}`);
  console.log(`   DB totals:`);
  for (const [slug, count] of Object.entries(countMap)) {
    console.log(`     ${slug}: ${count}`);
  }
  console.log(`   Total in DB: ${Object.values(countMap).reduce((a,b)=>a+b,0)}`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
