// ============================================================
// Trading Tazos Game — Deterministic RNG (Mulberry32)
//
// Seed-based pseudo-random number generator for deterministic
// replays. Use createRNG(seed) to get an RNG instance.
// The global instance is used by default for non-replay games.
// ============================================================

export interface RNG {
  /** Returns a float in [0, 1) like Math.random() */
  random(): number
  /** Returns an integer in [min, max] inclusive */
  int(min: number, max: number): number
  /** Shuffles an array in place (Fisher-Yates) and returns it */
  shuffle<T>(arr: T[]): T[]
  /** Returns the current seed */
  getSeed(): number
}

/** Mulberry32 — fast, good-enough quality for gameplay */
function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createRNG(seed?: number): RNG {
  const s = seed ?? (Date.now() ^ (Math.random() * 0xffffffff))

  // If seed is not an integer, derive one
  const actualSeed = seed !== undefined ? seed : Math.floor(Math.random() * 0x7fffffff)

  const next = mulberry32(actualSeed)

  return {
    random: next,
    int(min: number, max: number): number {
      return min + Math.floor(next() * (max - min + 1))
    },
    shuffle<T>(arr: T[]): T[] {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
      }
      return a
    },
    getSeed(): number {
      return actualSeed
    },
  }
}

// ── Global RNG (for normal gameplay, not deterministic) ──
let _globalRNG: RNG | null = null

export function getGlobalRNG(): RNG {
  if (!_globalRNG) {
    _globalRNG = createRNG()
  }
  return _globalRNG
}

export function resetGlobalRNG(seed?: number): RNG {
  _globalRNG = createRNG(seed)
  return _globalRNG
}
