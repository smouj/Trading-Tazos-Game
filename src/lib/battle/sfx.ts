// ============================================================
// Battle SFX — Thin wrapper around the main SFX engine
// Delegates to Kenney CC0 sounds via sfx-engine.ts
// ============================================================

import { playSFX, sfxEnsureUnlocked } from "@/lib/audio/sfx-engine"
import type { SFXName } from "@/lib/audio/sfx-engine"

type SfxType =
  | "aim_tick"       // fast blip during reticle movement
  | "aim_lock"       // satisfying click when target locked
  | "charge_start"   // low hum that builds
  | "charge_peak"    // high-pitched whine at max charge
  | "slam_launch"    // whoosh as tazo launches
  | "slam_impact"    // heavy crash on impact
  | "tazo_flip"      // metallic ting on flip
  | "tazo_secure"    // triumphant ding when secured
  | "score_pop"      // bubble pop for score
  | "damage_taken"   // low thud for damage
  | "victory_fanfare" // ascending melody
  | "defeat_sting"    // descending tone
  | "countdown_beep"  // 3-2-1 beep
  | "battle_start"   // fight bell
  | "ui_click"       // button press

// Map battle SFX types to main SFX names with custom settings
const BATTLE_SFX_MAP: Record<SfxType, { name: SFXName; vol: number; pitch?: number }> = {
  aim_tick:        { name: "tick",  vol: 0.12, pitch: 1.5 },
  aim_lock:        { name: "click", vol: 0.3,  pitch: 1.2 },
  charge_start:    { name: "woosh", vol: 0.15, pitch: 0.6 },
  charge_peak:     { name: "woosh", vol: 0.2,  pitch: 1.8 },
  slam_launch:     { name: "woosh", vol: 0.3,  pitch: 1.4 },
  slam_impact:     { name: "battle_hit", vol: 0.45 },
  tazo_flip:       { name: "click", vol: 0.2,  pitch: 1.8 },
  tazo_secure:     { name: "tazo_collect", vol: 0.35 },
  score_pop:       { name: "tick",  vol: 0.2,  pitch: 2.0 },
  damage_taken:    { name: "battle_hit", vol: 0.25, pitch: 0.7 },
  victory_fanfare: { name: "battle_victory", vol: 0.4 },
  defeat_sting:    { name: "battle_defeat", vol: 0.35 },
  countdown_beep:  { name: "tick",  vol: 0.2,  pitch: 1.0 },
  battle_start:    { name: "unlock", vol: 0.35 },
  ui_click:        { name: "click", vol: 0.2 },
}

export function playSfx(type: SfxType, volume = 0.3) {
  try {
    const mapping = BATTLE_SFX_MAP[type]
    if (!mapping) return

    playSFX(mapping.name, {
      volume: volume * mapping.vol, // User volume scales the base volume
      pitch: mapping.pitch ?? 1.0,
    })
  } catch {
    // Audio not available — silent fail
  }
}

// charge_start creates a persistent hum — we can't really do that with
// sample-based sounds, so we just play a short whoosh and return a
// dummy object that does nothing on stop.
export function stopSfx(_o: unknown) {
  // No-op: sample-based sounds are self-terminating
}

export function isSfxAvailable(): boolean {
  return typeof AudioContext !== "undefined"
    || typeof (window as any).webkitAudioContext !== "undefined"
}

export function warmSfx() {
  sfxEnsureUnlocked()
}
