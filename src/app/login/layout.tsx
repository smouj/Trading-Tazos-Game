import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Trading Tazos Game to access your collection, build battle decks, open tazo bags, and compete in the 3D vertical slam arena.",
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
