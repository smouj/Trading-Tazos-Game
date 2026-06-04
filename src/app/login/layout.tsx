import { pageMetadata } from "@/lib/metadata"

export const metadata = pageMetadata({
  title: "Sign In — Access Your Collection",
  description: "Sign in to Trading Tazos Game to access your collection, decks, and battle arena.",
  path: "/login",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
