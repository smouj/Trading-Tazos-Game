// ============================================================
// game-physics/slam.ts — Core slam simulation
//
// Pure physics: collision detection, flip resolution,
// impact scoring. No side effects, no I/O, no UI.
// ============================================================

import { DECK_SIZE, STARTING_HAND_SIZE, DRAW_PER_TURN } from "@ttg/game-core"

// ── Types (local for now — migrating from game-loop.ts) ──

export interface TazoCard {
  id: string; name: string; slug: string; franchise: string; imageUrl: string | null
  attack: number; defense: number; resistance: number; weight: number
  stability: number; spin: number; control: number; bounce: number; precision: number
  wear?: number; shine?: number; variant?: string; finish?: string
}

export interface StakedTazo {
  id: string; tazoName: string; franchise: string
  imageUrl: string; backImageUrl: string; owner: "player" | "opponent"
  position: [number, number, number]
  state: "face_down" | "wobbling" | "flipped" | "captured" | "ring_out"
  wobbleIntensity: number; scored: boolean
}

export interface SlamParams {
  tazoId: string; impactX: number; impactZ: number
  verticalForce: number; timingAccuracy: number
  tilt: string; tiltIntensity: number; spinIntensity: number; aimPrecision: number
}

export interface ImpactResult {
  impactForce: number; hitZone: "CENTER" | "EDGE" | "RIM" | "MISS"
  captureChance: number; ringoutChance: number
}

export interface Arena3DConfig {
  radius: number; maxLaunchHeight: number; gravity: number
  ringOutThreshold: number; impactDamping: number; minFlipForce: number; tableFriction: number
  name?: string; description?: string; theme?: "default" | "lava" | "crystal" | "zero-g"
}

// ── Constants ──

export const DEFAULT_ARENA_3D: Arena3DConfig = {
  radius: 1.5, maxLaunchHeight: 3, gravity: 9.8,
  ringOutThreshold: 1.2, impactDamping: 0.95, minFlipForce: 30, tableFriction: 0.98,
}

export const HIT_ZONE_CONFIG = {
  CENTER: { minRadius: 0, maxRadius: 0.15, flipMultiplier: 2.0, captureBonus: 0.25 },
  EDGE: { minRadius: 0.15, maxRadius: 0.35, flipMultiplier: 1.3, captureBonus: 0.1 },
  RIM: { minRadius: 0.35, maxRadius: 0.5, flipMultiplier: 0.7, captureBonus: -0.15 },
  MISS: { minRadius: 0.5, maxRadius: Infinity, flipMultiplier: 0.0, captureBonus: -0.5 },
} as const

// ── Helpers ──

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1)
}

// ── Slam Physics ──

