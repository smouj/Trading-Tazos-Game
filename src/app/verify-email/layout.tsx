import type { Metadata } from "next"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Verify Email — Trading Tazos Game",
    description:
      "Verify your email address to confirm your Trading Tazos Game account. Email verification unlocks all features including trading and ranked battles.",
    path: "/verify-email",
  }),
}

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
