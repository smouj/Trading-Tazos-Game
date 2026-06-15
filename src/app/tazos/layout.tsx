import type { Metadata } from "next"
import { pageMetadata } from "@/lib/metadata"
import { SITE_CONFIG } from "@/lib/site-config"

export const metadata: Metadata = {
  ...pageMetadata({
    title: `Tazo Catalog — Browse All ${SITE_CONFIG.totalTazos} Tazos | Trading Tazos Game`,
    description: `Browse all ${SITE_CONFIG.totalTazos} Trading Tazos across ${SITE_CONFIG.totalSeries} series (${SITE_CONFIG.series.map(s => s.name).join(", ")}). Filter by series, rarity, finish, and combat type.`,
    path: "/tazos",
  }),
}

export default function TazosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
