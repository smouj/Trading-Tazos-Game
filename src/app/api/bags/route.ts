// GET /api/bags — List user's unopened bags
import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const unopened = await db.bagPurchase.findMany({
      where: { userId: user.id, opened: false },
      include: {
        tazo: {
          select: { id: true, name: true, rarity: true, franchise: { select: { name: true, slug: true, color: true } } },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({
      bags: unopened.map(b => ({
        id: b.id,
        bagType: b.bagType,
        cost: b.cost,
        hasBonus: !!b.bonusTazo,
        preview: b.tazo ? {
          rarity: b.tazo.rarity,
          franchise: b.tazo.franchise?.slug,
          franchiseColor: b.tazo.franchise?.color,
        } : null,
        createdAt: b.createdAt,
      })),
      total: unopened.length,
    })
  } catch (error) {
    console.error("Bags GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
