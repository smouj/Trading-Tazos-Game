// ============================================================
// Trading Tazos Game — Battle Game Loop
// Professional 3D tazo battle state machine.
// Manages: LOBBY → INTRO → AIM → POWER → SPIN → LAUNCH → PHYSICS → RESOLVE → ...
// ============================================================

import type { BattleTurn, BattleFinalResult, TazoBattleStats, ThrowResult, CollisionEvent } from "./battle-types"

// ─── Back-Art URLs ───
const BACK_ARTS: Record<string, string> = {
  minimon: "/tazos-artgen/backs/minimon-back.png",
  cybermon: "/tazos-artgen/backs/cybermon-back.png",
  dracobell: "/tazos-artgen/backs/dracobell-back.png",
}

// ─── New Game States ───
export type GameState =
  | "lobby"          // Pre-battle: mode select, deck setup
  | "intro"           // Camera flyover, player vs opponent reveal
  | "round_start"     // New round begins
  | "player_aim"      // Player aims throw direction in 3D
  | "player_power"    // Player sets throw power (timing)
  | "player_spin"     // Player selects spin type
  | "throwing"        // Launch animation in progress
  | "physics"         // Tazo sliding/bouncing/colliding
  | "resolve"         // Results of throw: hits, captures, ring-outs
  | "opponent_turn"   // AI or PvP opponent aims and throws
  | "round_end"       // Round summary
  | "match_end"       // Final results
  | "paused"

// ─── Game Mode ───
export type PlayMode = "practice" | "pvp_ranked" | "pvp_friend"

// ─── AI Difficulty ───
export type AIDifficulty = "novice" | "skilled" | "master"

// ─── Spin Type ───
export type SpinType = "topspin" | "backspin" | "sidespin" | "none"

// ─── Arena Config (3D space) ───
export interface Arena3DConfig {
  radius: number        // Arena bowl radius in world units
  surfaceFriction: number
  wallBounceFactor: number
  discToDiscBounce: number
  ringOutThreshold: number  // distance from center to be "out"
}

// ─── Tazo Card (for lobby/deck) ───
export type TazoFinish =
  | "normal"
  | "matte"
  | "glossy"
  | "holo"
  | "reverse_holo"
  | "foil"
  | "prismatic"
  | "metallic"
  | "chrome"
  | "gold"
  | "rainbow"
  | "glitter"

export type TazoCreatureVariant =
  | "standard"
  | "shiny"
  | "shadow"
  | "golden"
  | "promo"
  | "first_edition"
  | "misprint"

export interface TazoCard {
  id: string
  name: string
  slug: string
  franchise: "minimon" | "cybermon" | "dracobell"
  imageUrl: string | null
  shinyImageUrl?: string | null
  attack: number; defense: number; resistance: number
  weight: number; stability: number; spin: number
  control: number; bounce: number; precision: number
  role?: string | null
  rarity?: string
  finish?: TazoFinish
  creatureVariant?: TazoCreatureVariant
}

// ─── Player State ───
export interface PlayerGameState {
  id: "player" | "opponent"
  name: string
  deck: TazoCard[]
  hp: number
  maxHp: number
  tazosRemaining: number
  captured: number
  currentTazo: TazoCard | null
  isAI: boolean
  aiDifficulty?: AIDifficulty
}

// ─── Throw Parameters ───
export interface ThrowParams {
  tazoId: string
  aimX: number; aimY: number    // normalized -1..1 in arena space
  power: number                  // 0..1
  powerAccuracy: number          // 0..1 (1 = perfect timing)
  spinType: SpinType
  accuracyPenalty: number        // 0..1 (0 = perfect aim)
  timestamp: number
}

// ─── Physics Disc State ───
export interface DiscPhysics {
  id: string
  tazoName: string
  franchise: string
  imageUrl: string | null
  backImageUrl: string | null
  finish?: string
  position: [number, number, number]   // x, y (height), z
  velocity: [number, number, number]
  rotation: [number, number, number]   // euler angles
  angularVelocity: [number, number, number]
  facing: "front" | "back"
  state: "sliding" | "spinning" | "stopped" | "flipped" | "out_of_bounds" | "captured"
  owner: "player" | "opponent"
}

// ─── Round Result ───
export interface RoundResult {
  roundNumber: number
  throwerId: "player" | "opponent"
  discsMoved: string[]
  discsFlipped: string[]
  discsCaptured: string[]
  discsRingOut: string[]
  hpDealt: number
  description: string
}

