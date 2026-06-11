#!/usr/bin/env node
/**
 * Register TTG Season 1 canonical tazos.
 *
 * Idempotent behavior:
 * - creates missing Season 1 collections
 * - upserts each tazo by franchise+slug
 * - leaves publishStatus as pending_review unless --publish-ready is passed and art exists
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();
const PROJECT = path.resolve(__dirname, "..", "..");
const DATA_PATH = path.join(__dirname, "season1-tazos.json");
const PUBLISH_READY = process.argv.includes("--publish-ready");

const COLLECTIONS = {
  minimon: {
    name: "Minimon Season 1",
    description: "Encuentra la chispa. Despierta el linaje. Protege Luminara.",
  },
  dracobell: {
    name: "Dracobell Season 1",
    description: "Siente la resonancia. Rompe tus límites. Haz sonar Bellora.",
  },
  cybermon: {
    name: "Cybermon Season 1",
    description: "Sincroniza el núcleo. Rompe el error. Despierta el protocolo.",
  },
};

function artExists(imageUrl) {
  if (!imageUrl) return false;
  return fs.existsSync(path.join(PROJECT, "public", imageUrl.replace(/^\//, "")));
}

async function ensureCollection(franchise) {
  const f = await prisma.franchise.findUnique({ where: { slug: franchise } });
  if (!f) throw new Error(`Missing franchise: ${franchise}`);
  const slug = `${franchise}-season-1`;
  const spec = COLLECTIONS[franchise];
  return prisma.collection.upsert({
    where: { slug },
    update: {
      name: spec.name,
      totalTazos: 50,
      description: spec.description,
      manufacturer: "Trading Tazos Game",
      country: "Global",
      franchiseId: f.id,
    },
    create: {
      slug,
      name: spec.name,
      totalTazos: 50,
      description: spec.description,
      manufacturer: "Trading Tazos Game",
      country: "Global",
      franchiseId: f.id,
      year: 2026,
    },
  });
}

async function main() {
  if (!fs.existsSync(DATA_PATH)) {
    throw new Error(`Missing ${DATA_PATH}. Run scripts/season1/build-season1.py first.`);
  }
  const tazos = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  const franchises = await prisma.franchise.findMany();
  const franchiseBySlug = Object.fromEntries(franchises.map((f) => [f.slug, f]));
  const collectionBySlug = {};

  for (const slug of ["minimon", "dracobell", "cybermon"]) {
    collectionBySlug[`${slug}-season-1`] = await ensureCollection(slug);
  }

  let created = 0;
  let updated = 0;
  let ready = 0;
  let pending = 0;

  for (const t of tazos) {
    const franchise = franchiseBySlug[t.franchise];
    if (!franchise) throw new Error(`Unknown franchise ${t.franchise} for ${t.number}`);
    const collection = collectionBySlug[t.collectionSlug];
    if (!collection) throw new Error(`Unknown collection ${t.collectionSlug} for ${t.number}`);
    const existing = await prisma.tazo.findFirst({
      where: { slug: t.slug, franchiseId: franchise.id },
    });
    const hasArt = artExists(t.imageUrl);
    const publishStatus = PUBLISH_READY && hasArt ? "published" : "pending_review";
    if (publishStatus === "published") ready += 1;
    else pending += 1;

    const data = {
      name: t.name,
      displayName: t.displayName,
      number: t.number,
      collectionId: collection.id,
      rarity: t.rarity,
      role: t.role,
      category: t.category,
      imageUrl: t.imageUrl,
      backImageUrl: t.backImageUrl,
      condition: "mint",
      physicalType: "cardboard",
      sourceStatus: hasArt ? "verified" : "pending_visual_check",
      publishStatus,
      combatType: t.combatType,
      skill: t.skill,
      skillDesc: t.skillDesc,
      evolutionFrom: t.evolutionFrom || null,
      evolutionTo: t.evolutionTo || null,
      transformStage: t.transformStage ? String(t.transformStage) : null,
      transformOf: t.transformOf || null,
      attack: t.attack,
      defense: t.defense,
      resistance: t.resistance,
      weight: t.weight,
      stability: t.stability,
      spin: t.spin,
      control: t.control,
      bounce: t.bounce,
      precision: t.precision,
    };

    if (existing) {
      await prisma.tazo.update({ where: { id: existing.id }, data });
      updated += 1;
    } else {
      await prisma.tazo.create({
        data: {
          ...data,
          slug: t.slug,
          franchiseId: franchise.id,
        },
      });
      created += 1;
    }
  }

  console.log(`OK Season 1 registered: created=${created} updated=${updated}`);
  console.log(`publishStatus: published=${ready} pending_review=${pending}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
