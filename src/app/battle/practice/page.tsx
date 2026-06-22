// ============================================================
// Trading Tazos Game — Arena Slam (Practice Mode)
// No auth required. Jump mechanics. Instant gameplay.
// ============================================================
"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import GameShell from "@/components/game/game-shell"

function LoadingArena() {
  return (
    <GameShell>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(ellipse at center, #141428 0%, #0a0a15 55%, #040408 100%)",
      }}>
        <div style={{ position: "relative" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            border: "3px solid rgba(255,204,0,0.1)",
            borderTopColor: "var(--ttg-yellow)",
            animation: "spin 0.8s linear infinite",
            boxShadow: "0 0 32px rgba(255,204,0,0.15)",
          }} />
        </div>
        <p style={{ marginTop: 24, fontSize: 11, fontWeight: 900, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.2em" }}>
          Entering Arena
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </GameShell>
  )
}

const ArenaSlamV2 = dynamic(() => import("@/components/game-v2/arena-slam-v2"), {
  ssr: false,
  loading: LoadingArena,
})

export default function PracticePage() {
  useEffect(() => {
    document.body.classList.add("ttg-battle-active")
    return () => document.body.classList.remove("ttg-battle-active")
  }, [])

  return (
    <GameShell>
      <ArenaSlamV2 />
    </GameShell>
  )
}