// ─── Match Result ───
export interface MatchResult {
  winner: "player" | "opponent" | "draw"
  victoryType: "all_captured" | "hp_depleted" | "forfeit" | "draw"
  playerScore: number
  opponentScore: number
  rounds: RoundResult[]
  totalTurns: number
  playerCaptures: number
  opponentCaptures: number
  xpEarned: number
  summary: string
}

// ─── Match Config ───
export interface MatchConfig {
  mode: PlayMode
  aiDifficulty: AIDifficulty
  arena: Arena3DConfig
  rounds: number        // 0 = single elimination match
  playerDeck: TazoCard[]
  opponentDeck: TazoCard[]
}

// ─── DEFAULT ARENA ───
export const DEFAULT_ARENA_3D: Arena3DConfig = {
  radius: 4.2,
  surfaceFriction: 0.94,
  wallBounceFactor: 0.5,
  discToDiscBounce: 0.7,
  ringOutThreshold: 4.5,
}

// ─── Game loop factory ───
export function createMatch(config: MatchConfig): {
  state: GameState
  config: MatchConfig
  player: PlayerGameState
  opponent: PlayerGameState
  currentRound: number
  discStates: DiscPhysics[]
  roundHistory: RoundResult[]
  turnNumber: number
} {
  const playerDeck = config.playerDeck.slice(0, 5)
  const opponentDeck = config.opponentDeck.slice(0, 5)

  return {
    state: "lobby",
    config,
    player: {
      id: "player",
      name: "You",
      deck: playerDeck,
      hp: 100,
      maxHp: 100,
      tazosRemaining: playerDeck.length,
      captured: 0,
      currentTazo: null,
      isAI: false,
    },
    opponent: {
      id: "opponent",
      name: config.mode === "practice" ? `AI (${config.aiDifficulty})` : "Opponent",
      deck: opponentDeck,
      hp: 100,
      maxHp: 100,
      tazosRemaining: opponentDeck.length,
      captured: 0,
      currentTazo: null,
      isAI: config.mode === "practice",
      aiDifficulty: config.aiDifficulty,
    },
    currentRound: 0,
    discStates: [],
    roundHistory: [],
    turnNumber: 0,
  }
}

