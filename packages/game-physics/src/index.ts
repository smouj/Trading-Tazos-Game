// ============================================================
// game-physics — Battle physics engine
//
// Pure physics: slam simulation, collision detection,
// flip resolution, impact scoring.
// ============================================================

export {
  type TazoCard,
  type StakedTazo,
  type SlamParams,
  type ImpactResult,
  type Arena3DConfig,
  HIT_ZONE_CONFIG,
  DEFAULT_ARENA_3D,
  simulateSlam,
  scoreBettingImpact,
  scoreImpact,
  coinFlip,
} from "./slam"
