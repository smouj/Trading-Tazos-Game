"use client"

import React, { useState } from "react"
import Image from "next/image"
import type { TazoCard } from "@/lib/battle/game-loop"

interface SelectPhaseProps {
  hand: TazoCard[]
  phase: "select" | "stake"
  selectedId: string | null
  betId?: string | null       // Don't allow selecting the staked tazo as launcher
  onSelect: (tazo: TazoCard) => void
}

export default function SelectPhase({ hand, phase, selectedId, betId, onSelect }: SelectPhaseProps) {
  const label = phase === "stake" ? "Pick your stake" : "Choose your launcher"
  const hint = phase === "stake"
    ? "This tazo will be staked face-down"
    : "Throw this tazo to flip the opponent's stake"

  return (
    <div className="absolute bottom-0 left-0 right-0 z-25 pb-6 pointer-events-none">
      <div className="flex flex-col items-center gap-2">
        {/* Label */}
        <div className="pointer-events-auto bg-black/50 backdrop-blur-md border border-ttg-yellow/10 px-4 py-1.5">
          <span className="text-[9px] font-black text-ttg-yellow uppercase tracking-[0.25em]">
            {label}
          </span>
        </div>

        {/* Hint */}
        <span className="text-[8px] font-bold text-white/25 uppercase tracking-wider">
          {hint}
        </span>

        {/* Card grid */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {hand.map((tazo) => {
            const isSelected = tazo.id === selectedId
            const isDisabled = betId === tazo.id
            return (
              <button
                key={tazo.id}
                onClick={() => !isDisabled && onSelect(tazo)}
                disabled={isDisabled}
                className={[
                  "relative w-14 h-20 sm:w-16 sm:h-24 flex flex-col items-center transition-all duration-200",
                  isDisabled
                    ? "opacity-20 cursor-not-allowed"
                    : isSelected
                    ? "scale-110 -translate-y-2"
                    : "hover:scale-105 hover:-translate-y-1 opacity-80 hover:opacity-100 cursor-pointer",
                ].join(" ")}
                style={{
                  background: isSelected
                    ? "linear-gradient(135deg, var(--ttg-yellow)/15, var(--ttg-yellow)/5)"
                    : "linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2))",
                  border: isSelected
                    ? "2px solid var(--ttg-yellow)"
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: isSelected
                    ? "0 0 24px rgba(255,204,0,0.3), 0 4px 16px rgba(0,0,0,0.4)"
                    : "0 2px 8px rgba(0,0,0,0.3)",
                  backdropFilter: "blur(4px)",
                }}
              >
                {/* Tazo image */}
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 mt-1">
                  {tazo.imageUrl ? (
                    <Image
                      src={tazo.imageUrl}
                      alt={tazo.name}
                      fill
                      className="object-contain"
                      sizes="64px"
                    />
                  ) : (
                    <span className="text-white/30 text-xs font-black flex items-center justify-center h-full">
                      {tazo.name[0]}
                    </span>
                  )}
                </div>

                {/* Name */}
                <span className={[
                  "text-[7px] font-black text-center leading-tight px-1 mt-0.5",
                  isSelected ? "text-ttg-yellow" : "text-white/60",
                ].join(" ")}>
                  {tazo.name.length > 10 ? tazo.name.slice(0, 9) + "…" : tazo.name}
                </span>

                {/* Stats bar */}
                <div className="flex gap-0.5 mt-0.5">
                  <span className="text-[6px] font-black text-ttg-dracobell/60" title="ATK">
                    {tazo.attack}
                  </span>
                  <span className="text-[6px] font-black text-ttg-player/60" title="DEF">
                    {tazo.defense}
                  </span>
                  <span className="text-[6px] font-black text-ttg-yellow/60" title="SPD">
                    {tazo.spin}
                  </span>
                </div>

                {/* Disabled overlay (staked tazo) */}
                {isDisabled && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[6px] font-black text-white/30 uppercase rotate-[-15deg]">
                      Staked
                    </span>
                  </div>
                )}

                {/* Selected checkmark */}
                {isSelected && (
                  <div className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-ttg-yellow flex items-center justify-center">
                    <span className="text-[6px] font-black text-black">✓</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
