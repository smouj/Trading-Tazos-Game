import type { Metadata } from "next"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Tazo Catalog — Browse All 349 Tazos | Trading Tazos Game",
    description: "Browse all 349 Trading Tazos — filter by franchise, rarity, finish, and combat type. Minimon, Dracobell, and Cybermon collections from 90s snack toys.",
    path: "/tazos",
  }),
}

export default function TazosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
