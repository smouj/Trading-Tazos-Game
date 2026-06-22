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
      const rating = await db.rankedRating.upsert({
        where: { userId },
        create: { userId, elo: getInitialElo() },
        update: {},
      })
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

// POST — report a ranked match (atomic transaction)
export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { playerScore, opponentScore, opponentUserId } = body

    if (!Number.isInteger(playerScore) || !Number.isInteger(opponentScore) || playerScore < 0 || opponentScore < 0) {
      return NextResponse.json({ error: "Missing scores" }, { status: 400 })
    }

    if (opponentUserId === auth.id) {
      return NextResponse.json({ error: "Cannot report a ranked match against yourself" }, { status: 400 })
    }

    // Wrap all rating reads/writes in a transaction so Elo deltas use one snapshot.
    const result = await db.$transaction(async (tx) => {
      const playerRating = await tx.rankedRating.upsert({
        where: { userId: auth.id },
        create: { userId: auth.id, elo: getInitialElo() },
        update: {},
      })

      const opponentRating = opponentUserId
        ? await tx.rankedRating.upsert({
            where: { userId: opponentUserId },
            create: { userId: opponentUserId, elo: getInitialElo() },
            update: {},
          })
        : null

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
      const updatedPlayer = await tx.rankedRating.update({
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
        await tx.rankedRating.update({
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

      return {
        eloChange: playerDelta,
        newElo: updatedPlayer.elo,
        rank: getRank(updatedPlayer.elo),
      }
    })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error("Ranked POST error:", error)
    return NextResponse.json({ error: "Failed to report match" }, { status: 500 })
  }
}
