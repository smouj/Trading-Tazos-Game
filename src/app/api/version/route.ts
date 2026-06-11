import { NextResponse } from "next/server"
import { SITE_CONFIG } from "@/lib/site-config"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({
    name: SITE_CONFIG.name,
    shortName: SITE_CONFIG.shortName,
    version: SITE_CONFIG.version,
    canonicalUrl: SITE_CONFIG.canonicalUrl,
    totalTazos: SITE_CONFIG.totalTazos,
    publishedTazos: SITE_CONFIG.publishedTazos,
    totalSeries: SITE_CONFIG.totalSeries,
    series: SITE_CONFIG.series,
  })
}
