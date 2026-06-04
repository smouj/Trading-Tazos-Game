import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { version } from "@/../package.json"

export const dynamic = "force-dynamic"

export async function GET() {
  const startedAt = Date.now()

  try {
    await db.$queryRaw`SELECT 1`

    return NextResponse.json({
      status: "ok",
      service: "trading-tazos-game",
      version,
      db: "ok",
      responseMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json(
      {
        status: "error",
        service: "trading-tazos-game",
        db: "error",
        responseMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
