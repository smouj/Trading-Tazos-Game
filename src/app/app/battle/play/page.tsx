"use client"

// ============================================================
// Battle Play — renders BattleView inline within the magazine
// app shell (header + tabs + HUD). No separate fullscreen page.
//
// BattleView reads mode/difficulty/deckId from sessionStorage
// (set by the /app/battle lobby).
//
// v2 (2026-06-16): Lazy-loaded BattleView to avoid bundling
// Three.js into the initial app chunk. The loading spinner
// matches the magazine aesthetic.
// ============================================================

import dynamic from "next/dynamic"

const BattleView = dynamic(() => import("@/components/game/battle-view"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full bg-[#FFCC00]/15 animate-ping" />
        <div className="absolute inset-0 rounded-full bg-[#FFCC00]/10 animate-pulse" 
          style={{ animationDuration: "2s" }} />
      </div>
      <div className="w-12 h-12 rounded-full border-[3px] border-[#1a1a1a]/10 border-t-[#FFCC00] animate-spin" />
      <p className="text-xs font-black text-[#1a1a1a]/20 uppercase tracking-[0.3em] animate-pulse">
        Loading Arena
      </p>
    </div>
  ),
})

export default function BattlePlayPage() {
  return <BattleView />
}
