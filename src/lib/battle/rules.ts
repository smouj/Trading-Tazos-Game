// ============================================================
// Trading Tazos Game — Official Battle Rules v1.0
//
// SINGLE SOURCE OF TRUTH for all game rules.
// Every constant used by the FSM, HUD, lobby, and docs
// MUST reference this file. No hardcoded numbers anywhere.
// ============================================================

// ── Deck Rules ──
export const DECK_SIZE = 20
export const STARTING_HAND = 5
export const DRAW_PER_TURN = 1
export const MIN_HAND_SIZE = 1

// ── Win Condition ──
export const SCORE_TO_WIN = 5 // First to 5 captures wins
export const ELIMINATION_WIN_ENABLED = true // Also win if opponent runs out of tazos

// ── Betting ──
export const MAX_BET_TAZOS = 1 // Each player stakes 1 tazo per round

// ── Slam Physics Defaults ──
export const DEFAULT_VERTICAL_FORCE = 0.7
export const DEFAULT_TIMING_ACCURACY = 0.7
export const DEFAULT_AIM_PRECISION = 0.7
export const DEFAULT_SPIN_INTENSITY = 0.5
export const DEFAULT_TILT_INTENSITY = 0.3
export const DEFAULT_TILT_DIRECTION: "flat" = "flat"

// ── Arena Defaults ──
export const ARENA_RADIUS = 3.0
export const ARENA_HEIGHT = 0.15
export const ARENA_WALL_HEIGHT = 0.25
export const LAUNCHER_HEIGHT = 2.8 // Height above arena where launcher spawns
export const LAUNCHER_FALL_SPEED = 0.06

// ── Scoring ──
export const FLIP_POINTS = 1 // Capturing opponent's tazo = +1
export const RING_OUT_PENALTY = 0 // Knocked out = 0 points
export const SECURE_BONUS = 0 // Keeping your own tazo = 0 bonus

// ── AI Timing (milliseconds) ──
export const AI_THINK_MIN = 600
export const AI_THINK_MAX = 1200
export const AI_AIM_MIN = 800
export const AI_AIM_MAX = 1400
export const AI_CHARGE_MIN = 700
export const AI_CHARGE_MAX = 1200

// ── Tutorial ──
export const TUTORIAL_ENABLED = true
export const TUTORIAL_FIRST_VISIT_ONLY = true

// ── Persistence ──
export const AUTO_SAVE_ON_MATCH_END = true

// ── Derived: Total deck composition ──
export function isValidDeckSize(count: number): boolean {
  return count === DECK_SIZE
}

export function isValidStartingHand(count: number): boolean {
  return count === STARTING_HAND
}

export function hasWonByScore(score: number): boolean {
  return score >= SCORE_TO_WIN
}
