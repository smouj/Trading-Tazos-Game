// ============================================================
// game-physics — Battle physics engine
//
// Pure physics functions: slam simulation, collision detection,
// flip resolution, impact scoring. Depends on game-core types.
//
// Current implementation lives in src/lib/battle/game-loop.ts.
// This package re-exports for now; implementation will move here
// as the engine is decoupled from React/Next.js.
// ============================================================

// Re-export all physics-relevant types and functions
export {
  type TazoCard,
  type StakedTazo,
  type SlamParams,
  type AirborneTazo,
  type TiltDirection,
  type HitZone,
  type ImpactResult,
  type Arena3DConfig,
  HIT_ZONE_CONFIG,
  DEFAULT_ARENA_3D,
  simulateSlam,
  scoreBettingImpact,
  scoreImpact,
  generateAISlam,
  createAirborneTazo,
  placeStakedTazos,
  coinFlip,
} from "@/lib/battle/game-loop"

// Game-core types that physics depends on
export { DECK_SIZE, STARTING_HAND_SIZE, DRAW_PER_TURN, GAME_RULES } from "@/lib/game-core"

// Arena presets
export {
  LAVA_PIT_ARENA,
  CRYSTAL_CAVE_ARENA,
  ZERO_G_ARENA,
  ARENA_PRESETS,
} from "@/lib/battle/game-loop"
