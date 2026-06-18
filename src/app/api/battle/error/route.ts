import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/battle/error
 * Receives client-side battle errors for diagnostics.
 * All inputs sanitized before logging.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { error, stack, userAgent } = body || {}
    // Sanitize: strip control chars, limit length
    const sanitize = (s: string, max: number) =>
      String(s || "unknown").replace(/[\x00-\x1f\x7f-\x9f]/g, "").slice(0, max)
    
    const ua = sanitize(userAgent || request.headers.get("user-agent") || "unknown", 200)
    const err = sanitize(error || "unknown", 300)
    const stk = sanitize(stack || "", 300)
    console.error(`[BattleError] UA=${ua} error="${err}" stack="${stk}"`)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
