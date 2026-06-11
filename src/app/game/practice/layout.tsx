import type { Metadata } from "next"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Practice Battle — Trading Tazos Game",
    description: "Practice your tazo slamming skills against the AI. No stakes, no pressure — master the physics-based 3D battle arena.",
    path: "/game/practice",
    noIndex: true,
  }),
}

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
