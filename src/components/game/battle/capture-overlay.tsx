"use client"

import React from "react"
import Image from "next/image"
import type { TazoCard, ImpactResult } from "@/lib/battle/game-loop"

interface CaptureOverlayProps {
  impact: ImpactResult | null
  thrower: "player" | "opponent"
  playerTazo?: TazoCard | null
  opponentTazo?: TazoCard | null
}

export default function CaptureOverlay({ impact, thrower, playerTazo, opponentTazo }: CaptureOverlayProps) {
  if (!impact) return null

  const captured = impact.opponentCaptured
  const ringOut = impact.ringOut.length > 0
  const wobble = impact.wobbled.length > 0
  const miss = !captured && impact.flipped.length === 0

  const isPlayerTurn = thrower === "player"

  // Determine result
  let title: string
  let subtitle: string
  let color: string
  let glowColor: string
  let bgColor: string

  if (captured) {
    title = isPlayerTurn ? "CAPTURED!" : "LOST!"
    subtitle = isPlayerTurn
      ? `${opponentTazo?.name || "Enemy tazo"} is yours!`
      : `${playerTazo?.name || "Your tazo"} was captured!`
    color = isPlayerTurn ? "var(--ttg-success)" : "var(--ttg-opponent)"
    glowColor = isPlayerTurn ? "rgba(34,197,94,0.6)" : "rgba(239,68,68,0.5)"
    bgColor = isPlayerTurn ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)"
  } else if (ringOut) {
    title = "RING OUT!"
    subtitle = "Tazo knocked out of the arena!"
    color = "var(--ttg-dracobell)"
    glowColor = "rgba(255,140,0,0.5)"
    bgColor = "rgba(255,140,0,0.08)"
  } else if (wobble) {
    title = "WOBBLE..."
    subtitle = "Almost flipped — so close!"
    color = "var(--ttg-yellow)"
    glowColor = "rgba(255,204,0,0.4)"
    bgColor = "rgba(255,204,0,0.06)"
  } else if (miss) {
    title = isPlayerTurn ? "MISS!" : "SAFE!"
    subtitle = isPlayerTurn ? "Your tazo is now staked" : "Opponent missed — you keep it!"
    color = isPlayerTurn ? "var(--ttg-opponent)" : "var(--ttg-success)"
    glowColor = isPlayerTurn ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.4)"
    bgColor = isPlayerTurn ? "rgba(239,68,68,0.06)" : "rgba(34,197,94,0.06)"
  } else {
    title = impact.description || "IMPACT!"
    subtitle = impact.hitZone ? `${impact.hitZone}` : ""
    color = "#fff"
    glowColor = "rgba(255,255,255,0.3)"
    bgColor = "rgba(255,255,255,0.04)"
  }

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
      <div
        className="flex flex-col items-center gap-2 px-6 py-4 animate-[popUp_0.35s_ease-out] max-w-md text-center"
        style={{
          background: bgColor,
          border: `1px solid ${color}20`,
          backdropFilter: "blur(12px)",
          boxShadow: `0 0 48px ${glowColor}`,
        }}
      >
        {/* Main title */}
        <div
          className="text-4xl sm:text-5xl font-black tracking-tight"
          style={{
            color,
            textShadow: `0 0 32px ${glowColor}, 0 2px 8px rgba(0,0,0,0.8)`,
          }}
        >
          {title}
        </div>
        
        {/* Subtitle */}
        <div className="text-[10px] sm:text-xs font-bold text-white/60 uppercase tracking-[0.2em]">
          {subtitle}
        </div>

        {/* Impact stats bar */}
        <div className="flex items-center gap-3 mt-1 text-[9px] font-bold uppercase tracking-wider text-white/40">
          {impact.hitZone && impact.hitZone !== "MISS" && (
            <span style={{ color: impact.hitZone === "CENTER" ? "var(--ttg-success)" : impact.hitZone === "EDGE" ? "var(--ttg-dracobell)" : "var(--ttg-yellow)" }}>
              {impact.hitZone}
            </span>
          )}
          {impact.doubleFlip && <span className="text-ttg-yellow">DOUBLE!</span>}
          {impact.badLanding && <span className="text-ttg-opponent">BAD LANDING</span>}
        </div>
      </div>
    </div>
  )
}
