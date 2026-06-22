// ============================================================
// Trading Tazos Game — Arena Slam v2 Prototype
// Drag-release tazo arcade — no login, no economy, pure gameplay.
// ============================================================
"use client"

import dynamic from "next/dynamic"

const ArenaSlamV2 = dynamic(
  () => import("@/components/game-v2/arena-slam-v2"),
  { ssr: false }
)

export default function BattlePrototypePage() {
  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Minimal header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2 pointer-events-none">
        <div className="pointer-events-auto">
          <a
            href="/"
            className="text-[10px] font-black text-white/30 uppercase tracking-widest hover:text-white/60 transition-colors"
          >
            ← TTG
          </a>
        </div>
        <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
          Prototype v2
        </div>
      </div>

      {/* Game canvas */}
      <ArenaSlamV2 />

      {/* Bottom label */}
      <div className="absolute bottom-2 right-4 z-30 pointer-events-none">
        <span className="text-[8px] font-bold text-white/15 uppercase tracking-widest">
          Arena Slam v2 · Drag to aim · Release to launch · First to 5 captures wins
        </span>
      </div>
    </div>
  )
}