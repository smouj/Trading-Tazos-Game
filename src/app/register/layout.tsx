import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Account — Start Your Journey",
  description: "Create your free Trading Tazos Game account. Collect 319 tazos, battle friends, and climb the leaderboard.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
