// ============================================================
// Trading Tazos Game — Battle HUD
// Overlay during battle: HP bars, turn info, player names.
// ============================================================
"use client"

import { Swords, Heart, Timer, Disc3 } from "lucide-react"

interface BattleHUDProps {
  playerName: string
  opponentName: string
  playerHP: number; playerMaxHP: number
  opponentHP: number; opponentMaxHP: number
  playerTazos: number
  opponentTazos: number
  playerCaptured: number
  opponentCaptured: number
  round: number
  phase: string
  turnPlayer: "player" | "opponent"
  compact?: boolean
}

const PHASE_LABELS: Record<string, string> = {
  lobby: "Pre-Game",
  intro: "Intro",
  round_start: "Round Start",
  player_aim: "Your Turn — Aim",
  player_power: "Your Turn — Power",
  player_spin: "Your Turn — Spin",
  throwing: "Throwing...",
  physics: "Resolving...",
  resolve: "Hit!",
  opponent_turn: "Opponent's Turn",
  round_end: "Round Over",
  match_end: "Match Ended",
}

export default function BattleHUD({
  playerName, opponentName,
  playerHP, playerMaxHP, opponentHP, opponentMaxHP,
  playerTazos, opponentTazos, playerCaptured, opponentCaptured,
  round, phase, turnPlayer, compact,
}: BattleHUDProps) {
  const playerHPPercent = Math.max(0, (playerHP / playerMaxHP) * 100)
  const opponentHPPercent = Math.max(0, (opponentHP / opponentMaxHP) * 100)

  const phaseLabel = PHASE_LABELS[phase] || phase

  return (
    <div className={`w-full ${compact ? "text-[10px]" : "text-xs"}`}>
      {/* Top bar: names + round */}
      <div className="flex items-center justify-between gap-2 mb-2">
        {/* Player */}
        <div className="flex items-center gap-1.5">
          <div className={`${compact ? "w-5 h-5" : "w-6 h-6"} rounded-full bg-[#E3350D] border-2 border-[#1a1a1a] flex items-center justify-center text-white font-black text-[10px]`}>
            {playerName.charAt(0)}
          </div>
          <span className="font-black uppercase text-[#1a1a1a] truncate max-w-[80px]">{playerName}</span>
        </div>

        {/* Center */}
        <div className="text-center">
          <span className="font-black uppercase text-[#1a1a1a]/30 tracking-[0.15em]">
            {phaseLabel}
          </span>
        </div>

        {/* Opponent */}
        <div className="flex items-center gap-1.5">
          <span className="font-black uppercase text-[#1a1a1a] truncate max-w-[80px]">{opponentName}</span>
          <div className={`${compact ? "w-5 h-5" : "w-6 h-6"} rounded-full bg-[#3B4CCA] border-2 border-[#1a1a1a] flex items-center justify-center text-white font-black text-[10px]`}>
            {opponentName.charAt(0)}
          </div>
        </div>
      </div>

      {/* HP bars */}
      <div className="space-y-1.5 mb-2">
        {/* Player HP */}
        <div className="flex items-center gap-2">
          <Heart className={`${compact ? "w-3 h-3" : "w-4 h-4"} text-[#E3350D] shrink-0`} />
          <div className="flex-1 h-3 bg-zinc-200 border-2 border-[#1a1a1a] rounded overflow-hidden">
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${playerHPPercent}%`,
                background: playerHPPercent > 60
                  ? "linear-gradient(90deg, #22C55E, #4ADE80)"
                  : playerHPPercent > 25
                  ? "linear-gradient(90deg, #F59E0B, #FFCC00)"
                  : "linear-gradient(90deg, #E3350D, #FF6B00)",
              }}
            />
          </div>
          <span className="font-black text-[#1a1a1a] tabular-nums min-w-[32px] text-right">
            {playerHP}
          </span>
        </div>

        {/* Opponent HP */}
        <div className="flex items-center gap-2">
          <Heart className={`${compact ? "w-3 h-3" : "w-4 h-4"} text-[#3B4CCA] shrink-0`} />
          <div className="flex-1 h-3 bg-zinc-200 border-2 border-[#1a1a1a] rounded overflow-hidden">
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${opponentHPPercent}%`,
                background: opponentHPPercent > 60
                  ? "linear-gradient(90deg, #22C55E, #4ADE80)"
                  : opponentHPPercent > 25
                  ? "linear-gradient(90deg, #F59E0B, #FFCC00)"
                  : "linear-gradient(90deg, #E3350D, #FF6B00)",
              }}
            />
          </div>
          <span className="font-black text-[#1a1a1a] tabular-nums min-w-[32px] text-right">
            {opponentHP}
          </span>
        </div>
      </div>

      {/* Battle stats row */}
      <div className="flex items-center justify-between gap-2 text-[10px]">
        {/* Player stats */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Disc3 className="w-3 h-3 text-[#FFCC00]" />
            <span className="font-bold text-[#1a1a1a]">{playerTazos - playerCaptured}</span>
          </div>
          {playerCaptured > 0 && (
            <span className="text-[#1a1a1a]/40 font-bold">-{playerCaptured}</span>
          )}
        </div>

        {/* Turn indicator */}
        <div className="flex items-center gap-1">
          <Swords className="w-3 h-3 text-[#1a1a1a]/30" />
          <span className="font-bold text-[#1a1a1a]/40">
            Round {round}
          </span>
          {turnPlayer === "player" && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFCC00] animate-pulse" />
          )}
        </div>

        {/* Opponent stats */}
        <div className="flex items-center gap-2">
          {opponentCaptured > 0 && (
            <span className="text-[#1a1a1a]/40 font-bold">-{opponentCaptured}</span>
          )}
          <div className="flex items-center gap-1">
            <Disc3 className="w-3 h-3 text-[#3B4CCA]" />
            <span className="font-bold text-[#1a1a1a]">{opponentTazos - opponentCaptured}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
