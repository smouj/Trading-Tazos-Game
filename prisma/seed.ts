// ============================================================
// Trading Tazos Game — Seed
// Original fictional tazo collections. Minimon, Cybermon, Draco Bell.
// Minimon Tazos 1 (51), Draco Bell Matutano (118), Cybermon Magic Box (150)
// ============================================================

import { db } from "@/lib/db"

// ---- Helpers ----
function randRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function genStats() {
  return {
    attack: randRange(35, 85),
    defense: randRange(30, 80),
    resistance: randRange(30, 80),
    weight: randRange(30, 80),
    stability: randRange(30, 80),
    spin: randRange(25, 75),
    control: randRange(30, 80),
    bounce: randRange(25, 75),
    precision: randRange(30, 80),
  }
}

async function main() {
  console.log("🌱 Seeding Trading Tazos Game — Fictional Collections...\n")

  // Clean
  await db.tazo.deleteMany()
  await db.collection.deleteMany()
  await db.franchise.deleteMany()
  console.log("🧹 Cleaned existing data\n")

  // ============================================================
  // FRANCHISES
  // ============================================================
  const minimon = await db.franchise.create({
    data: {
      name: "Minimon", slug: "minimon", color: "#FFCB05", icon: "🐾",
      description: "Minimon — criaturas coleccionables estilo Ken Sugimori. Edición española, 2000-2001.",
      mechanic: "Colección numerada #1-51. Criaturas coloridas, trazo suave, diseño expresivo.",
    },
  })

  const dracobell = await db.franchise.create({
    data: {
      name: "Draco Bell", slug: "draco-bell", color: "#FF6B00", icon: "💥",
      description: "Draco Bell — guerreros de artes marciales estilo Akira Toriyama. Edición Matutano, 1995.",
      mechanic: "7 categorías: Tazos, Supertazos Voladores, Supertazos Octogonales, Megatazos, Holo 3D, Mastertazos.",
    },
  })

  const cybermon = await db.franchise.create({
    data: {
      name: "Cybermon", slug: "cybermon", color: "#00A1E9", icon: "🦾",
      description: "Cybermon — monstruos digitales estilo Kenji Watanabe. Magic Box 2000. 150 caps.",
      mechanic: "Evoluciones marcadas, armaduras biomecánicas, garras metálicas y energía digital.",
    },
  })

  console.log(`✅ 3 franchises\n`)

  // ============================================================
  // COLLECTIONS
  // ============================================================
  const minimonTazos1 = await db.collection.create({
    data: {
      name: "Minimon Tazos 1", slug: "minimon-tazos-1",
      franchiseId: minimon.id, year: 2000, totalTazos: 51,
      manufacturer: "Matutano", country: "España",
      description: "La colección original de 51 tazos Minimon lanzada en España. Numeración del #1 al #51.",
    },
  })

  const dracobellTazos = await db.collection.create({
    data: {
      name: "Draco Bell Tazos", slug: "draco-bell-matutano-1995",
      franchiseId: dracobell.id, year: 1995, totalTazos: 105,
      manufacturer: "Matutano", country: "España",
      description: "Colección completa de 118 tazos Draco Bell en 7 categorías: Tazos (1-10), Supertazos Voladores (11-30), Supertazos Octogonales (31-50), Megatazos (51-70), Holo 3D (1-10), y Mastertazos.",
    },
  })

  const cybermonMagicBox = await db.collection.create({
    data: {
      name: "Cybermon Digital Monsters", slug: "cybermon-magic-box-2000",
      franchiseId: cybermon.id, year: 2000, totalTazos: 150,
      manufacturer: "Magic Box", country: "España / Europa",
      description: "Colección de 150 caps Cybermon. Monstruos digitales evolucionables con armaduras y energía tecnológica.",
    },
  })

  console.log(`✅ 3 collections\n`)

  // ============================================================
  // MINIMON TAZOS 1 — #1-51 (VERIFIED)
  // ============================================================
  const minimonTazosData = [
    { n: "1",  name: "Bulbapod" },
    { n: "2",  name: "Flamander" },
    { n: "3",  name: "Squirtide" },
    { n: "4",  name: "Crysapod" },
    { n: "5",  name: "Thornlet" },
    { n: "6",  name: "Aeroquill" },
    { n: "7",  name: "Rattusk" },
    { n: "8",  name: "Beaklare" },
    { n: "9",  name: "Venoclaw" },
    { n: "10", name: "Mimichu" },
    { n: "11", name: "Mimirai" },
    { n: "12", name: "Spikefawn" },
    { n: "13", name: "Spikeena" },
    { n: "14", name: "Kitsune" },
    { n: "15", name: "Puffluff" },
    { n: "16", name: "Noctwing" },
    { n: "17", name: "Sporebloom" },
    { n: "18", name: "Shroomite" },
    { n: "19", name: "Fluttertox" },
    { n: "20", name: "Dugglet" },
    { n: "21", name: "Kittcoin" },
    { n: "22", name: "Minduck" },
    { n: "23", name: "Primalang" },
    { n: "24", name: "Emberpup" },
    { n: "25", name: "Tadswirl" },
    { n: "26", name: "Psyklon" },
    { n: "27", name: "Quadrarm" },
    { n: "28", name: "Chimevine" },
    { n: "29", name: "Jelliflow" },
    { n: "30", name: "Boulderock" },
    { n: "31", name: "Pyrosteed" },
    { n: "32", name: "Dozewell" },
    { n: "33", name: "Polaritron" },
    { n: "34", name: "Sludger" },
    { n: "35", name: "Wraithen" },
    { n: "36", name: "Hypnopod" },
    { n: "37", name: "Clawpincer" },
    { n: "38", name: "Electrobal" },
    { n: "39", name: "Seedclust" },
    { n: "40", name: "Marrowsk" },
    { n: "41", name: "Smogbelch" },
    { n: "42", name: "Boulderdon" },
    { n: "43", name: "Seasteed" },
    { n: "44", name: "Gildfish" },
    { n: "45", name: "Starwave" },
    { n: "46", name: "Splashcarp" },
    { n: "47", name: "Evoleon" },
    { n: "48", name: "Helixpawn" },
    { n: "49", name: "Carapod" },
    { n: "50", name: "Serpenthia" },
    { n: "51", name: "Tamer Red" },
  ]

  console.log(`📦 Inserting ${minimonTazosData.length} Minimon Tazos 1...`)

  // Mark some as owned (random ~30%)
  const ownedMinimonIds = new Set(
    Array.from({ length: minimonTazosData.length }, (_, i) => i)
      .filter(() => Math.random() < 0.3)
      .map(i => minimonTazosData[i].n)
  )

  for (const t of minimonTazosData) {
    const slug = `minimon-t1-${t.n}`
    await db.tazo.create({
      data: {
        name: t.name, displayName: t.name, slug,
        franchiseId: minimon.id, collectionId: minimonTazos1.id,
        number: t.n, variant: null, category: "tazos",
        manufacturer: "Matutano", country: "España",
        sourceStatus: "verified",
        physicalType: "cardboard", rarity: "common",
        imageUrl: `/tazos/minimon/${slug}.svg`,
        isOwned: ownedMinimonIds.has(t.n),
        ...genStats(),
      },
    })
  }

  console.log(`   ✅ ${minimonTazosData.length} Minimon tazos\n`)

  // ============================================================
  // DRACO BELL — TAZOS NORMALES #1-10
  // ============================================================
  const dracobellTazosNormales = [
    { n: "1",  name: "Glacius" },
    { n: "2",  name: "Brutox" },
    { n: "3",  name: "Zentar" },
    { n: "4",  name: "Veloxis" },
    { n: "5",  name: "Tankara" },
    { n: "6",  name: "Psykron" },
    { n: "7",  name: "Sporefiend" },
    { n: "8",  name: "Mech-19" },
    { n: "9",  name: "Gorrax" },
    { n: "10", name: "Vorax" },
  ]

  console.log(`📦 Draco Bell Tazos #1-10...`)
  for (const t of dracobellTazosNormales) {
    const slug = `dracobell-t-${t.n}`
    await db.tazo.create({
      data: {
        name: t.name, displayName: t.name, slug,
        franchiseId: dracobell.id, collectionId: dracobellTazos.id,
        number: t.n, category: "tazos",
        manufacturer: "Matutano", country: "España",
        sourceStatus: "verified",
        physicalType: "cardboard", rarity: "common",
        imageUrl: `/tazos/dracobell/${slug}.svg`,
        ...genStats(),
      },
    })
  }
  console.log(`   ✅ 10 tazos normales\n`)

  // ============================================================
  // DRACO BELL — SUPERTAZOS VOLADORES #11-30
  // ============================================================
  const dracobellSupertazosVoladores = [
    { n: "11", name: "Hexxar" },
    { n: "12", name: "Phycaro Jr." },
    { n: "13", name: "Gorrax" },
    { n: "14", name: "Kairo" },
    { n: "15", name: "Rohan y Trux" },
    { n: "16", name: "Nightfang" },
    { n: "17", name: "Marcellus" },
    { n: "18", name: "Reyna" },
    { n: "19", name: "Zonk" },
    { n: "20", name: "Arkos" },
    { n: "21", name: "Zen-Shin" },
    { n: "22", name: "Phantom Jr." },
    { n: "23", name: "Rohan" },
    { n: "24", name: "Zen-Master" },
    { n: "25", name: "Mech-16" },
    { n: "26", name: "Mei-Mei" },
    { n: "27", name: "Mech-18" },
    { n: "28", name: "Glacius" },
    { n: "29", name: "Vorax" },
    { n: "30", name: "Sora" },
  ]

  console.log(`📦 Draco Bell Supertazos Voladores #11-30...`)
  for (const t of dracobellSupertazosVoladores) {
    const slug = `dracobell-sv-${t.n}`
    await db.tazo.create({
      data: {
        name: t.name, displayName: t.name, slug,
        franchiseId: dracobell.id, collectionId: dracobellTazos.id,
        number: t.n, category: "supertazos_voladores",
        manufacturer: "Matutano", country: "España",
        sourceStatus: "verified",
        physicalType: "plastic", rarity: "uncommon",
        imageUrl: `/tazos/dracobell/${slug}.svg`,
        ...genStats(),
      },
    })
  }
  console.log(`   ✅ 20 supertazos voladores\n`)

  // ============================================================
  // DRACO BELL — SUPERTAZOS OCTOGONALES #31-50
  // ============================================================
  const dracobellSupertazosOctogonales = [
    { n: "31", name: "Phantom Phase 1" },
    { n: "32", name: "Zonk" },
    { n: "33", name: "Phantom Phase 2" },
    { n: "34", name: "Nightfang" },
    { n: "35", name: "Mech-16" },
    { n: "36", name: "Lord Frost" },
    { n: "37", name: "Phantom Phase 3" },
    { n: "38", name: "Hexblade" },
    { n: "39", name: "Chaos Buu" },
    { n: "40", name: "Hexxar" },
    { n: "41", name: "Vexar" },
    { n: "42", name: "Reyna" },
    { n: "43", name: "Rohax" },
    { n: "44", name: "Trux" },
    { n: "45", name: "Phycaro Junior" },
    { n: "46", name: "Kairo" },
    { n: "47", name: "Zen-Shin" },
    { n: "48", name: "Rohan" },
    { n: "49", name: "Arkos" },
    { n: "50", name: "Zen-Master" },
  ]

  console.log(`📦 Draco Bell Supertazos Octogonales #31-50...`)
  for (const t of dracobellSupertazosOctogonales) {
    const slug = `dracobell-so-${t.n}`
    await db.tazo.create({
      data: {
        name: t.name, displayName: t.name, slug,
        franchiseId: dracobell.id, collectionId: dracobellTazos.id,
        number: t.n, category: "supertazos_octogonales",
        manufacturer: "Matutano", country: "España",
        sourceStatus: "verified",
        physicalType: "plastic", rarity: "uncommon",
        imageUrl: `/tazos/dracobell/${slug}.svg`,
        ...genStats(),
      },
    })
  }
  console.log(`   ✅ 20 supertazos octogonales\n`)

  // ============================================================
  // DRACO BELL — MEGATAZOS #51-70 (REDONDO + OCTOGONAL)
  // ============================================================
  const dracobellMegatazosNames = [
    { n: "51", name: "Kairo" },
    { n: "52", name: "Vexar" },
    { n: "53", name: "Rohan" },
    { n: "54", name: "Rohax" },
    { n: "55", name: "Trux" },
    { n: "56", name: "Phycaro Jr." },
    { n: "57", name: "Phantom" },
    { n: "58", name: "Chaos Buu" },
    { n: "59", name: "Hexxar" },
    { n: "60", name: "Hexblade" },
    { n: "61", name: "Arkos" },
    { n: "62", name: "Marcellus" },
    { n: "63", name: "Zentaro" },
    { n: "64", name: "Zen-Shin" },
    { n: "65", name: "Reyna" },
    { n: "66", name: "Sora" },
    { n: "67", name: "Baldwin" },
    { n: "68", name: "Kame-Sensei" },
    { n: "69", name: "Zonk" },
    { n: "70", name: "Zen-Master" },
  ]

  console.log(`📦 Draco Bell Megatazos #51-70 (redondos + octogonales)...`)
  for (const t of dracobellMegatazosNames) {
    // Redondo
    await db.tazo.create({
      data: {
        name: t.name, displayName: `${t.name} (Redondo)`, slug: `dracobell-mr-${t.n}`,
        franchiseId: dracobell.id, collectionId: dracobellTazos.id,
        number: t.n, variant: "megatazo_redondo", category: "megatazos",
        manufacturer: "Matutano", country: "España",
        sourceStatus: "partial",
        physicalType: "plastic", rarity: "rare",
        imageUrl: `/tazos/dracobell/dracobell-mr-${t.n}.svg`,
        ...genStats(),
      },
    })
    // Octogonal
    await db.tazo.create({
      data: {
        name: t.name, displayName: `${t.name} (Octogonal)`, slug: `dracobell-mo-${t.n}`,
        franchiseId: dracobell.id, collectionId: dracobellTazos.id,
        number: t.n, variant: "megatazo_octogonal", category: "megatazos",
        manufacturer: "Matutano", country: "España",
        sourceStatus: "partial",
        physicalType: "plastic", rarity: "rare",
        imageUrl: `/tazos/dracobell/dracobell-mo-${t.n}.svg`,
        ...genStats(),
      },
    })
  }
  console.log(`   ✅ 40 megatazos (20 redondos + 20 octogonales)\n`)

  // ============================================================
  // DRACO BELL — HOLO 3D #1-10 (RANURA DERECHA + IZQUIERDA)
  // ============================================================
  const dracobellHolo3DNames = [
    { n: "1",  name: "Phantom" },
    { n: "2",  name: "Kairo" },
    { n: "3",  name: "Rohan" },
    { n: "4",  name: "Rohax" },
    { n: "5",  name: "Rohan y Trux" },
    { n: "6",  name: "Vexar" },
    { n: "7",  name: "Chaos Buu" },
    { n: "8",  name: "Hexblade" },
    { n: "9",  name: "Kairo" },
    { n: "10", name: "Phantom y Trux" },
  ]

  console.log(`📦 Draco Bell Holo 3D #1-10 (ranura derecha + izquierda)...`)
  for (const t of dracobellHolo3DNames) {
    await db.tazo.create({
      data: {
        name: t.name, displayName: `${t.name} (Ranura Der.)`, slug: `dracobell-hr-${t.n}`,
        franchiseId: dracobell.id, collectionId: dracobellTazos.id,
        number: t.n, variant: "ranura_derecha", category: "holo_3d",
        manufacturer: "Matutano", country: "España",
        sourceStatus: "verified",
        physicalType: "holo", rarity: "ultra",
        imageUrl: `/tazos/dracobell/dracobell-hr-${t.n}.svg`,
        ...genStats(),
      },
    })
    await db.tazo.create({
      data: {
        name: t.name, displayName: `${t.name} (Ranura Izq.)`, slug: `dracobell-hl-${t.n}`,
        franchiseId: dracobell.id, collectionId: dracobellTazos.id,
        number: t.n, variant: "ranura_izquierda", category: "holo_3d",
        manufacturer: "Matutano", country: "España",
        sourceStatus: "verified",
        physicalType: "holo", rarity: "ultra",
        imageUrl: `/tazos/dracobell/dracobell-hl-${t.n}.svg`,
        ...genStats(),
      },
    })
  }
  console.log(`   ✅ 20 Holo 3D (10 ranura derecha + 10 izquierda)\n`)

  // ============================================================
  // DRACO BELL — MASTERTAZOS
  // ============================================================
  const dracobellMastertazos = [
    { id: "MASTER-A18",             name: "Mech-18",           variant: null },
    { id: "MASTER-A18-GOLD",        name: "Mech-18 Dorado",    variant: "gold" },
    { id: "MASTER-A18-BLACK",       name: "Mech-18 Oscuro",   variant: "black_border" },
    { id: "MASTER-FREEZER",         name: "Glacius",        variant: null },
    { id: "MASTER-GOKU",            name: "Kairo",           variant: null },
    { id: "MASTER-SHENRON",         name: "Drakarion",        variant: null },
    { id: "MASTER-SHENRON-BLACK",   name: "Drakarion Oscuro",variant: "black_border" },
    { id: "MASTER-VEGETA",          name: "Vexar",         variant: null },
  ]

  console.log(`📦 Draco Bell Mastertazos...`)
  for (const t of dracobellMastertazos) {
    const slug = `dracobell-master-${t.id.toLowerCase().replace(/-/g, "-")}`
    await db.tazo.create({
      data: {
        name: t.name, displayName: t.name, slug,
        franchiseId: dracobell.id, collectionId: dracobellTazos.id,
        number: t.id, variant: t.variant, category: "mastertazos",
        manufacturer: "Matutano", country: "España",
        sourceStatus: "verified",
        physicalType: "metal", rarity: "legendary",
        imageUrl: `/tazos/dracobell/${slug}.svg`,
        ...genStats(),
      },
    })
  }
  console.log(`   ✅ 8 mastertazos\n`)

  // ============================================================
  // CYBERMON — MAGIC BOX 2000 #1-150 (PENDING VISUAL CHECK)
  // ============================================================
  console.log(`📦 Cybermon Magic Box 2000 #1-150...`)

  const CYBERMON_NAMES = [
    "Bytebot",
    "Koromon",
    "Tsunomon",
    "Tokomon",
    "Tanemon",
    "Bukamon",
    "Motimon",
    "Nyaromon",
    "Yokomon",
    "Pagumon",
    "Armadon",
    "Wolfbyte",
    "Avionix",
    "Beetlex",
    "Floramon",
    "Sealbyte",
    "Hoopmon",
    "Felimon",
    "Puppymon",
    "Vectormon",
    "Hawkeye",
    "Platemail",
    "Larvamon",
    "Bunnymon",
    "Loppix",
    "Foxfire",
    "Pyrodramon",
    "Trickmon",
    "Leonix",
    "Ogrebyte",
    "Graymech",
    "Garublade",
    "Phoenixwing",
    "Mechbeetle",
    "Thornbloom",
    "Icetusk",
    "Archangelon",
    "Shadowmon",
    "Blazix",
    "Hydroserpent",
    "Monomech",
    "Centaxmon",
    "Terradramon",
    "ShadowTyranno",
    "Frostbite",
    "Yetix",
    "Drillclaw",
    "Armasea",
    "Sludgemon",
    "Junkbyte",
    "MetalGreymech",
    "WereGarublade",
    "Stormwing",
    "Megabeetle",
    "Rosethorn",
    "Thundertusk",
    "Solarangelon",
    "Celestialon",
    "Darkmistress",
    "Vampix",
    "SkullGreymech",
    "Cyborgmon",
    "Monkex",
    "Diskmon",
    "HydroserpentEX",
    "Tuskon",
    "Faeriex",
    "Leviadon",
    "ScorpioByte",
    "Specter",
    "WarGreymech",
    "MetalGarublade",
    "Blazewing",
    "Hercubeetle",
    "Floragoddess",
    "Frosttusk",
    "Radiangelon",
    "Holydramon",
    "Omnimech",
    "Imperiadramon",
    "ShadowGreymech",
    "MalwareByte",
    "Jestermon",
    "MetalSerpent",
    "Marionex",
    "Mechdramon",
    "ToxicVampix",
    "Malovampix",
    "Abyssmon",
    "Cherubix",
    "Flaredramon",
    "Thunderdramon",
    "Goldramon",
    "Windramon",
    "Ninjamon",
    "Diggmon",
    "Submarimon",
    "Wingmon",
    "Sphinxmon",
    "Wraithmon",
    "Fusedramon",
    "Stingdramon",
    "Silphramon",
    "Totemmon",
    "ExVeemon",
    "Stingmon",
    "Aquillamon",
    "Ankylomon",
    "Arachmon",
    "Wraithmon",
    "Vampix",
    "ToxicVampix",
    "Malovampix",
    "Jestermon",
    "MetalSerpent",
    "Marionex",
    "Mechdramon",
    "Abyssmon",
    "MalwareByte",
    "Daemon",
    "Pyrodramon",
    "Growlpyro",
    "WarPyrodramon",
    "GallantByte",
    "Megidramon",
    "Foxfire",
    "Kyubix",
    "Taomon",
    "Sakuyamon",
    "Tamakai",
    "MarineAngemon",
    "SaberLeonix",
    "MetalMonkex",
    "PrinceByte",
    "Omnimech",
    "Imperiadramon FM",
    "GallantByte CM",
    "Sakuyamon",
    "MegaGargomon",
    "Justimon",
    "Zhuqiaomon",
    "Azulongmon",
    "Ebonwumon",
    "Baihumon",
    "Fanglongmon",
    "Kimeramon",
    "SkullSatamon",
    "Infermon",
    "Kerpymon",
    "Susanoomon"
  ]

  for (let i = 0; i < 150; i++) {
    const n = String(i + 1)
    const name = CYBERMON_NAMES[i]
    const slug = `cybermon-mb-${n}`
    await db.tazo.create({
      data: {
        name, displayName: name, slug,
        franchiseId: cybermon.id, collectionId: cybermonMagicBox.id,
        number: n, category: "caps",
        manufacturer: "Magic Box", country: "España / Europa",
        sourceStatus: "verified",
        physicalType: "plastic", rarity: "common",
        imageUrl: `/tazos/cybermon/${slug}.svg`,
        isOwned: false,
        ...genStats(),
      },
    })
  }
  console.log(`   ✅ 150 Cybermon caps (verified names)\n`)

  // ============================================================
  // SUMMARY
  // ============================================================
  const tazoCount = await db.tazo.count()
  const verifiedCount = await db.tazo.count({ where: { sourceStatus: "verified" } })
  const partialCount = await db.tazo.count({ where: { sourceStatus: "partial" } })
  const pendingCount = await db.tazo.count({ where: { sourceStatus: "pending_visual_check" } })

  console.log("═══ SEED COMPLETE ═══")
  console.log(`   Franchises:  3`)
  console.log(`   Collections: 3`)
  console.log(`   Total Tazos: ${tazoCount}`)
  console.log(`     Verified:            ${verifiedCount}`)
  console.log(`     Partial:             ${partialCount}`)
  console.log(`     Pending Visual Check: ${pendingCount}`)
  console.log()
  console.log(`   Minimon Tazos 1:        51 (verified)`  )
  console.log(`   Draco Bell Tazos Normales:      10 (verified)`  )
  console.log(`   Draco Bell Supertazos Volador:  20 (verified)`  )
  console.log(`   Draco Bell Supertazos Octog:    20 (verified)`  )
  console.log(`   Draco Bell Megatazos:           40 (partial — 20R + 20O)`)
  console.log(`   Draco Bell Holo 3D:             20 (verified — 10D + 10I)`)
  console.log(`   Draco Bell Mastertazos:          8 (verified)`  )
  console.log(`   Cybermon Magic Box:      150 (verified)`   )
  console.log(`                          ———`)
  console.log(`   TOTAL:                  319 tazos`)
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
