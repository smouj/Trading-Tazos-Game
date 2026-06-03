/**
 * TTG Tazo Image Generator
 * Generates professional circular disc-style PNG images for all 62 tazos.
 */
import sharp from "sharp"
import { existsSync, mkdirSync } from "fs"
import { join } from "path"

const OUT_DIR = join(import.meta.dirname, "..", "public", "tazos")

for (const d of ["minimon", "cybermon", "dracobell"]) {
  mkdirSync(join(OUT_DIR, d), { recursive: true })
}

interface TazoDef {
  name: string; slug: string; franchise: "minimon" | "cybermon" | "dracobell"
  number: string; rarity: string; skill: string
}

const FC = {
  minimon: { colors: ["#FFCB05", "#FF8C00"], accent: "#E3350D", ring: "#FFCB05" },
  cybermon: { colors: ["#00A1E9", "#0057B7"], accent: "#1E90FF", ring: "#00A1E9" },
  dracobell: { colors: ["#FF6B00", "#CC4400"], accent: "#FFD700", ring: "#FF6B00" },
}

const RARITY_GLOW: Record<string, string> = {
  common: "#9CA3AF", uncommon: "#22C55E", rare: "#3B82F6", ultra: "#A855F7", legendary: "#F59E0B",
}

const TAZOS: TazoDef[] = [
  { name:"Pikachu",slug:"minimon-pikachu",franchise:"minimon",number:"001",rarity:"common",skill:"Thunder Jolt" },
  { name:"Charmander",slug:"minimon-charmander",franchise:"minimon",number:"004",rarity:"common",skill:"Ember Spin" },
  { name:"Charmeleon",slug:"minimon-charmeleon",franchise:"minimon",number:"005",rarity:"uncommon",skill:"Flame Burst" },
  { name:"Charizard",slug:"minimon-charizard",franchise:"minimon",number:"006",rarity:"rare",skill:"Inferno Vortex" },
  { name:"Bulbasaur",slug:"minimon-bulbasaur",franchise:"minimon",number:"001",rarity:"common",skill:"Vine Whip" },
  { name:"Squirtle",slug:"minimon-squirtle",franchise:"minimon",number:"007",rarity:"common",skill:"Aqua Jet" },
  { name:"Mewtwo",slug:"minimon-mewtwo",franchise:"minimon",number:"150",rarity:"ultra",skill:"Psystrike" },
  { name:"Gengar",slug:"minimon-gengar",franchise:"minimon",number:"094",rarity:"rare",skill:"Shadow Ball" },
  { name:"Eevee",slug:"minimon-eevee",franchise:"minimon",number:"133",rarity:"uncommon",skill:"Quick Attack" },
  { name:"Jigglypuff",slug:"minimon-jigglypuff",franchise:"minimon",number:"039",rarity:"common",skill:"Sing" },
  { name:"Snorlax",slug:"minimon-snorlax",franchise:"minimon",number:"143",rarity:"uncommon",skill:"Body Slam" },
  { name:"Gyarados",slug:"minimon-gyarados",franchise:"minimon",number:"130",rarity:"rare",skill:"Hydro Storm" },
  { name:"Mew",slug:"minimon-mew",franchise:"minimon",number:"151",rarity:"legendary",skill:"Aura Sphere" },
  { name:"Dragonite",slug:"minimon-dragonite",franchise:"minimon",number:"149",rarity:"rare",skill:"Dragon Rush" },
  { name:"Togepi",slug:"minimon-togepi",franchise:"minimon",number:"175",rarity:"common",skill:"Metronome" },
  { name:"Umbreon",slug:"minimon-umbreon",franchise:"minimon",number:"197",rarity:"uncommon",skill:"Moonlight" },
  { name:"Ampharos",slug:"minimon-ampharos",franchise:"minimon",number:"181",rarity:"uncommon",skill:"Thunder Punch" },
  { name:"Scizor",slug:"minimon-scizor",franchise:"minimon",number:"212",rarity:"rare",skill:"Bullet Punch" },
  { name:"Chikorita",slug:"minimon-chikorita",franchise:"minimon",number:"152",rarity:"common",skill:"Razor Leaf" },
  { name:"Cyndaquil",slug:"minimon-cyndaquil",franchise:"minimon",number:"155",rarity:"common",skill:"Flame Wheel" },
  { name:"Totodile",slug:"minimon-totodile",franchise:"minimon",number:"158",rarity:"common",skill:"Water Gun" },
  { name:"Espeon",slug:"minimon-espeon",franchise:"minimon",number:"196",rarity:"uncommon",skill:"Morning Sun" },
  { name:"Agumon",slug:"cybermon-agumon",franchise:"cybermon",number:"001",rarity:"common",skill:"Pepper Breath" },
  { name:"Greymon",slug:"cybermon-greymon",franchise:"cybermon",number:"002",rarity:"uncommon",skill:"Nova Blast" },
  { name:"MetalGreymon",slug:"cybermon-metalgreymon",franchise:"cybermon",number:"003",rarity:"rare",skill:"Giga Destroyer" },
  { name:"WarGreymon",slug:"cybermon-wargreymon",franchise:"cybermon",number:"004",rarity:"ultra",skill:"Terra Force" },
  { name:"Gabumon",slug:"cybermon-gabumon",franchise:"cybermon",number:"005",rarity:"common",skill:"Blue Blaster" },
  { name:"Garurumon",slug:"cybermon-garurumon",franchise:"cybermon",number:"006",rarity:"uncommon",skill:"Howling Blaster" },
  { name:"Patamon",slug:"cybermon-patamon",franchise:"cybermon",number:"007",rarity:"common",skill:"Boom Bubble" },
  { name:"Angemon",slug:"cybermon-angemon",franchise:"cybermon",number:"008",rarity:"rare",skill:"Hand of Fate" },
  { name:"Devimon",slug:"cybermon-devimon",franchise:"cybermon",number:"009",rarity:"uncommon",skill:"Death Claw" },
  { name:"Myotismon",slug:"cybermon-myotismon",franchise:"cybermon",number:"010",rarity:"ultra",skill:"Night Raid" },
  { name:"Gatomon",slug:"cybermon-gatomon",franchise:"cybermon",number:"011",rarity:"common",skill:"Lightning Paw" },
  { name:"Angewomon",slug:"cybermon-angewomon",franchise:"cybermon",number:"012",rarity:"rare",skill:"Celestial Arrow" },
  { name:"Tentomon",slug:"cybermon-tentomon",franchise:"cybermon",number:"013",rarity:"common",skill:"Super Shocker" },
  { name:"Kabuterimon",slug:"cybermon-kabuterimon",franchise:"cybermon",number:"014",rarity:"uncommon",skill:"Electro Shocker" },
  { name:"Piedmon",slug:"cybermon-piedmon",franchise:"cybermon",number:"015",rarity:"legendary",skill:"Trump Sword" },
  { name:"MetalGarurumon",slug:"cybermon-metalgarurumon",franchise:"cybermon",number:"016",rarity:"ultra",skill:"Ice Wolf Claw" },
  { name:"WereGarurumon",slug:"cybermon-weregarurumon",franchise:"cybermon",number:"017",rarity:"rare",skill:"Wolf Claw" },
  { name:"Machinedramon",slug:"cybermon-machinedramon",franchise:"cybermon",number:"018",rarity:"ultra",skill:"Giga Cannon" },
  { name:"Biyomon",slug:"cybermon-biyomon",franchise:"cybermon",number:"019",rarity:"common",skill:"Spiral Twister" },
  { name:"Birdramon",slug:"cybermon-birdramon",franchise:"cybermon",number:"020",rarity:"uncommon",skill:"Meteor Wing" },
  { name:"Goku",slug:"dracobell-goku",franchise:"dracobell",number:"001",rarity:"uncommon",skill:"Kamehameha" },
  { name:"Goku SSJ",slug:"dracobell-goku-ssj",franchise:"dracobell",number:"002",rarity:"rare",skill:"Super Kamehameha" },
  { name:"Vegeta",slug:"dracobell-vegeta",franchise:"dracobell",number:"003",rarity:"uncommon",skill:"Galick Gun" },
  { name:"Vegeta SSJ",slug:"dracobell-vegeta-ssj",franchise:"dracobell",number:"004",rarity:"rare",skill:"Final Flash" },
  { name:"Gohan",slug:"dracobell-gohan",franchise:"dracobell",number:"005",rarity:"common",skill:"Masenko" },
  { name:"Piccolo",slug:"dracobell-piccolo",franchise:"dracobell",number:"006",rarity:"uncommon",skill:"Special Beam Cannon" },
  { name:"Krillin",slug:"dracobell-krillin",franchise:"dracobell",number:"007",rarity:"common",skill:"Destructo Disc" },
  { name:"Raditz",slug:"dracobell-raditz",franchise:"dracobell",number:"008",rarity:"common",skill:"Double Sunday" },
  { name:"Nappa",slug:"dracobell-nappa",franchise:"dracobell",number:"009",rarity:"uncommon",skill:"Break Cannon" },
  { name:"Frieza",slug:"dracobell-frieza",franchise:"dracobell",number:"010",rarity:"ultra",skill:"Death Beam" },
  { name:"Cell",slug:"dracobell-cell",franchise:"dracobell",number:"011",rarity:"ultra",skill:"Kamehameha" },
  { name:"Trunks",slug:"dracobell-trunks",franchise:"dracobell",number:"012",rarity:"uncommon",skill:"Burning Attack" },
  { name:"Trunks SSJ",slug:"dracobell-trunks-ssj",franchise:"dracobell",number:"013",rarity:"rare",skill:"Heat Dome Attack" },
  { name:"Majin Buu",slug:"dracobell-majin-buu",franchise:"dracobell",number:"014",rarity:"legendary",skill:"Candy Beam" },
  { name:"Broly",slug:"dracobell-broly",franchise:"dracobell",number:"015",rarity:"ultra",skill:"Eraser Cannon" },
  { name:"Broly LSSJ",slug:"dracobell-broly-lssj",franchise:"dracobell",number:"016",rarity:"legendary",skill:"Omega Blaster" },
  { name:"Android 17",slug:"dracobell-android-17",franchise:"dracobell",number:"017",rarity:"uncommon",skill:"Android Barrier" },
  { name:"Android 18",slug:"dracobell-android-18",franchise:"dracobell",number:"018",rarity:"uncommon",skill:"Power Blitz" },
  { name:"Tien",slug:"dracobell-tien",franchise:"dracobell",number:"019",rarity:"common",skill:"Tri-Beam" },
  { name:"Gohan SSJ2",slug:"dracobell-gohan-ssj2",franchise:"dracobell",number:"020",rarity:"rare",skill:"Father-Son Kamehameha" },
]

