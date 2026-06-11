import type { Metadata } from "next"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Ranked Battle — Trading Tazos Game",
    description: "Compete in ranked matches to climb the leaderboard. Win battles, earn credits, and prove your tazo training mastery.",
    path: "/game/ranked",
  }),
}

export default function RankedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
