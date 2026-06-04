import { pageMetadata } from "@/lib/metadata"

export const metadata = pageMetadata({
  title: "Create Account — Start Your Journey",
  description: "Create your free Trading Tazos Game account. Collect 319 tazos, battle friends, and climb the leaderboard.",
  path: "/register",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
