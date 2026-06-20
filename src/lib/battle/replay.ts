// ============================================================
// Trading Tazos Game — Replay System
//
// Records all FSM transitions + RNG seed for deterministic
// replay. Each frame captures the event and timestamp.
// To replay: load the seed into createRNG(), feed events back
// through the FSM with exact same timing.
// ============================================================

import type { BattleEvent } from "./state-machine"
import type { RNG } from "./rng"

export interface ReplayFrame {
  /** Milliseconds since match start */
  timestamp: number
  /** FSM event that occurred */
  event: BattleEvent
  /** Optional: event payload for parameterized events */
  payload?: Record<string, unknown>
}

export interface ReplayData {
  /** Version of replay format */
  version: 1
  /** RNG seed used for this match */
  seed: number
  /** Match config summary (for UI display) */
  meta: {
    mode: string
    aiDifficulty: string
    playerDeckName: string
    opponentDeckName: string
    startedAt: string
    duration: number
  }
  /** Recorded frames */
  frames: ReplayFrame[]
  /** Final match result */
  result?: {
    winner: string
    victoryType: string
    playerScore: number
    opponentScore: number
    summary: string
  }
}

export class ReplayRecorder {
  private frames: ReplayFrame[] = []
  private seed: number
  private startTime: number = 0

  constructor(seed: number) {
    this.seed = seed
  }

  /** Call at match start */
  start(): void {
    this.startTime = Date.now()
    this.frames = []
  }

  /** Record a transition event */
  record(event: BattleEvent, payload?: Record<string, unknown>): void {
    this.frames.push({
      timestamp: Date.now() - this.startTime,
      event,
      payload,
    })
  }

  /** Export the replay data */
  export(): ReplayData {
    return {
      version: 1,
      seed: this.seed,
      meta: {
        mode: "practice",
        aiDifficulty: "novice",
        playerDeckName: "",
        opponentDeckName: "",
        startedAt: new Date(this.startTime).toISOString(),
        duration: Date.now() - this.startTime,
      },
      frames: this.frames,
    }
  }

  /** Serialize to JSON string */
  serialize(): string {
    return JSON.stringify(this.export())
  }
}

export function deserializeReplay(json: string): ReplayData | null {
  try {
    const data = JSON.parse(json) as ReplayData
    if (data.version !== 1) return null
    if (!Array.isArray(data.frames)) return null
    return data
  } catch {
    return null
  }
}

/** Play back replay frames with timing */
export async function* replayFrames(
  data: ReplayData
): AsyncGenerator<ReplayFrame, void, void> {
  let lastTimestamp = 0
  for (const frame of data.frames) {
    const delay = frame.timestamp - lastTimestamp
    if (delay > 0) {
      await new Promise(r => setTimeout(r, Math.min(delay, 100)))
    }
    yield frame
    lastTimestamp = frame.timestamp
  }
}
