// ============================================================
// Trading Tazos Game — Rapier Physics Mode (Experimental)
//
// Parallel physics engine using @dimforge/rapier3d.
// DISABLED by default — enable via NEXT_PUBLIC_RAPIER=true.
//
// When enabled, replaces the simple geometric physics in
// game-loop.ts (simulateSlam) with Rapier's rigid-body
// simulation for realistic tazo disc collisions.
//
// Install: npm install @dimforge/rapier3d-compat
// ============================================================

import { SCORE_TO_WIN } from "./rules"

// ── Feature flag ──
const isRapierEnabled = () =>
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_RAPIER === "true"

// ── Types ──
export interface RapierPhysicsConfig {
  gravity: [number, number, number]
  discRestitution: number // bounciness 0-1
  discFriction: number
  arenaRadius: number
  arenaWallHeight: number
}

export const DEFAULT_RAPIER_CONFIG: RapierPhysicsConfig = {
  gravity: [0, -9.81, 0],
  discRestitution: 0.3,
  discFriction: 0.6,
  arenaRadius: 3.0,
  arenaWallHeight: 0.25,
}

// ── Placeholder — actual Rapier integration deferred ──
// This module exists to separate the physics concern and
// provide a clean API for future Rapier-based simulation.

export async function initRapierPhysics(): Promise<boolean> {
  if (!isRapierEnabled()) return false

  try {
    const RAPIER = await import("@dimforge/rapier3d-compat")
    await RAPIER.default.init()
    console.log("[TTG] Rapier physics initialized (experimental)")
    return true
  } catch {
    console.warn("[TTG] Rapier not installed — run: npm install @dimforge/rapier3d-compat")
    return false
  }
}

export function isRapierAvailable(): boolean {
  return isRapierEnabled()
}

// Stub: would replace simulateSlam() in game-loop.ts
export async function simulateSlamRapier(
  _config: RapierPhysicsConfig,
  _params: {
    launcherPosition: [number, number, number]
    launcherVelocity: [number, number, number]
    targetPosition: [number, number, number]
  }
): Promise<{
  didFlip: boolean
  didRingOut: boolean
  finalPosition: [number, number, number]
  impactForce: number
}> {
  // Placeholder — returns realistic defaults
  return {
    didFlip: Math.random() > 0.5,
    didRingOut: false,
    finalPosition: [0, 0.1, 0],
    impactForce: 0.7,
  }
}
