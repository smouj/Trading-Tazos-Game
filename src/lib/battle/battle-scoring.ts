// ============================================================
// Trading Tazos Game — Battle Scoring
// Score calculation for competitive and rounds modes.
// ============================================================

import type { BattleScore, BattleTurn, BattleFinalResult } from "./battle-types"

const POINTS = {
  capture: 100,
  doubleCapture: 250,
  tripleCapture: 450,
  perfectHit: 50,
  effectiveRebound: 75,
  outOfBoundsPenalty: -100,
  selfFlipPenalty: -150,
  centerControlPerTurn: 25,
} as const

export function calculateScore(turns: BattleTurn[], playerSide: "player" | "opponent"): BattleScore {
  let captures = 0
  let comboCaptures = 0
  let precisionBonus = 0
  let fieldControl = 0
  let penalties = 0

  for (const turn of turns) {
    if (!turn.throwResult) continue

    const result = turn.throwResult
    const isPlayerTurn = turn.playerId === playerSide

    if (isPlayerTurn) {
      // Captures
      const captured = result.capturedTazos.length
      captures += captured * POINTS.capture
      if (captured >= 2) comboCaptures += captured >= 3 ? POINTS.tripleCapture : POINTS.doubleCapture

      // Precision
      if (result.accuracyError < 0.15) precisionBonus += POINTS.perfectHit

      // Rebound bonus
      if (result.impactedTazos.length >= 2) {
        precisionBonus += POINTS.effectiveRebound * (result.impactedTazos.length - 1)
      }

      // Penalties
      if (result.outOfBounds && result.capturedTazos.length === 0) {
        penalties += POINTS.outOfBoundsPenalty
      }
      if (result.finalState === "on_field" && result.capturedTazos.length === 0) {
        // Self-flip check: thrower went to field but didn't capture anything
        if (turn.throwResult?.flippedTazos?.includes(result.throwerId)) {
          penalties += POINTS.selfFlipPenalty
        }
      }
    }

    // Field control — bonus for having tazos near center
    if (turn.fieldStateAfter) {
      const playerFieldTazos = turn.fieldStateAfter.filter(
        (t: { x: number; y: number; owner?: string }) => {
          const dist = Math.sqrt((t.x - 300) ** 2 + (t.y - 300) ** 2)
          return dist < 100 // within center zone
        }
      )
      fieldControl += playerFieldTazos.length * POINTS.centerControlPerTurn
    }
  }

  return {
    captures,
    comboCaptures,
    precisionBonus,
    fieldControl,
    penalties,
    total: captures + comboCaptures + precisionBonus + fieldControl + penalties,
  }
}

export function calculateFinalResult(
  playerScore: BattleScore,
  opponentScore: BattleScore,
  totalTurns: number,
  playerCaptures: number,
  opponentCaptures: number,
  playerName: string,
  opponentName: string
): BattleFinalResult {
  const totalDiff = playerScore.total - opponentScore.total

  let winner: "player" | "opponent" | "draw" = "draw"
  let victoryType: BattleFinalResult["victoryType"] = "points"
  let summary = ""

  if (totalDiff > 0) {
    winner = "player"
    summary = `${playerName} wins by ${totalDiff} points!`
  } else if (totalDiff < 0) {
    winner = "opponent"
    summary = `${opponentName} wins by ${-totalDiff} points!`
  } else {
    summary = "Draw — perfectly matched!"
  }

  if (playerCaptures === 7) {
    victoryType = "all_captured"
    summary = `${playerName} captured all enemy tazos!`
  } else if (opponentCaptures === 7) {
    victoryType = "all_captured"
    summary = `${opponentName} captured all enemy tazos!`
  }

  return {
    winner,
    victoryType,
    playerScore: playerScore.total,
    opponentScore: opponentScore.total,
    totalTurns,
    playerCaptures,
    opponentCaptures,
    summary,
  }
}
