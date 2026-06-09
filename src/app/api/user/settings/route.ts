// ============================================================
// Trading Tazos Game — User Settings API
// PUT /api/user/settings → update displayName, avatarUrl
// ============================================================
import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { displayName, avatarUrl } = body

    const updates: Record<string, string> = {}
    if (displayName !== undefined && displayName.trim()) updates.displayName = displayName.trim()
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: updates,
      select: { id: true, name: true, email: true, displayName: true, avatarUrl: true },
    })

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error("User settings update error:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