function buildSvg(t: TazoDef): string {
  const cfg = FC[t.franchise]
  const W = 400, H = 400, cx = 200, cy = 200, r = 180
  const glow = RARITY_GLOW[t.rarity] || "#9CA3AF"
  const gid = "g" + t.slug.replace(/-/g, "_")
  const ggid = "gg" + t.slug.replace(/-/g, "_")

  const isLegendary = t.rarity === "legendary"
  const isUltra = t.rarity === "ultra"
  const isRare = t.rarity === "rare"

  // Build halftone dots
  let dots = ""
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const dx = Math.round(Math.cos(angle) * (r - 12))
    const dy = Math.round(Math.sin(angle) * (r - 12))
    dots += `<circle cx="${cx + dx}" cy="${cy + dy}" r="3" fill="white" opacity="0.4"/>`
  }

  const bgGlow = (isRare || isUltra || isLegendary)
    ? `<circle cx="${cx}" cy="${cy}" r="${r + 20}" fill="url(#${ggid})"/>`
    : ""

  const glowRing = isLegendary
    ? `<circle cx="${cx}" cy="${cy}" r="${r + 14}" fill="none" stroke="${glow}" stroke-width="5" opacity="0.4"/>`
    : isUltra
    ? `<circle cx="${cx}" cy="${cy}" r="${r + 10}" fill="none" stroke="${glow}" stroke-width="3" opacity="0.3"/>`
    : ""

  let rarityStars = ""
  if (isLegendary) {
    rarityStars = `<text x="${cx}" y="${cy - r + 35}" text-anchor="middle" font-size="24" fill="${glow}" font-weight="bold">&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;</text>`
  } else if (isUltra) {
    rarityStars = `<text x="${cx}" y="${cy - r + 35}" text-anchor="middle" font-size="18" fill="${glow}" font-weight="bold">&#x2605;&#x2605;&#x2605;&#x2605;</text>`
  } else if (isRare) {
    rarityStars = `<text x="${cx}" y="${cy - r + 35}" text-anchor="middle" font-size="18" fill="${glow}" font-weight="bold">&#x2605;&#x2605;&#x2605;</text>`
  } else if (t.rarity === "uncommon") {
    rarityStars = `<text x="${cx}" y="${cy - r + 35}" text-anchor="middle" font-size="18" fill="${glow}" font-weight="bold">&#x2605;&#x2605;</text>`
  }

  const franchiseLabel = t.franchise === "minimon" ? "POK\u00c9MON" : t.franchise === "cybermon" ? "DIGIMON" : "DRAGON BALL Z"
  const fontSize = t.name.length > 10 ? 60 : t.name.length > 7 ? 72 : 90

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="${gid}" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="${cfg.colors[0]}" stop-opacity="0.9"/>
      <stop offset="60%" stop-color="${cfg.colors[0]}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${cfg.colors[1]}" stop-opacity="0.85"/>
    </radialGradient>
    <radialGradient id="${ggid}" cx="50%" cy="50%" r="50%">
      <stop offset="70%" stop-color="${glow}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${glow}" stop-opacity="0"/>
    </radialGradient>
    <filter id="sh-${gid}">
      <feDropShadow dx="3" dy="3" stdDeviation="4" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>
  ${bgGlow}
  ${glowRing}
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${gid})" filter="url(#sh-${gid})" stroke="${cfg.ring}" stroke-width="4"/>
  <circle cx="${cx}" cy="${cy}" r="${r - 12}" fill="none" stroke="white" stroke-width="2" opacity="0.5"/>
  <circle cx="${cx}" cy="${cy}" r="${r - 20}" fill="none" stroke="white" stroke-width="1.5" opacity="0.3"/>
  <path d="M ${cx - r + 30} ${cy} A ${r - 30} ${r - 30} 0 0 1 ${cx + r - 30} ${cy}" fill="none" stroke="white" stroke-width="6" opacity="0.2" stroke-linecap="round"/>
  ${dots}
  <text x="${cx}" y="${cy + 10}" text-anchor="middle" dominant-baseline="middle" font-family="Arial Black,Impact,sans-serif" font-size="${fontSize}" font-weight="900" fill="white" stroke="#1a1a1a" stroke-width="3" paint-order="stroke fill" letter-spacing="2">${t.name.charAt(0)}</text>
  <rect x="${cx - 30}" y="${cy + r - 55}" width="60" height="28" rx="14" fill="white" stroke="#1a1a1a" stroke-width="2"/>
  <text x="${cx}" y="${cy + r - 33}" text-anchor="middle" dominant-baseline="middle" font-family="Arial Black,Courier New,monospace" font-size="16" font-weight="900" fill="#1a1a1a">#${t.number}</text>
  ${rarityStars}
  <path d="M ${cx - 100} ${cy + r - 42} A 100 100 0 0 0 ${cx + 100} ${cy + r - 42}" fill="none" stroke="${cfg.accent}" stroke-width="3" opacity="0.7"/>
  <text x="${cx}" y="${cy + r - 10}" text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="#1a1a1a" opacity="0.8">${t.skill}</text>
  <text x="${cx}" y="28" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="13" font-weight="900" fill="white" stroke="#1a1a1a" stroke-width="1" opacity="0.9" letter-spacing="3" paint-order="stroke fill">${franchiseLabel}</text>
</svg>`
}

let generated = 0, skipped = 0

for (const tazo of TAZOS) {
  const dir = join(OUT_DIR, tazo.franchise)
  const outPath = join(dir, `${tazo.slug}.png`)
  if (existsSync(outPath)) { skipped++; continue }
  const svg = buildSvg(tazo)
  await sharp(Buffer.from(svg)).png().toFile(outPath)
  generated++
}

console.log(`Generated ${generated} tazo images, ${skipped} already existed.`)
console.log(`Total: ${TAZOS.length} tazos defined.`)