export function simulateSlam(
  launcher: TazoCard,
  params: SlamParams,
  staked: StakedTazo[],
  arena: Arena3DConfig,
  thrower: string,
  defenders?: Map<string, TazoCard>
): { result: ImpactResult; staked: StakedTazo[] } {
  if (staked.length === 0) {
    return {
      result: { impactForce: 0, hitZone: "MISS", captureChance: 0, ringoutChance: 0 },
      staked: [],
    }
  }

  // 1. Determine hit zone from aim precision
  const aimRoll = Math.random() * (1 - params.aimPrecision * 0.6)
  const launcherControl = launcher.control / 100
  const adjustedAim = clamp(aimRoll - launcherControl * 0.15, 0, 1)

  let hitZone: "CENTER" | "EDGE" | "RIM" | "MISS"
  if (adjustedAim < 0.15) hitZone = "CENTER"
  else if (adjustedAim < 0.35) hitZone = "EDGE"
  else if (adjustedAim < 0.55) hitZone = "RIM"
  else hitZone = "MISS"

  if (hitZone === "MISS") {
    return {
      result: { impactForce: 0, hitZone: "MISS", captureChance: 0, ringoutChance: 0 },
      staked,
    }
  }

  // 2. Calculate base impact force
  const zoneConfig = HIT_ZONE_CONFIG[hitZone]
  const baseForce = params.verticalForce * 100 * params.timingAccuracy
  const attackFactor = launcher.attack / 100
  const weightFactor = launcher.weight / 100
  const impactForce = baseForce * (0.5 + attackFactor * 0.5) * (0.8 + weightFactor * 0.2)

  // 3. Apply arena gravity modifier
  const gravityFactor = arena.gravity / 9.8
  const effectiveForce = impactForce * gravityFactor

  if (effectiveForce < arena.minFlipForce * 0.5) {
    return {
      result: { impactForce: effectiveForce, hitZone, captureChance: 0, ringoutChance: 0 },
      staked,
    }
  }

  // 4. Resolve each staked tazo
  const defendersMap = defenders || new Map()
  const newStaked = staked.map(s => {
    if (s.state === "captured" || s.state === "ring_out") return s

    // Distance from impact point
    const dx = s.position[0] - params.impactX
    const dz = s.position[2] - params.impactZ
    const dist = Math.sqrt(dx * dx + dz * dz)

    // Force falls off with distance
    const maxRadius = hitZone === "CENTER" ? 0.15 : hitZone === "EDGE" ? 0.35 : 0.5
    const distanceFactor = dist <= maxRadius ? 1 : Math.max(0, 1 - (dist - maxRadius) / 0.5)
    const localForce = effectiveForce * distanceFactor

    if (localForce < arena.minFlipForce * 0.3) return s

    // Check defender stats
    const defender = defendersMap.get(s.id)
    const defense = defender ? defender.defense / 100 : 0.4
    const stability = defender ? defender.stability / 100 : 0.4
    const weight = defender ? defender.weight / 100 : 0.5
    const wear = defender && defender.wear ? defender.wear / 100 : 0

    // Worn tazos resist worse
    const wearPenalty = 1 - wear * 0.6

    // Flip probability
    const flipPower = localForce * zoneConfig.flipMultiplier * wearPenalty
    const flipThreshold = (defense * 70 + stability * 20 + weight * 10) * (0.5 + Math.random() * 0.5)
    const flipProb = clamp((flipPower - flipThreshold * 0.5) / 100, 0, 0.95)

    const roll = Math.random()
    if (roll < flipProb) {
      return { ...s, state: "captured" as const, wobbleIntensity: 0 }
    } else if (roll < flipProb + 0.15) {
      return { ...s, state: "wobbling" as const, wobbleIntensity: 0.3 + Math.random() * 0.4 }
    }

    return s
  })

  const captureChance = newStaked.filter(s => s.state === "captured").length / staked.length
  const ringoutChance = newStaked.filter(s => s.state === "ring_out").length / staked.length

  return {
    result: { impactForce: effectiveForce, hitZone, captureChance, ringoutChance },
    staked: newStaked,
  }
}

// ── Impact Scoring ──

export function scoreBettingImpact(
  attackerAttack: number, defenderDefense: number, zone: string
): number {
  const zoneBonus = zone === "CENTER" ? 0.25 : zone === "EDGE" ? 0.1 : zone === "RIM" ? -0.15 : -0.5
  const atk = clamp(attackerAttack / 100, 0, 1)
  const def = clamp(defenderDefense / 100, 0, 1)
  return clamp(atk - def * 0.6 + zoneBonus, 0, 1)
}

export function scoreImpact(
  attacker: TazoCard, defender: TazoCard | null, wasCaptured: boolean
): number {
  if (!defender || !wasCaptured) return 0
  const atk = attacker.attack / 100
  const def = defender.defense / 100
  const diff = atk - def * 0.5
  return clamp(diff + 0.5, 0, 1) * 100
}

// ── Coin flip ──

export function coinFlip(): "player" | "opponent" {
  return Math.random() < 0.5 ? "player" : "opponent"
}
