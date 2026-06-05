"use client"

// Practice Battle — fullscreen game mode vs AI
import GameShell from "@/components/game-shell"
import FullscreenBattle from "@/components/game/battle/fullscreen-battle"

export default function PracticePage() {
  return (
    <GameShell title="PRACTICE BATTLE" backHref="/app/battle">
      <FullscreenBattle mode="practice" />
    </GameShell>
  )
}
