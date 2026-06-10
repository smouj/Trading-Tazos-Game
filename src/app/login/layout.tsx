import type { Metadata } from "next"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Sign In — Access Your Collection | Trading Tazos Game",
    description: "Sign in to Trading Tazos Game to access your collection, build battle decks, open tazo bags, and compete in the 3D vertical slam arena.",
    path: "/login",
  }),
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
