"use client"

// ============================================================
// Battle Play — Arena Slam V2 (new jump mechanics)
//
// GameShell provides the fixed fullscreen container.
// BattlePlayV2 reads sessionStorage, fetches the user's deck
// from API, maps tazos to DiscState, and launches ArenaSlamV2.
//
// If no battle config in sessionStorage, redirect to lobby.
// ============================================================

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n"
import GameShell from "@/components/game/game-shell"

function BattlePlayLoadingOverlay() {
  const { t } = useI18n()
  return (
    <GameShell>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(ellipse at center, #161630 0%, #0b0b18 50%, #030308 100%)",
        gap: "2rem",
      }}>
        <div style={{ position: "relative" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            border: "3px solid rgba(255,204,0,0.12)",
            borderTopColor: "var(--ttg-yellow)",
            animation: "spin 0.8s linear infinite",
            boxShadow: "0 0 32px rgba(255,204,0,0.15)",
          }} />
        </div>
        <p style={{ fontSize: 12, fontWeight: 900, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.25em", margin: 0 }}>
          {t.battle_entering_arena}
        </p>
      </div>
    </GameShell>
  )
}

const BattlePlayV2 = dynamic(() => import("@/components/game-v2/battle-play-v2"), {
  ssr: false,
  loading: BattlePlayLoadingOverlay,
})

export default function BattlePlayPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const hasConfig = sessionStorage.getItem("battle_mode") && sessionStorage.getItem("battle_deckId")
    if (!hasConfig) {
      router.replace("/app/battle")
      return
    }
    setReady(true)
  }, [router])

  if (!ready) return null

  return (
    <GameShell>
      <BattlePlayV2 />
    </GameShell>
  )
}
