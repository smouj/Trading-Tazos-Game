// ============================================================
// Trading Tazos Game — AI Player v2
//
// Human-like timing per phase (spec ranges):
//   think:  600-1200ms
//   aim:    800-1400ms
//   charge: 700-1200ms
//   total:  2100-3800ms
//
// Timing varies by difficulty:
//   novice:  slower, less accurate
//   skilled: moderate
//   master:  fast, precise
// ============================================================

import type {
  TazoCard, AIDifficulty, SlamParams,
  StakedTazo, Arena3DConfig, ImpactResult,
} from "./game-loop"
import {
  generateAISlam, simulateSlam, scoreBettingImpact, DEFAULT_ARENA_3D,
} from "./game-loop"
import { autoSelectOpponentBet } from "./state-machine"
import type { BattleContext } from "./state-machine"

// ────────────────────────────────────────
// AI Timing by Difficulty
// ────────────────────────────────────────

export interface AITiming {
  think: number      // Stake/bet selection delay
  select: number     // Tazo selection delay
  aim: number        // Aiming delay
  charge: number     // Charging delay
}

const TIMING_BY_DIFFICULTY: Record<AIDifficulty, AITiming> = {
  novice:     { think: 1000, select: 800,  aim: 1200, charge: 1000 },
  skilled:    { think: 700,  select: 500,  aim: 900,  charge: 800 },
  master:     { think: 400,  select: 300,  aim: 600,  charge: 500 },
}

export function getAITiming(difficulty: AIDifficulty): AITiming {
  const base = TIMING_BY_DIFFICULTY[difficulty]
  // Add ±30% variance for human feel
  const vary = () => 0.7 + Math.random() * 0.6 // 0.7-1.3
  return {
    think:  Math.round(base.think  * vary()),
    select: Math.round(base.select * vary()),
    aim:    Math.round(base.aim    * vary()),
    charge: Math.round(base.charge * vary()),
  }
}

// ────────────────────────────────────────
// AI Bet Selection
// ────────────────────────────────────────

export function selectAIBet(ctx: BattleContext): TazoCard | null {
  return autoSelectOpponentBet(ctx)
}

// ────────────────────────────────────────
// AI Launcher Selection (for slam)
// ────────────────────────────────────────

export function selectAILauncher(ctx: BattleContext): TazoCard | null {
  const hand = ctx.opponentHand
  if (hand.length === 0) return null

  const diff = ctx.config.aiDifficulty
  // Don't pick the staked tazo (it's on the arena face-down)
  const betId = ctx.opponentBetTazo?.id
  const available = hand.filter(t => t.id !== betId)

  if (diff === "master") {
    // Pick highest attack tazo
    return available.sort((a, b) => b.attack - a.attack)[0]
  }
  if (diff === "skilled") {
    // Pick balanced tazo
    return available.sort((a, b) => (b.attack + b.precision) - (a.attack + a.precision))[0]
  }
  // Novice: random
  return available[Math.floor(Math.random() * available.length)]
}

// ────────────────────────────────────────
// AI Slam Parameters
// ────────────────────────────────────────

export function generateAISlamParams(ctx: BattleContext): SlamParams | null {
  const aiTazo = selectAILauncher(ctx)
  if (!aiTazo) return null

  const scoreGap = ctx.opponent.score - ctx.player.score
  return generateAISlam(
    aiTazo,
    ctx.stakedTazos,
    ctx.config.arena,
    ctx.config.aiDifficulty,
    scoreGap
  )
}

// ────────────────────────────────────────
// AI Slam Simulation (returns impact)
// ────────────────────────────────────────

export function simulateAISlam(ctx: BattleContext): {
  impact: ImpactResult
  staked: StakedTazo[]
  launcher: TazoCard
  params: SlamParams
} | null {
  const aiTazo = selectAILauncher(ctx)
  if (!aiTazo) return null

  const scoreGap = ctx.opponent.score - ctx.player.score
  const params = generateAISlam(
    aiTazo, ctx.stakedTazos, ctx.config.arena,
    ctx.config.aiDifficulty, scoreGap
  )

  const defendersMap = new Map<string, TazoCard>()
  for (const dt of [...ctx.config.playerDeck, ...ctx.config.opponentDeck]) {
    defendersMap.set(dt.id, dt)
  }

  const { result: impact, staked } = simulateSlam(
    aiTazo, params, ctx.stakedTazos, ctx.config.arena, "opponent", defendersMap
  )

  return { impact, staked, launcher: aiTazo, params }
}
