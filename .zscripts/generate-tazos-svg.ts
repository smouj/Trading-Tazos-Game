/**
 * TTG Tazo Image Generator — Real Collections Edition
 * Generates SVG disc images for Minimon Tazos 1 (51), DBZ Matutano (118+),
 * and Cybermon Magic Box (150 pending).
 */
import { existsSync, mkdirSync, writeFileSync } from "fs"
import { join } from "path"

const OUT_DIR = join(import.meta.dirname, "..", "public", "tazos")
for (const d of ["minimon", "cybermon", "dracobell"]) {
  mkdirSync(join(OUT_DIR, d), { recursive: true })
}

interface TazoDef {
  slug: string
  name: string | null
  number: string
  franchise: "minimon" | "cybermon" | "dragon-ball-z"
  category?: string
  sourceStatus: string
}

const FC = {
  minimon: { colors: ["#FFCB05", "#FF8C00"], accent: "#E3350D", ring: "#FFCB05", label: "POK\u00c9MON TAZOS 1" },
  "dragon-ball-z": { colors: ["#FF6B00", "#CC4400"], accent: "#FFD700", ring: "#FF6B00", label: "DBZ MATUTANO 1995" },
  cybermon: { colors: ["#00A1E9", "#0057B7"], accent: "#1E90FF", ring: "#00A1E9", label: "DIGIMON MAGIC BOX 2000" },
}

