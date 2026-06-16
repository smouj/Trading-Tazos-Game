#!/usr/bin/env node
// ============================================================
// Trading Tazos Game — Image Optimizer
// Converts PNG assets to WebP to reduce public/ folder size.
//
// Usage:
//   node scripts/optimize-images.mjs [--dry-run] [--quality=85]
// ============================================================

import sharp from "sharp"
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")

const TARGET_DIRS = [
  "public/tazos-generated",
  "public/textures/bags",
  "public/tazos-tubes",
  "public/tazos-base",
  "public/tazos-backs",
  "public/tazos-artgen",
]

const DRY_RUN = process.argv.includes("--dry-run")
const QUALITY = parseInt(
  process.argv.find(a => a.startsWith("--quality="))?.split("=")[1] || "85",
  10
)

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath))
    } else if (/\.(png|jpg|jpeg)$/i.test(entry.name)) {
      files.push(fullPath)
    }
  }

  return files
}

async function optimizeDir(dir, stats) {
  const fullPath = path.join(ROOT, dir)

  try {
    await fs.access(fullPath)
  } catch {
    console.log(`  Skipping ${dir} (not found)`)
    return
  }

  const files = await walk(fullPath)
  console.log(`\n${dir} (${files.length} files)`)

  for (const file of files) {
    const outFile = file.replace(/\.(png|jpg|jpeg)$/i, ".webp")
    const relIn = path.relative(ROOT, file)
    const relOut = path.relative(ROOT, outFile)

    // Skip if WebP already exists and is newer
    try {
      const [inStat, outStat] = await Promise.all([
        fs.stat(file),
        fs.stat(outFile).catch(() => null),
      ])
      if (outStat && outStat.mtimeMs >= inStat.mtimeMs) {
        console.log(`  SKIP ${relOut} (already optimized)`)
        continue
      }
    } catch { /* ok */ }

    try {
      if (DRY_RUN) {
        const size = (await fs.stat(file)).size
        stats.originalBytes += size
        stats.filesProcessed++
        continue
      }

      const originalSize = (await fs.stat(file)).size
      await sharp(file)
        .webp({ quality: QUALITY, effort: 6 })
        .toFile(outFile)

      const webpSize = (await fs.stat(outFile)).size
      const pct = ((1 - webpSize / originalSize) * 100).toFixed(1)

      stats.originalBytes += originalSize
      stats.webpBytes += webpSize
      stats.filesProcessed++

      const origKB = (originalSize / 1024).toFixed(0)
      const webpKB = (webpSize / 1024).toFixed(0)
      console.log(`  OK  ${relOut}  ${origKB}KB -> ${webpKB}KB (${pct}%)`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      stats.errors.push(`${relIn}: ${msg}`)
      console.log(`  ERR ${relIn}: ${msg}`)
    }
  }
}

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${bytes} B`
}

async function main() {
  console.log(`TTG Image Optimizer`)
  console.log(`Quality: ${QUALITY} | Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}`)

  const stats = { filesProcessed: 0, originalBytes: 0, webpBytes: 0, errors: [] }

  for (const dir of TARGET_DIRS) {
    await optimizeDir(dir, stats)
  }

  console.log(`\n${"=".repeat(50)}`)
  console.log(`Summary:`)
  console.log(`  Files: ${stats.filesProcessed}`)
  console.log(`  Original: ${formatBytes(stats.originalBytes)}`)
  if (!DRY_RUN) {
    console.log(`  WebP:     ${formatBytes(stats.webpBytes)}`)
    const saved = stats.originalBytes - stats.webpBytes
    const pct = stats.originalBytes > 0 ? ((saved / stats.originalBytes) * 100).toFixed(1) : "0"
    console.log(`  Saved:    ${formatBytes(saved)} (${pct}%)`)
  }
  if (stats.errors.length > 0) {
    console.log(`\n${stats.errors.length} errors:`)
    stats.errors.forEach(e => console.log(`  ${e}`))
  }
  console.log("=".repeat(50))
}

main().catch(err => {
  console.error("Fatal:", err)
  process.exit(1)
})