// ─── Throw physics simulation ───
export function simulateThrow(
  tazo: TazoCard,
  throwParams: ThrowParams,
  existingDiscs: DiscPhysics[],
  arena: Arena3DConfig
): { discs: DiscPhysics[]; result: RoundResult } {
  const { power, aimX, aimY, spinType, accuracyPenalty } = throwParams
  
  // Base velocity from power
  const baseSpeed = 2 + power * 8 // 2-10 units/sec
  
  // Accuracy affects direction
  const aimError = accuracyPenalty * 0.6
  const actualAimX = aimX + (Math.random() - 0.5) * aimError
  const actualAimY = aimY + (Math.random() - 0.5) * aimError
  
  // Direction vector (normalized)
  const dirLen = Math.sqrt(actualAimX * actualAimX + actualAimY * actualAimY)
  const normX = dirLen > 0 ? actualAimX / dirLen : 0
  const normZ = dirLen > 0 ? actualAimY / dirLen : 1
  
  // Spin affects velocity and bounce
  let spinVelocity: [number, number, number] = [0, 0, 0]
  let bounceMod = 1.0
  if (spinType === "topspin") {
    spinVelocity = [0, 0, -power * 3]
    bounceMod = 1.2
  } else if (spinType === "backspin") {
    spinVelocity = [0, 0, power * 3]
    bounceMod = 0.6
  } else if (spinType === "sidespin") {
    spinVelocity = [power * 3, 0, 0]
    bounceMod = 0.9
  }

  const velocity: [number, number, number] = [
    normX * baseSpeed,
    0,
    normZ * baseSpeed,
  ]

  const disc: DiscPhysics = {
    id: tazo.id,
    tazoName: tazo.name,
    franchise: tazo.franchise,
    imageUrl: tazo.imageUrl,
    backImageUrl: BACK_ARTS[tazo.franchise] || null,
    position: [normX * (arena.radius * 0.6), 0.08, 0.5 * arena.radius],
    velocity,
    rotation: [0, spinVelocity[2] > 0 ? Math.PI / 6 : -Math.PI / 6, 0],
    angularVelocity: spinVelocity,
    facing: "front",
    state: "sliding",
    owner: "player",
  }

  // Simulate slide/decay
  const simSteps = 60
  const dt = 0.016
  let currentPos = [...disc.position] as [number, number, number]
  let currentVel = [...disc.velocity] as [number, number, number]
  const flippedDiscs: string[] = []
  const movedDiscs: string[] = []

  for (let step = 0; step < simSteps; step++) {
    // Apply friction
    currentVel[0] *= arena.surfaceFriction
    currentVel[2] *= arena.surfaceFriction
    
    // Update position
    currentPos[0] += currentVel[0] * dt
    currentPos[2] += currentVel[2] * dt
    
    // Check bounce off walls
    const distFromCenter = Math.sqrt(currentPos[0] * currentPos[0] + currentPos[2] * currentPos[2])
    if (distFromCenter > arena.radius) {
      // Bounce inward
      const nx = -currentPos[0] / distFromCenter
      const nz = -currentPos[2] / distFromCenter
      const dot = currentVel[0] * nx + currentVel[2] * nz
      currentVel[0] = (currentVel[0] - 2 * dot * nx) * arena.wallBounceFactor * bounceMod
      currentVel[2] = (currentVel[2] - 2 * dot * nz) * arena.wallBounceFactor * bounceMod
      currentPos[0] += currentVel[0] * dt * 2
      currentPos[2] += currentVel[2] * dt * 2
    }
    
    // Check collisions with existing discs
    for (const existing of existingDiscs) {
      if (existing.state === "captured" || existing.state === "out_of_bounds") continue
      const dx = currentPos[0] - existing.position[0]
      const dz = currentPos[2] - existing.position[2]
      const dist = Math.sqrt(dx * dx + dz * dz)
      const minDist = 0.5 // disc radius approximately
      
      if (dist < minDist && dist > 0.01) {
        // Collision! Resolve
        const overlap = minDist - dist
        const pnx = dx / dist
        const pnz = dz / dist
        
        // Push existing disc
        const existingVel = existing.velocity
        const relSpeed = Math.abs(currentVel[0] * pnx + currentVel[2] * pnz) +
          Math.abs(existingVel[0] * pnx + existingVel[2] * pnz)
        
        // Move existing disc
        existing.position[0] -= pnx * overlap * 0.5
        existing.position[2] -= pnz * overlap * 0.5
        currentPos[0] += pnx * overlap * 0.5
        currentPos[2] += pnz * overlap * 0.5
        
        // Transfer momentum
        const impulse = relSpeed * arena.discToDiscBounce
        existing.velocity[0] += pnx * impulse * (power * 0.5)
        existing.velocity[2] += pnz * impulse * (power * 0.5)
        
        existing.state = "sliding"
        movedDiscs.push(existing.id)
        
        // Check if existing disc gets pushed out
        const edistFromCenter = Math.sqrt(
          existing.position[0] * existing.position[0] +
          existing.position[2] * existing.position[2]
        )
        if (edistFromCenter > arena.ringOutThreshold) {
          existing.state = "out_of_bounds"
        }
        
        // Strong hit might flip
        if (power > 0.6 && Math.random() < power * 0.5) {
          existing.facing = existing.facing === "front" ? "back" : "front"
          existing.state = "flipped"
          flippedDiscs.push(existing.id)
        }
      }
    }
    
    // Stop if very slow
    const speed = Math.sqrt(currentVel[0] * currentVel[0] + currentVel[2] * currentVel[2])
    if (speed < 0.05) {
      currentVel[0] = 0
      currentVel[2] = 0
      break
    }
  }

  disc.position = currentPos
  disc.velocity = currentVel
  disc.state = Math.sqrt(currentVel[0] * currentVel[0] + currentVel[2] * currentVel[2]) < 0.05 
    ? "stopped" : "sliding"

  // Check ring-out for thrown disc
  const finalDist = Math.sqrt(currentPos[0] * currentPos[0] + currentPos[2] * currentPos[2])
  if (finalDist > arena.ringOutThreshold) {
    disc.state = "out_of_bounds"
  }

  // Build captured (flipped + stopped discs)
  const captured: string[] = []
  for (const e of existingDiscs) {
    if (e.state === "flipped" || e.state === "out_of_bounds") {
      captured.push(e.id)
      e.state = "captured"
    }
  }
  // Ring-out on thrown disc = no capture
  if (disc.state !== "out_of_bounds") {
    existingDiscs.push(disc)
  }

  const result: RoundResult = {
    roundNumber: 1,
    throwerId: "player",
    discsMoved: movedDiscs,
    discsFlipped: flippedDiscs,
    discsCaptured: captured,
    discsRingOut: disc.state === "out_of_bounds" ? [disc.id] : [],
    hpDealt: Math.round(power * 30) + captured.length * 10,
    description: captured.length > 1
      ? `${captured.length} tazos captured!`
      : captured.length === 1
        ? "Tazo captured!"
        : disc.state === "out_of_bounds"
          ? "Ring out!"
          : "Nice aim!",
  }

  return { discs: existingDiscs, result }
}

