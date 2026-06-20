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

    // Atomic transaction: re-check status + verify ownership + swap + mark accepted
    await db.$transaction(async (tx) => {
      // Re-check offer status inside transaction (prevents race condition)
      const freshOffer = await tx.tradeOffer.findUnique({ where: { id } })
      if (!freshOffer || freshOffer.status !== 'pending') {
        throw new Error('Offer no longer available')
      }

      // ── Verify both parties still own their tazos (typed queries) ──
      const [offeredUT, acceptorUT] = await Promise.all([
        tx.userTazo.findUnique({ where: { id: freshOffer.offeredUserTazoId } }),
        tx.userTazo.findUnique({
          where: { userId_tazoId: { userId: authUser.id, tazoId: freshOffer.requestedTazoId } },
        }),
      ])

      if (!offeredUT || offeredUT.userId !== freshOffer.offererId) {
        throw new Error('OFFERER_NO_LONGER_OWNS')
      }
      if (!acceptorUT) {
        throw new Error('NOT_HAVE_REQUESTED')
      }

      const offeredTazoId = offeredUT.tazoId
      const acceptorTazoId = acceptorUT.tazoId

      // ── Transfer offered tazo to acceptor (merge if acceptor already owns) ──
      const acceptorExisting = await tx.userTazo.findUnique({
        where: { userId_tazoId: { userId: authUser.id, tazoId: offeredTazoId } },
      })

      if (acceptorExisting) {
        // Acceptor already has copies — merge: increment quantity, delete source
        await tx.userTazo.update({
          where: { id: acceptorExisting.id },
          data: { quantity: { increment: offeredUT.quantity } },
        })
        await tx.userTazo.delete({ where: { id: offeredUT.id } })
      } else {
        // Transfer ownership by updating userId
        await tx.userTazo.update({
          where: { id: offeredUT.id },
          data: { userId: authUser.id },
        })
      }

      // ── Transfer acceptor's tazo to offerer (merge if offerer already owns) ──
      const offererExisting = await tx.userTazo.findUnique({
        where: { userId_tazoId: { userId: freshOffer.offererId, tazoId: acceptorTazoId } },
      })

      if (offererExisting) {
        // Offerer already has copies — merge: increment quantity, delete source
        await tx.userTazo.update({
          where: { id: offererExisting.id },
          data: { quantity: { increment: acceptorUT.quantity } },
        })
        await tx.userTazo.delete({ where: { id: acceptorUT.id } })
      } else {
        // Transfer ownership by updating userId
        await tx.userTazo.update({
          where: { id: acceptorUT.id },
          data: { userId: freshOffer.offererId },
        })
      }

      // Mark offer as accepted
      await tx.tradeOffer.update({
        where: { id },
        data: {
          status: 'accepted',
          acceptorId: authUser.id,
          acceptedUserTazoId: acceptorUT.id,
          resolvedAt: new Date(),
        },
      })
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
    const msg = error instanceof Error ? error.message : ''
    if (msg === 'NOT_HAVE_REQUESTED') {
      return NextResponse.json({ error: "You don't have the requested tazo" }, { status: 400 })
    }
    if (msg === 'OFFERER_NO_LONGER_OWNS') {
      return NextResponse.json({ error: 'The offered tazo is no longer available' }, { status: 410 })
    }
    if (msg === 'ACCEPTOR_NO_LONGER_OWNS') {
      return NextResponse.json({ error: 'Your tazo is no longer available' }, { status: 410 })
    }
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

    // Atomic transaction: re-check status to prevent race with accept
    let newStatus = ''
    await db.$transaction(async (tx) => {
      const fresh = await tx.tradeOffer.findUnique({ where: { id } })
      if (!fresh || fresh.status !== 'pending') {
        throw new Error('Offer no longer available')
      }

      // Only the offerer can cancel; anyone else can decline
      newStatus = fresh.offererId === authUser.id ? 'cancelled' : 'declined'

      await tx.tradeOffer.update({
        where: { id },
        data: { status: newStatus, resolvedAt: new Date() },
      })
    })

    return NextResponse.json({ success: true, message: `Offer ${newStatus}` })
  } catch (error) {
    console.error('Trade offer decline error:', error)
    return NextResponse.json({ error: 'Failed to resolve offer' }, { status: 500 })
  }
}
