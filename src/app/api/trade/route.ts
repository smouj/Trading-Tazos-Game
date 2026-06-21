// Trading Tazos Game — Marketplace API
// Uses raw queries for flexibility with evolving TradeListing schema
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

const MAX_LISTING_PRICE = 1_000_000

// GET /api/trade — browse active listings with tazo + seller info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get('sellerId')
    const mode = searchParams.get('mode') // '' = active, 'history' = completed

    // ── History mode ──
    if (mode === 'history') {
      const authUser = await getAuthUser(request)
      if (!authUser) return NextResponse.json({ error: 'Login required' }, { status: 401 })

      const listings = await db.tradeListing.findMany({
        where: {
          status: { in: ['sold', 'cancelled'] },
          OR: [{ sellerId: authUser.id }, { buyerId: authUser.id }],
        },
        orderBy: { soldAt: 'desc' },
        take: 50,
      })

      const enriched = await Promise.all(listings.map(async (l) => {
        const [seller, buyer, ut] = await Promise.all([
          db.user.findUnique({ where: { id: l.sellerId }, select: { id: true, name: true, displayName: true } }),
          l.buyerId ? db.user.findUnique({ where: { id: l.buyerId }, select: { id: true, name: true, displayName: true } }) : null,
          db.userTazo.findUnique({
            where: { id: l.userTazoId },
            include: { tazo: {
              select: {
                id: true, name: true, displayName: true, imageUrl: true, rarity: true,
                franchise: { select: { name: true, slug: true, color: true } },
              },
            }},
          }),
        ])
        return {
          id: l.id, price: l.price, status: l.status,
          createdAt: l.createdAt, soldAt: l.soldAt,
          type: l.sellerId === authUser.id ? 'sold' : 'bought',
          seller: seller || { id: l.sellerId, name: 'Unknown' },
          buyer: buyer || null,
          userTazo: ut ? { ...ut, tazo: ut.tazo } : null,
        }
      }))

      return NextResponse.json({ listings: enriched })
    }

    // ── Leaderboard mode ──
    if (mode === 'leaderboard') {
      // Aggregate top sellers by completed sales
      const topSellers = await db.$queryRawUnsafe<Array<{
        sellerId: string
        name: string
        displayName: string
        totalSales: number
        totalCredits: number
      }>>(`
        SELECT
          tl.sellerId,
          u.name,
          u.displayName,
          COUNT(*) as totalSales,
          SUM(tl.price) as totalCredits
        FROM TradeListing tl
        JOIN User u ON u.id = tl.sellerId
        WHERE tl.status = 'sold'
        GROUP BY tl.sellerId
        ORDER BY totalCredits DESC
        LIMIT 20
      `)
      return NextResponse.json({ leaderboard: topSellers })
    }

    // ── Active mode (default) ──

    // Fetch listings
    const listings = await db.tradeListing.findMany({
      where: { status: 'active', ...(sellerId ? { sellerId } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Enrich with tazo + seller data
    const enriched = await Promise.all(listings.map(async (l) => {
      const [seller, ut] = await Promise.all([
        db.user.findUnique({ where: { id: l.sellerId }, select: { id: true, name: true, displayName: true } }),
        db.userTazo.findUnique({
          where: { id: l.userTazoId },
          include: { tazo: {
            select: {
              id: true, name: true, displayName: true, slug: true,
              imageUrl: true, rarity: true, finish: true, creatureVariant: true, shinyImageUrl: true,
              franchise: { select: { name: true, slug: true, color: true } },
              attack: true, defense: true, resistance: true, weight: true,
              stability: true, spin: true, control: true, bounce: true, precision: true,
            },
          }},
        }),
      ])
      return {
        id: l.id,
        price: l.price,
        status: l.status,
        createdAt: l.createdAt,
        seller: seller || { id: l.sellerId, name: 'Unknown', displayName: 'Unknown' },
        userTazo: ut ? { ...ut, tazo: ut.tazo } : null,
      }
    }))

    return NextResponse.json({ listings: enriched })
  } catch (error) {
    console.error('Trade list error:', error)
    return NextResponse.json({ error: 'Failed to load marketplace' }, { status: 500 })
  }
}

// POST /api/trade — create listing
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ error: 'Login required' }, { status: 401 })

    const { userTazoId, price } = await request.json()
    if (
      !userTazoId ||
      typeof price !== 'number' ||
      !Number.isSafeInteger(price) ||
      price < 1 ||
      price > MAX_LISTING_PRICE
    ) {
      return NextResponse.json({ error: `userTazoId and integer price (1-${MAX_LISTING_PRICE}) required` }, { status: 400 })
    }

    // Atomic transaction: verify ownership + check no existing active listing + decrement
    const [listing] = await db.$transaction(async (tx) => {
      const ut = await tx.userTazo.findUnique({ where: { id: userTazoId } })
      if (!ut || ut.userId !== authUser.id) {
        throw new Error('NOT_FOUND')
      }
      if (ut.quantity < 1) {
        throw new Error('NO_COPIES')
      }

      const existing = await tx.tradeListing.findFirst({
        where: { userTazoId, status: 'active', sellerId: authUser.id },
      })
      if (existing) throw new Error('ALREADY_LISTED')

      const reserve = await tx.userTazo.updateMany({
        where: { id: userTazoId, userId: authUser.id, quantity: { gte: 1 } },
        data: { quantity: { decrement: 1 } },
      })
      if (reserve.count !== 1) {
        throw new Error('NO_COPIES')
      }

      const listing = await tx.tradeListing.create({
        data: { sellerId: authUser.id, userTazoId, price, status: 'active' },
      })

      return [listing]
    })

    return NextResponse.json({ listing, message: 'Tazo listed for sale!' }, { status: 201 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : ''
    if (msg === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Tazo not found in your collection' }, { status: 404 })
    }
    if (msg === 'NO_COPIES') {
      return NextResponse.json({ error: 'No copies to sell' }, { status: 400 })
    }
    if (msg === 'ALREADY_LISTED') {
      return NextResponse.json({ error: 'Already listed' }, { status: 409 })
    }
    console.error('Trade create error:', error)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}
