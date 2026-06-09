import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your free Trading Tazos Game account — get 10 free tazo bags, build collections, enter the 3D battle arena, and rise through the leaderboard.",
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
