// ============================================================
// TTG Leveling System
// XP formulas, level thresholds, and reward tables
// ============================================================

export interface LevelInfo {
  level: number
  currentXp: number
  xpToNext: number
  totalXpForNext: number
  progress: number // 0-100
}

/** XP required to reach a given level (cumulative) */
export function xpForLevel(level: number): number {
  // Progressive curve: 100 * level * (level + 1) / 2
  // Level 1→2: 100, 2→3: 200, 3→4: 300, etc.
  return Math.floor(100 * level * (level + 1) / 2)
}

/** XP needed to go from current level to next */
export function xpToNextLevel(level: number): number {
  return xpForLevel(level + 1) - xpForLevel(level)
}

/** Calculate level from total XP */
export function levelFromXp(totalXp: number): number {
  let level = 1
  while (xpForLevel(level) <= totalXp) {
    level++
  }
  return Math.max(1, level - 1)
}

/** Build full level info object */
export function getLevelInfo(totalXp: number): LevelInfo {
  const level = levelFromXp(totalXp)
  const currentLevelXp = xpForLevel(level)
  const nextLevelXp = xpForLevel(level + 1)
  const xpInCurrentLevel = totalXp - currentLevelXp
  const xpNeeded = xpToNextLevel(level)
  const progress = Math.min(100, Math.round((xpInCurrentLevel / xpNeeded) * 100))

  return {
    level,
    currentXp: xpInCurrentLevel,
    xpToNext: xpNeeded,
    totalXpForNext: nextLevelXp,
    progress,
  }
}

/** XP rewards for different actions */
export const XP_REWARDS = {
  BATTLE_WIN: 50,
  BATTLE_LOSS: 10,
  BAG_OPENED: 5,
  QUEST_COMPLETED: 80,
  DAILY_LOGIN: 15,
  PERFECT_THROW: 25,
  COLLECT_NEW_TAZO: 10,
  DECK_CREATED: 20,
  ACHIEVEMENT_UNLOCKED: 100,
  TRADE_COMPLETED: 30,
} as const

/** Level titles (unlocked at specific levels) */
export const LEVEL_TITLES: Record<number, string> = {
  1: "Rookie Collector",
  5: "Battle Novice",
  10: "Arena Fighter",
  15: "Tazo Hunter",
  20: "Deck Master",
  25: "Series Champion",
  30: "Arena Legend",
  40: "Grand Master",
  50: "Tazo King",
  75: "Mythic Collector",
  100: "Titan of Tazos",
}

/** Get title for a given level */
export function getTitleForLevel(level: number): string {
  const thresholds = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a)
  for (const threshold of thresholds) {
    if (level >= threshold) return LEVEL_TITLES[threshold]
  }
  return "Rookie Collector"
}
