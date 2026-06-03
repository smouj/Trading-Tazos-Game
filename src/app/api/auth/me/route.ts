import { NextRequest, NextResponse } from "next/server"
import { getAuthUser, generateToken } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.slice(7) || null
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch fresh user data with counts
    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      include: {
        _count: {
          select: { userTazos: true, decks: true },
        },
      },
    })

    if (!fullUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If auth came from cookie (no Bearer token), return a fresh token for localStorage sync
    const freshToken = token || generateToken(user)

    return NextResponse.json({
      token: freshToken,
      user: {
        id: fullUser.id,
        email: fullUser.email,
        name: fullUser.name,
        displayName: fullUser.displayName,
        avatarUrl: fullUser.avatarUrl,
        tazoCount: fullUser._count.userTazos,
        deckCount: fullUser._count.decks,
        createdAt: fullUser.createdAt,
      },
    })
  } catch (error) {
    if (error instanceof Response) throw error
    console.error("Me error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
