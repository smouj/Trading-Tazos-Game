// Trading Tazos Game — Trade Offers API (tazo-for-tazo direct trading)
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/trade/offer — list open offers (all or by user)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const offererId = searchParams.get('offererId')
    const status = searchParams.get('status') || 'pending'

    const offers = await db.tradeOffer.findMany({
      where: { status, ...(offererId ? { offererId } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Enrich with tazo data
    const enriched = await Promise.all(offers.map(async (o) => {
      const [offerer, offeredUT, requestedT] = await Promise.all([
        db.user.findUnique({ where: { id: o.offererId }, select: { id: true, name: true, displayName: true } }),
        db.userTazo.findUnique({
          where: { id: o.offeredUserTazoId },
          include: { tazo: { select: { id: true, name: true, displayName: true, imageUrl: true, rarity: true, franchise: { select: { name: true, slug: true, color: true } } } } },
        }),
        db.tazo.findUnique({
          where: { id: o.requestedTazoId },
          select: { id: true, name: true, displayName: true, imageUrl: true, rarity: true, franchise: { select: { name: true, slug: true, color: true } } },
        }),
      ])
      const acceptor = o.acceptorId ? await db.user.findUnique({ where: { id: o.acceptorId }, select: { id: true, name: true, displayName: true } }) : null
      return {
        id: o.id, status: o.status, createdAt: o.createdAt, resolvedAt: o.resolvedAt,
        offerer: offerer || { id: o.offererId, name: 'Unknown' },
        offeredTazo: offeredUT ? { ...offeredUT, tazo: offeredUT.tazo } : null,
        requestedTazo: requestedT,
        acceptor: acceptor || null,
      }
    }))

    return NextResponse.json({ offers: enriched })
  } catch (error) {
    console.error('Trade offer list error:', error)
    return NextResponse.json({ error: 'Failed to load offers' }, { status: 500 })
  }
}

// POST /api/trade/offer — create a new trade offer (atomic reserve + create)
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ error: 'Login required' }, { status: 401 })

    const { offeredUserTazoId, requestedTazoId } = await request.json()
    if (!offeredUserTazoId || !requestedTazoId) {
      return NextResponse.json({ error: 'offeredUserTazoId and requestedTazoId required' }, { status: 400 })
    }
    if (offeredUserTazoId === requestedTazoId) {
      return NextResponse.json({ error: 'Cannot offer and request the same tazo' }, { status: 400 })
    }

    // Verify existence first (lightweight reads outside transaction)
    const requestedTazo = await db.tazo.findUnique({ where: { id: requestedTazoId } })
    if (!requestedTazo) {
      return NextResponse.json({ error: 'Requested tazo not found' }, { status: 404 })
    }

    // Reserve one copy while the offer is pending so it cannot be sold or
    // promised through multiple overlapping trade offers.
    const result = await db.$transaction(async (tx) => {
      // Verify the offered tazo still belongs to the user (inside tx)
      const ut = await tx.userTazo.findUnique({ where: { id: offeredUserTazoId } })
      if (!ut || ut.userId !== authUser.id) {
        return { ok: false, error: 'Tazo not found in your collection' }
      }
      if (ut.quantity < 1) {
        return { ok: false, error: 'No copies available' }
      }
      if (ut.tazoId === requestedTazoId) {
        return { ok: false, error: 'Cannot offer and request the same tazo' }
      }

      const reserve = await tx.userTazo.updateMany({
        where: { id: offeredUserTazoId, userId: authUser.id, quantity: { gte: 1 } },
        data: { quantity: { decrement: 1 } },
      })
      if (reserve.count !== 1) {
        return { ok: false, error: 'No copies available' }
      }

      const created = await tx.tradeOffer.create({
        data: {
          offererId: authUser.id,
          offeredUserTazoId,
          requestedTazoId,
          status: 'pending',
        },
      })
      return { ok: true, offer: created }
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ offer: result.offer })
  } catch (error) {
    console.error('Trade offer create error:', error)
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 })
  }
}
