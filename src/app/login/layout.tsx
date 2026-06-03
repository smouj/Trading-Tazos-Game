import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In — Access Your Collection",
  description: "Sign in to Trading Tazos Game to access your collection, decks, and battle arena.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
