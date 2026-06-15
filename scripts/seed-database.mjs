#!/usr/bin/env node
/**
 * scripts/seed-database.mjs
 * Hydrates ALL model tables with production-ready defaults.
 * Safe — skips if data already exists.
 * 
 * Usage: node scripts/seed-database.mjs
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// ═══════════════════════════════════════════
// BAG MODELS — matches shop DEFAULT_BAGS + /api/bag-models
// ═══════════════════════════════════════════
const BAG_MODELS = [
  {
    name: "Classic Bag",
    frontUrl: "/textures/bags/minimon/bag-minimon-front-01.png",
    backUrl: "/textures/bags/minimon/bag-minimon-back-01.png",
    franchise: "minimon",
    cost: 100,
    bonusChance: 15,
    rareBoost: 2,
    color: "#FFCC00",
    bgColor: "#FFF8E7",
    tagline: "Classic minimon collection bag — 100 credits",
    sortOrder: 0,
    isActive: true,
  },
  {
    name: "Premium Bag",
    frontUrl: "/textures/bags/cybermon/bag-cybermon-front-01.png",
    backUrl: "/textures/bags/cybermon/bag-cybermon-back-01.png",
    franchise: "cybermon",
    cost: 100,
    bonusChance: 15,
    rareBoost: 2,
    color: "#00B4D8",
    bgColor: "#E0F7FA",
    tagline: "Elite cybermon collection bag — 100 credits",
    sortOrder: 1,
    isActive: true,
  },
  {
    name: "Mega Bag",
    frontUrl: "/textures/bags/dracobell/bag-dracobell-front-01.png",
    backUrl: "/textures/bags/dracobell/bag-dracobell-back-01.png",
    franchise: "dracobell",
    cost: 100,
    bonusChance: 15,
    rareBoost: 2,
    color: "#FF6B00",
    bgColor: "#FFF3E6",
    tagline: "Mega dracobell collection bag — 100 credits",
    sortOrder: 2,
    isActive: true,
  },
]

// ═══════════════════════════════════════════
// CREDIT PACKAGES — Stripe store
// ═══════════════════════════════════════════
const CREDIT_PACKAGES = [
  {
    name: "Starter Pack",
    credits: 500,
    priceCents: 199,
    bonusPct: 0,
    isPopular: false,
    sortOrder: 0,
    isActive: true,
  },
  {
    name: "Collector Pack",
    credits: 1500,
    priceCents: 499,
    bonusPct: 10,
    isPopular: true,
    sortOrder: 1,
    isActive: true,
  },
  {
    name: "Mega Pack",
    credits: 5000,
    priceCents: 999,
    bonusPct: 25,
    isPopular: false,
    sortOrder: 2,
    isActive: true,
  },
  {
    name: "Ultimate Pack",
    credits: 15000,
    priceCents: 2499,
    bonusPct: 50,
    isPopular: false,
    sortOrder: 3,
    isActive: true,
  },
]

// ═══════════════════════════════════════════
// PROMOTION CODES — launch + evergreen
// ═══════════════════════════════════════════
const PROMOTION_CODES = [
  {
    code: "WELCOME100",
    description: "Welcome bonus for new players — 100 free credits",
    type: "credits",
    value: 100,
    maxUses: 0, // unlimited
    usedCount: 0,
    isActive: true,
  },
  {
    code: "TTGLAUNCH",
    description: "Launch special — 500 credits",
    type: "credits",
    value: 500,
    maxUses: 1000,
    usedCount: 0,
    isActive: true,
  },
  {
    code: "FREEBAG",
    description: "One free classic bag",
    type: "bag",
    value: 1, // 1 bag of type "classic"
    maxUses: 500,
    usedCount: 0,
    isActive: true,
  },
]

// ═══════════════════════════════════════════
// SITE CONFIG — operational toggles
// ═══════════════════════════════════════════
const SITE_CONFIG = [
  {
    key: "maintenance_mode",
    value: JSON.stringify(false),
    updatedBy: "system",
  },
  {
    key: "welcome_credits",
    value: JSON.stringify(100),
    updatedBy: "system",
  },
  {
    key: "max_tazos_per_user",
    value: JSON.stringify(200),
    updatedBy: "system",
  },
  {
    key: "adsense_enabled",
    value: JSON.stringify(false),
    updatedBy: "system",
  },
  {
    key: "stripe_enabled",
    value: JSON.stringify(false),
    updatedBy: "system",
  },
]

async function main() {
  console.log("🌱 Seeding all model tables...\n")

  // ── BagModel ──
  const existingBags = await prisma.bagModel.count()
  if (existingBags > 0) {
    console.log(`⚠️  ${existingBags} BagModel(s) exist — skipping`)
  } else {
    for (const bag of BAG_MODELS) {
      await prisma.bagModel.create({ data: bag })
    }
    console.log(`✅ Seeded ${BAG_MODELS.length} BagModels`)
  }

  // ── CreditPackage ──
  const existingCredits = await prisma.creditPackage.count()
  if (existingCredits > 0) {
    console.log(`⚠️  ${existingCredits} CreditPackage(s) exist — skipping`)
  } else {
    for (const cp of CREDIT_PACKAGES) {
      await prisma.creditPackage.create({ data: cp })
    }
    console.log(`✅ Seeded ${CREDIT_PACKAGES.length} CreditPackages`)
  }

  // ── PromotionCode ──
  const existingPromos = await prisma.promotionCode.count()
  if (existingPromos > 0) {
    console.log(`⚠️  ${existingPromos} PromotionCode(s) exist — skipping`)
  } else {
    for (const promo of PROMOTION_CODES) {
      await prisma.promotionCode.create({ data: promo })
    }
    console.log(`✅ Seeded ${PROMOTION_CODES.length} PromotionCodes`)
  }

  // ── SiteConfig ──
  const existingConfig = await prisma.siteConfig.count()
  if (existingConfig > 0) {
    console.log(`⚠️  ${existingConfig} SiteConfig(s) exist — skipping`)
  } else {
    for (const cfg of SITE_CONFIG) {
      await prisma.siteConfig.create({ data: cfg })
    }
    console.log(`✅ Seeded ${SITE_CONFIG.length} SiteConfigs`)
  }

  console.log("\n✨ All models hydrated!")
}

main()
  .catch((e) => {
    console.error("Seed failed:", e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
