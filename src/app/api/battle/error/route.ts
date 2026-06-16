import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/battle/error
 * Receives client-side battle errors for diagnostics.
 * Logs to console — no DB write to avoid circular deps.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { error, stack, userAgent } = body || {}
    const ua = (userAgent || request.headers.get("user-agent") || "unknown").slice(0, 200)
    const err = (error || "unknown").slice(0, 300)
    console.error(`[BattleError] UA=${ua} error="${err}" stack="${(stack || "").slice(0, 300)}"`)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
