import type { Metadata } from "next"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Tazo Catalog — Browse All 148 Tazos | Trading Tazos Game",
    description: "Browse all 148 Trading Tazos — filter by franchise, rarity, finish, and combat type. Minimon, Dracobell, and Cybermon collections from TazoForge Studios 2026.",
    path: "/tazos",
  }),
}

export default function TazosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
