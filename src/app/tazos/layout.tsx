import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tazo Catalog",
  description: "Browse all 349 Trading Tazos — filter by franchise, rarity, finish, and combat type. Minimon, Dracobell, and Cybermon collections from 90s snack toys.",
  openGraph: {
    title: "Tazo Catalog — Browse All 349 Tazos | Trading Tazos Game",
    description: "Complete tazo catalog with filters. Search Minimon, Dracobell, and Cybermon tazos by franchise, rarity, and combat stats.",
  },
}

export default function TazosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
