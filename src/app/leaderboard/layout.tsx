import { pageMetadata } from "@/lib/metadata"

export const metadata = pageMetadata({
  title: "Leaderboard — Top Players & Rankings",
  description: "Top players and rankings in Trading Tazos Game. Compete to be the best tazo collector.",
  path: "/leaderboard",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
