"use client"

import React from "react"

interface RoundWonOverlayProps {
  roundNumber: number
  playerScore: number
  opponentScore: number
  playerRemaining: number
  opponentRemaining: number
}

export default function RoundWonOverlay({
  roundNumber, playerScore, opponentScore,
  playerRemaining, opponentRemaining,
}: RoundWonOverlayProps) {
  const playerAhead = playerScore > opponentScore
  const tied = playerScore === opponentScore

  const title = tied ? "DRAW!" : `${playerAhead ? "PLAYER" : "OPPONENT"} LEADS`
  const color = tied
    ? "var(--ttg-yellow)"
    : playerAhead
    ? "var(--ttg-player)"
    : "var(--ttg-opponent)"
  const glowColor = tied
    ? "rgba(255,204,0,0.5)"
    : playerAhead
    ? "rgba(59,130,246,0.5)"
    : "rgba(239,68,68,0.4)"

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
      <div
        className="flex flex-col items-center gap-3 px-8 py-5 animate-[popUp_0.4s_ease-out]"
        style={{
          background: "rgba(0,0,0,0.75)",
          border: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(16px)",
          boxShadow: `0 0 64px ${glowColor}, 0 8px 32px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Round label */}
        <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">
          Round {roundNumber} Complete
        </div>

        {/* Score display */}
        <div className="flex items-center gap-6">
          {/* Player */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] font-black text-ttg-player uppercase tracking-widest">You</span>
            <span className="text-3xl font-black text-white" style={{ textShadow: "0 0 20px rgba(59,130,246,0.4)" }}>
              {playerScore}
            </span>
            <span className="text-[8px] font-bold text-white/30">
              {playerRemaining} left
            </span>
          </div>

          {/* VS */}
          <div className="flex flex-col items-center">
            <span className="text-xl font-black text-white/20">VS</span>
          </div>

          {/* Opponent */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] font-black text-ttg-opponent uppercase tracking-widest">AI</span>
            <span className="text-3xl font-black text-white" style={{ textShadow: "0 0 20px rgba(239,68,68,0.4)" }}>
              {opponentScore}
            </span>
            <span className="text-[8px] font-bold text-white/30">
              {opponentRemaining} left
            </span>
          </div>
        </div>

        {/* Leader callout */}
        <div
          className="text-lg font-black uppercase tracking-[0.15em]"
          style={{
            color,
            textShadow: `0 0 24px ${glowColor}`,
          }}
        >
          {title}
        </div>

        {/* Next round hint */}
        <div className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">
          Next round starting...
        </div>
      </div>
    </div>
  )
}
