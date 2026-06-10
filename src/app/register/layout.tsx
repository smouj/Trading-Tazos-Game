import type { Metadata } from "next"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Create Account — Start Your Collection Free | Trading Tazos Game",
    description: "Create your free Trading Tazos Game account — get 10 free tazo bags, build collections, enter the 3D battle arena, and rise through the leaderboard.",
    path: "/register",
  }),
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