const STATUS_COLORS: Record<string, string> = {
  verified: "#22C55E",
  partial: "#F59E0B",
  pending_visual_check: "#9CA3AF",
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function buildSvg(t: TazoDef): string {
  const cfg = FC[t.franchise]
  const W = 400, H = 400, cx = 200, cy = 200, r = 180
  const sid = t.slug.replace(/[^a-zA-Z0-9]/g, "")

  let dots = ""
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    dots += `<circle cx="${cx + Math.round(Math.cos(a) * (r - 12))}" cy="${cy + Math.round(Math.sin(a) * (r - 12))}" r="3" fill="white" opacity="0.4"/>`
  }

  const isPending = t.sourceStatus === "pending_visual_check"
  const initial = t.name ? t.name.charAt(0) : "?"
  const displayName = t.name || `#${t.number}`
  const fsize = displayName.length > 12 ? 44 : displayName.length > 8 ? 56 : 72

  // Category badge
  const catLabel = t.category
    ? t.category.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
    : ""

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="g${sid}" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="${cfg.colors[0]}" stop-opacity="0.9"/>
      <stop offset="60%" stop-color="${cfg.colors[0]}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${cfg.colors[1]}" stop-opacity="0.85"/>
    </radialGradient>
    <filter id="sh${sid}">
      <feDropShadow dx="3" dy="3" stdDeviation="4" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#g${sid})" filter="url(#sh${sid})" stroke="${cfg.ring}" stroke-width="4"/>
  <circle cx="${cx}" cy="${cy}" r="${r - 12}" fill="none" stroke="white" stroke-width="2" opacity="0.5"/>
  <circle cx="${cx}" cy="${cy}" r="${r - 20}" fill="none" stroke="white" stroke-width="1.5" opacity="0.3"/>
  <path d="M ${cx - r + 30} ${cy} A ${r - 30} ${r - 30} 0 0 1 ${cx + r - 30} ${cy}" fill="none" stroke="white" stroke-width="6" opacity="0.2" stroke-linecap="round"/>
  ${dots}
  <text x="${cx}" y="${cy + 12}" text-anchor="middle" dominant-baseline="middle" font-family="Arial Black,Impact,sans-serif" font-size="${fsize}" font-weight="900" fill="white" stroke="#1a1a1a" stroke-width="3" paint-order="stroke fill" letter-spacing="2">${esc(initial)}</text>
  <rect x="${cx - 36}" y="${cy + r - 55}" width="72" height="28" rx="14" fill="white" stroke="#1a1a1a" stroke-width="2"/>
  <text x="${cx}" y="${cy + r - 33}" text-anchor="middle" dominant-baseline="middle" font-family="Arial Black,Courier New,monospace" font-size="16" font-weight="900" fill="#1a1a1a">#${esc(t.number)}</text>
  ${catLabel ? `<text x="${cx}" y="${cy - r + 35}" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="10" font-weight="900" fill="white" stroke="#1a1a1a" stroke-width="1" paint-order="stroke fill" letter-spacing="1">${esc(catLabel)}</text>` : ""}
  ${isPending ? `<text x="${cx}" y="${cy + r - 10}" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" font-weight="700" fill="${STATUS_COLORS.pending_visual_check}" opacity="0.9">PENDING CHECK</text>` : ""}
  <text x="${cx}" y="28" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="11" font-weight="900" fill="white" stroke="#1a1a1a" stroke-width="1" opacity="0.9" letter-spacing="2" paint-order="stroke fill">${cfg.label}</text>
</svg>`
}

const TAZOS: TazoDef[] = [
  // --- Minimon Tazos 1 #1-51 ---
  ...[
    "1|Bulbasaur","2|Charmander","3|Squirtle","4|Metapod","5|Weedle",
    "6|Pidgeotto","7|Rattata","8|Spearow","9|Arbok","10|Pikachu",
    "11|Raichu","12|NidoranF","13|Nidorina","14|Vulpix","15|Jigglypuff",
    "16|Golbat","17|Oddish","18|Paras","19|Venonat","20|Diglett",
    "21|Meowth","22|Psyduck","23|Mankey","24|Growlithe","25|Poliwag",
    "26|Kadabra","27|Machamp","28|Bellsprout","29|Tentacool","30|Geodude",
    "31|Ponyta","32|Slowpoke","33|Magnemite","34|Grimer","35|Gastly",
    "36|Drowzee","37|Krabby","38|Voltorb","39|Exeggcute","40|Cubone",
    "41|Koffing","42|Rhydon","43|Horsea","44|Goldeen","45|Staryu",
    "46|Magikarp","47|Eevee","48|Omanyte","49|Kabuto","50|Dragonair","51|Ash",
  ].map(s => {
    const [n, name] = s.split("|")
    return { slug: `minimon-t1-${n}`, name, number: n, franchise: "minimon" as const, sourceStatus: "verified" }
  }),

  // --- DBZ Tazos Normales #1-10 ---
  ...[
    "1|Freezer","2|Recoome","3|Ginyu","4|Burter","5|Dodoria",
    "6|Ghourd","7|Saibaman","8|A-19","9|Spopovich","10|Yamu",
  ].map(s => {
    const [n, name] = s.split("|")
    return { slug: `dracobell-t-${n}`, name, number: n, franchise: "dragon-ball-z" as const, category: "tazos", sourceStatus: "verified" }
  }),

  // --- DBZ Supertazos Voladores #11-30 ---
  ...[
    "11|Babidi","12|Piccolo Jr","13|Spopovitch","14|Son Goku","15|Gotten y Trunks",
    "16|Yakon","17|Satan","18|Videl","19|Pui-Pui","20|Kibito",
    "21|Kaio-Shin","22|Celula Jr","23|Son Gohan","24|Kaito","25|A-16",
    "26|Chi-Chi","27|A-18","28|Freezer","29|Yamu","30|Bulma",
  ].map(s => {
    const [n, name] = s.split("|")
    return { slug: `dracobell-sv-${n}`, name, number: n, franchise: "dragon-ball-z" as const, category: "supertazos_voladores", sourceStatus: "verified" }
  }),

  // --- DBZ Supertazos Octogonales #31-50 ---
  ...[
    "31|Celula 1F","32|Pui-Pui","33|Celula 2F","34|Yakon","35|A-16",
    "36|King Cold","37|Celula 3F","38|Dabura","39|Majin Boo","40|Babidi",
    "41|Vegeta","42|Videl","43|Son Gotten","44|Trunks","45|Piccolo Junior",
    "46|Son Goku","47|Kaio-Shin","48|Son Gohan","49|Kibito","50|Kaito",
  ].map(s => {
    const [n, name] = s.split("|")
    return { slug: `dracobell-so-${n}`, name, number: n, franchise: "dragon-ball-z" as const, category: "supertazos_octogonales", sourceStatus: "verified" }
  }),

  // --- DBZ Megatazos Redondos #51-70 ---
  ...[
    "51|Son Goku","52|Vegeta","53|Son Gohan","54|Son Gotten","55|Trunks",
    "56|Piccolo Jr","57|Celula","58|Majin Boo","59|Babidi","60|Dabura",
    "61|Kibito","62|Satan","63|Shin Sama","64|Kaio-Shin","65|Videl",
    "66|Bulma","67|Krilin","68|Mutenroshi","69|Pui-Pui","70|Kaito",
  ].map(s => {
    const [n, name] = s.split("|")
    return { slug: `dracobell-mr-${n}`, name, number: n, franchise: "dragon-ball-z" as const, category: "megatazos", sourceStatus: "partial" }
  }),

  // --- DBZ Megatazos Octogonales #51-70 ---
  ...[
    "51|Son Goku","52|Vegeta","53|Son Gohan","54|Son Gotten","55|Trunks",
    "56|Piccolo Jr","57|Celula","58|Majin Boo","59|Babidi","60|Dabura",
    "61|Kibito","62|Satan","63|Shin Sama","64|Kaio-Shin","65|Videl",
    "66|Bulma","67|Krilin","68|Mutenroshi","69|Pui-Pui","70|Kaito",
  ].map(s => {
    const [n, name] = s.split("|")
    return { slug: `dracobell-mo-${n}`, name, number: n, franchise: "dragon-ball-z" as const, category: "megatazos", sourceStatus: "partial" }
  }),

  // --- DBZ Holo 3D Ranura Derecha #1-10 ---
  ...[
    "1|Celula","2|Son Goku","3|Son Gohan","4|Son Gotten","5|Gotten y Trunks",
    "6|Vegeta","7|Majin Boo","8|Dabura","9|Goku","10|Celula y Trunks",
  ].map(s => {
    const [n, name] = s.split("|")
    return { slug: `dracobell-hr-${n}`, name, number: n, franchise: "dragon-ball-z" as const, category: "holo_3d", sourceStatus: "verified" }
  }),

  // --- DBZ Holo 3D Ranura Izquierda #1-10 ---
  ...[
    "1|Celula","2|Son Goku","3|Son Gohan","4|Son Gotten","5|Gotten y Trunks",
    "6|Vegeta","7|Majin Boo","8|Dabura","9|Goku","10|Celula y Trunks",
  ].map(s => {
    const [n, name] = s.split("|")
    return { slug: `dracobell-hl-${n}`, name, number: n, franchise: "dragon-ball-z" as const, category: "holo_3d", sourceStatus: "verified" }
  }),

  // --- DBZ Mastertazos ---
  { slug: "dracobell-master-master-a18", name: "A-18", number: "MASTER-A18", franchise: "dragon-ball-z" as const, category: "mastertazos", sourceStatus: "verified" },
  { slug: "dracobell-master-master-a18-gold", name: "A-18 Dorado", number: "MASTER-A18-GOLD", franchise: "dragon-ball-z" as const, category: "mastertazos", sourceStatus: "verified" },
  { slug: "dracobell-master-master-a18-black", name: "A-18 B.Negro", number: "MASTER-A18-BLACK", franchise: "dragon-ball-z" as const, category: "mastertazos", sourceStatus: "verified" },
  { slug: "dracobell-master-master-freezer", name: "Freezer", number: "MASTER-FREEZER", franchise: "dragon-ball-z" as const, category: "mastertazos", sourceStatus: "verified" },
  { slug: "dracobell-master-master-goku", name: "Goku", number: "MASTER-GOKU", franchise: "dragon-ball-z" as const, category: "mastertazos", sourceStatus: "verified" },
  { slug: "dracobell-master-master-shenron", name: "Shenron", number: "MASTER-SHENRON", franchise: "dragon-ball-z" as const, category: "mastertazos", sourceStatus: "verified" },
  { slug: "dracobell-master-master-shenron-black", name: "Shenron B.Negro", number: "MASTER-SHENRON-BLACK", franchise: "dragon-ball-z" as const, category: "mastertazos", sourceStatus: "verified" },
  { slug: "dracobell-master-master-vegeta", name: "Vegeta", number: "MASTER-VEGETA", franchise: "dragon-ball-z" as const, category: "mastertazos", sourceStatus: "verified" },
]

for (let i = 1; i <= 150; i++) {
  const n = String(i)
  TAZOS.push({
    slug: `cybermon-mb-${n}`, name: null, number: n,
    franchise: "cybermon", category: "caps", sourceStatus: "pending_visual_check",
  })
}

let generated = 0, skipped = 0
for (const tazo of TAZOS) {
  const dirName = tazo.franchise === "dragon-ball-z" ? "dracobell" : tazo.franchise
  const outPath = join(OUT_DIR, dirName, `${tazo.slug}.svg`)
  if (existsSync(outPath)) { skipped++; continue }
  writeFileSync(outPath, buildSvg(tazo), "utf-8")
  generated++
}
console.log(`Generated ${generated} SVGs, ${skipped} already existed. Total: ${TAZOS.length}`)
