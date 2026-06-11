// Trading Tazos Game — Accept/Decline trade offers
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { sendTransactionalEmailSoon } from '@/lib/email'

// POST /api/trade/offer/[id] — accept with a counter-tazo
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ error: 'Login required' }, { status: 401 })

    const { id } = await params

    const offer = await db.tradeOffer.findUnique({ where: { id } })
    if (!offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    if (offer.status !== 'pending') return NextResponse.json({ error: 'Offer is no longer available' }, { status: 400 })
    if (offer.offererId === authUser.id) return NextResponse.json({ error: 'Cannot accept your own offer' }, { status: 400 })
    const [offerer, offeredUserTazo, requestedTazo] = await Promise.all([
      db.user.findUnique({ where: { id: offer.offererId } }),
      db.userTazo.findUnique({ where: { id: offer.offeredUserTazoId }, include: { tazo: true } }),
      db.tazo.findUnique({ where: { id: offer.requestedTazoId } }),
    ])

    // Verify acceptor has the requested tazo
    const requestedId = offer.requestedTazoId
    const [acceptorUT] = await db.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT ut.id FROM UserTazo ut WHERE ut.userId = ? AND ut.tazoId = ? LIMIT 1`,
      authUser.id, requestedId
    )

    if (!acceptorUT) {
      return NextResponse.json({ error: "You don't have the requested tazo" }, { status: 400 })
    }

    // Atomic swap: transfer offered tazo to acceptor, transfer accepted tazo to offerer
    await db.$executeRawUnsafe(
      `UPDATE UserTazo SET userId = ? WHERE id = ?`,
      authUser.id, offer.offeredUserTazoId
    )
    await db.$executeRawUnsafe(
      `UPDATE UserTazo SET userId = ? WHERE id = ?`,
      offer.offererId, acceptorUT.id
    )

    // Mark offer as accepted
    await db.tradeOffer.update({
      where: { id },
      data: {
        status: 'accepted',
        acceptorId: authUser.id,
        acceptedUserTazoId: acceptorUT.id,
        resolvedAt: new Date(),
      },
    })

    const offeredName = offeredUserTazo?.tazo.displayName || offeredUserTazo?.tazo.name || offeredUserTazo?.tazo.slug || 'Offered tazo'
    const requestedName = requestedTazo?.displayName || requestedTazo?.name || requestedTazo?.slug || 'Requested tazo'
    sendTransactionalEmailSoon({
      template: 'tradeConfirmation',
      to: authUser.email,
      variables: {
        name: authUser.displayName || authUser.name,
        tradeType: 'Direct trade accepted',
        tazoName: `${requestedName} for ${offeredName}`,
      },
    })
    if (offerer) {
      sendTransactionalEmailSoon({
        template: 'tradeConfirmation',
        to: offerer.email,
        variables: {
          name: offerer.displayName || offerer.name,
          tradeType: 'Direct trade accepted',
          tazoName: `${offeredName} for ${requestedName}`,
        },
      })
    }

    return NextResponse.json({ success: true, message: 'Trade accepted!' })
  } catch (error) {
    console.error('Trade offer accept error:', error)
    return NextResponse.json({ error: 'Failed to accept offer' }, { status: 500 })
  }
}

// DELETE /api/trade/offer/[id] — decline or cancel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ error: 'Login required' }, { status: 401 })

    const { id } = await params

    const offer = await db.tradeOffer.findUnique({ where: { id } })
    if (!offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    if (offer.status !== 'pending') return NextResponse.json({ error: 'Offer is no longer available' }, { status: 400 })

    // Only the offerer can cancel; anyone else can decline
    const newStatus = offer.offererId === authUser.id ? 'cancelled' : 'declined'

    await db.tradeOffer.update({
      where: { id },
      data: { status: newStatus, resolvedAt: new Date() },
    })

    return NextResponse.json({ success: true, message: `Offer ${newStatus}` })
  } catch (error) {
    console.error('Trade offer decline error:', error)
    return NextResponse.json({ error: 'Failed to resolve offer' }, { status: 500 })
  }
}