// ─── AI Decision Engine ───
export function generateAIMove(
  aiTazo: TazoCard,
  playerDiscs: DiscPhysics[],
  aiDiscs: DiscPhysics[],
  arena: Arena3DConfig,
  difficulty: AIDifficulty
): ThrowParams {
  // Find best target (player's discs)
  const targets = playerDiscs.filter(d => d.state !== "captured" && d.state !== "out_of_bounds")
  
  let aimX = 0
  let aimY = 0
  let power = 0.5
  let accuracy = 0.7
  let spinType: SpinType = "none"

  if (targets.length === 0) {
    // No targets = random throw
    aimX = (Math.random() - 0.5) * 2
    aimY = (Math.random() - 0.5) * 2
    power = 0.4 + Math.random() * 0.4
  } else {
    // Pick a target
    const target = targets[Math.floor(Math.random() * targets.length)]
    
    // Direction toward target
    const dx = target.position[0]
    const dz = target.position[2]
    const dist = Math.sqrt(dx * dx + dz * dz)
    
    if (difficulty === "master") {
      // Perfect aim with slight variation
      aimX = (dx / arena.radius) + (Math.random() - 0.5) * 0.1
      aimY = (dz / arena.radius) + (Math.random() - 0.5) * 0.1
      power = 0.6 + Math.random() * 0.3
      accuracy = 0.9 + Math.random() * 0.1
      // Smart spin choice
      if (dist < 0.5) spinType = "topspin"
      else if (targets.length > 2) spinType = "sidespin"
      else spinType = "none"
    } else if (difficulty === "skilled") {
      // Decent aim
      aimX = (dx / arena.radius) + (Math.random() - 0.5) * 0.3
      aimY = (dz / arena.radius) + (Math.random() - 0.5) * 0.3
      power = 0.45 + Math.random() * 0.35
      accuracy = 0.7 + Math.random() * 0.2
      spinType = Math.random() > 0.5 ? "topspin" : "none"
    } else {
      // Novice: somewhat random
      aimX = (Math.random() - 0.5) * 2
      aimY = (Math.random() - 0.5) * 2
      power = 0.3 + Math.random() * 0.5
      accuracy = 0.4 + Math.random() * 0.3
    }
  }

  return {
    tazoId: aiTazo.id,
    aimX, aimY,
    power,
    powerAccuracy: accuracy,
    spinType,
    accuracyPenalty: (1 - accuracy) * 0.5,
    timestamp: Date.now(),
  }
}

// ─── Check match end conditions ───
export function checkMatchEnd(
  player: PlayerGameState,
  opponent: PlayerGameState,
  playerDiscs: DiscPhysics[],
  opponentDiscs: DiscPhysics[]
): MatchResult | null {
  const playerActive = playerDiscs.filter(d => d.state !== "captured" && d.state !== "out_of_bounds" && d.owner === "player").length
  const opponentActive = opponentDiscs.filter(d => d.state !== "captured" && d.state !== "out_of_bounds" && d.owner === "opponent").length

  if (playerActive === 0 && opponentActive === 0) {
    return {
      winner: "draw",
      victoryType: "draw",
      playerScore: 0, opponentScore: 0,
      rounds: [], totalTurns: 0,
      playerCaptures: player.captured, opponentCaptures: opponent.captured,
      xpEarned: 5,
      summary: "Draw! Both sides have no tazos left.",
    }
  }

  if (playerActive === 0) {
    return {
      winner: "opponent",
      victoryType: "all_captured",
      playerScore: player.captured, opponentScore: opponent.captured + playerActive,
      rounds: [], totalTurns: 0,
      playerCaptures: player.captured, opponentCaptures: opponent.captured,
      xpEarned: 2,
      summary: `${opponent.name} wins by capturing all your tazos!`,
    }
  }

  if (opponentActive === 0) {
    return {
      winner: "player",
      victoryType: "all_captured",
      playerScore: player.captured + opponentActive,
      opponentScore: opponent.captured,
      rounds: [], totalTurns: 0,
      playerCaptures: player.captured,
      opponentCaptures: opponent.captured,
      xpEarned: 10 + opponentActive * 5,
      summary: `Victory! You captured all of ${opponent.name}'s tazos!`,
    }
  }

  return null // Match continues
}
