// ============================================================
// Trading Tazos Game — Leaderboard API
// GET /api/leaderboard?sort=credits|tazos|battles|level
// ============================================================

import { NextRequest, NextResponse } from "next/server"
import { db as prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const sort = req.nextUrl.searchParams.get("sort") || "credits"
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "50"), 100)

  let users: any[] = []

  switch (sort) {
    case "tazos":
      users = await prisma.user.findMany({
        select: { id: true, name: true, displayName: true, avatarUrl: true, credits: true, _count: { select: { userTazos: true } } },
        orderBy: { userTazos: { _count: "desc" } },
        take: limit,
      })
      users = users.map(u => ({ ...u, score: u._count.userTazos, rankField: "tazos" }))
      break
    case "battles":
      // Real battle counts from BattleRecord
      const battleUsers = await prisma.user.findMany({
        select: { id: true, name: true, displayName: true, avatarUrl: true, credits: true, _count: { select: { userTazos: true } } },
        take: limit,
      })
      // Count real battles per user
      for (const u of battleUsers) {
        const wins = await prisma.battleRecord.count({ where: { userId: u.id, winner: "player" } })
        const total = await prisma.battleRecord.count({ where: { userId: u.id } })
        u.battleCount = total
        u.winCount = wins
      }
      battleUsers.sort((a: any, b: any) => (b.battleCount || 0) - (a.battleCount || 0))
      users = battleUsers.map(u => ({ ...u, score: u.battleCount || 0, rankField: "battles", tazoCount: u._count.userTazos }))
      break
    case "credits":
    default:
      users = await prisma.user.findMany({
        select: { id: true, name: true, displayName: true, avatarUrl: true, credits: true, _count: { select: { userTazos: true } } },
        orderBy: { credits: "desc" },
        take: limit,
      })
      users = users.map(u => ({ ...u, score: u.credits, rankField: "credits", tazoCount: u._count.userTazos }))
      break
  }

  // Rank users
  const ranked = users.map((u: any, i: number) => ({ rank: i + 1, ...u }))

  return NextResponse.json({ leaderboard: ranked, sort, total: ranked.length })
}
