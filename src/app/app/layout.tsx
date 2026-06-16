"use client"

import { usePathname } from "next/navigation"
import MagazinePageShell from "@/components/magazine-page-shell"
import ErrorBoundary from "@/components/ui/error-boundary"
import GameFullscreenShell from "@/components/game/game-fullscreen-shell"

const PATH_TO_TAB: Record<string, string> = {
  "/app/battle": "battle",
  "/app/stats": "stats",
  "/app/shop": "shop",
  "/app/quests": "quests",
  "/app/collection": "collection",
  "/app/decks": "decks",
  "/app/settings": "settings",
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  let tab = "collection"
  for (const [path, t] of Object.entries(PATH_TO_TAB)) {
    if (pathname === path || pathname.startsWith(path + "?")) {
      tab = t; break
    }
  }

  // Battle play routes get a fullscreen game shell
  // (no dashboard chrome: header, tabbar, footer, HUD all hidden)
  const isBattlePlay = pathname?.startsWith("/app/battle/play")

  if (isBattlePlay) {
    return (
      <ErrorBoundary>
        <GameFullscreenShell>
          {children}
        </GameFullscreenShell>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <MagazinePageShell currentTab={tab as any}>
        {children}
      </MagazinePageShell>
    </ErrorBoundary>
  )
}
