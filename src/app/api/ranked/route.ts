// ============================================================
// GET /api/ranked — Ranked PvP leaderboard + player stats
// POST /api/ranked — Report ranked match result
// ============================================================

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"
import { calcEloChange, getRank, getInitialElo } from "@/lib/battle/elo"

// GET — leaderboard or player stats
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")

  try {
    // Single player stats
    if (userId) {
      let rating = await db.rankedRating.findUnique({ where: { userId } })
      if (!rating) {
        rating = await db.rankedRating.create({
          data: { userId, elo: getInitialElo() },
        })
      }
      return NextResponse.json({
        ...rating,
        rank: getRank(rating.elo),
      })
    }

    // Leaderboard — top 50 by Elo
    const top = await db.rankedRating.findMany({
      take: 50,
      orderBy: { elo: "desc" },
      include: {
        user: { select: { name: true, avatarUrl: true } },
      },
    })

    return NextResponse.json(
      top.map((r, i) => ({
        position: i + 1,
        userId: r.userId,
        name: r.user.name || "Unknown",
        elo: r.elo,
        wins: r.wins,
        losses: r.losses,
        draws: r.draws,
        streak: r.streak,
        rank: getRank(r.elo),
      }))
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}

// POST — report a ranked match
export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { playerScore, opponentScore, opponentUserId } = body

    if (typeof playerScore !== "number" || typeof opponentScore !== "number") {
      return NextResponse.json({ error: "Missing scores" }, { status: 400 })
    }

    // Get or create player rating
    let playerRating = await db.rankedRating.findUnique({
      where: { userId: auth.id },
    })
    if (!playerRating) {
      playerRating = await db.rankedRating.create({
        data: { userId: auth.id, elo: getInitialElo() },
      })
    }

    // Get or create opponent rating
    let opponentRating = opponentUserId
      ? await db.rankedRating.findUnique({ where: { userId: opponentUserId } })
      : null
    if (opponentUserId && !opponentRating) {
      opponentRating = await db.rankedRating.create({
        data: { userId: opponentUserId, elo: getInitialElo() },
      })
    }

    const oppElo = opponentRating?.elo ?? getInitialElo()

    // Calculate Elo changes
    const playerDelta = calcEloChange({
      playerRating: playerRating.elo,
      opponentRating: oppElo,
      playerScore,
      opponentScore,
    })

    const opponentDelta = calcEloChange({
      playerRating: oppElo,
      opponentRating: playerRating.elo,
      playerScore: opponentScore,
      opponentScore: playerScore,
    })

    const playerWon = playerScore > opponentScore
    const isDraw = playerScore === opponentScore

    // Update player
    await db.rankedRating.update({
      where: { userId: auth.id },
      data: {
        elo: Math.max(0, playerRating.elo + playerDelta),
        wins: playerWon ? playerRating.wins + 1 : playerRating.wins,
        losses: !playerWon && !isDraw ? playerRating.losses + 1 : playerRating.losses,
        draws: isDraw ? playerRating.draws + 1 : playerRating.draws,
        streak: playerWon
          ? Math.max(0, playerRating.streak) + 1
          : isDraw ? 0
          : Math.min(0, playerRating.streak) - 1,
      },
    })

    // Update opponent if real
    if (opponentUserId && opponentRating) {
      await db.rankedRating.update({
        where: { userId: opponentUserId },
        data: {
          elo: Math.max(0, opponentRating.elo + opponentDelta),
          wins: !playerWon && !isDraw ? opponentRating.wins + 1 : opponentRating.wins,
          losses: playerWon ? opponentRating.losses + 1 : opponentRating.losses,
          draws: isDraw ? opponentRating.draws + 1 : opponentRating.draws,
          streak: !playerWon && !isDraw
            ? Math.max(0, opponentRating.streak) + 1
            : isDraw ? 0
            : Math.min(0, opponentRating.streak) - 1,
        },
      })
    }

    const newRating = playerRating.elo + playerDelta

    return NextResponse.json({
      success: true,
      eloChange: playerDelta,
      newElo: newRating,
      rank: getRank(newRating),
    })
  } catch (error) {
    console.error("Ranked POST error:", error)
    return NextResponse.json({ error: "Failed to report match" }, { status: 500 })
  }
}
