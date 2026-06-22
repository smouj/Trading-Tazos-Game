import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Try UUID first, then fall back to number-based lookup
    let tazo = await db.tazo.findUnique({
      where: { id },
      include: {
        franchise: true,
        collection: true,
      },
    })

    if (!tazo) {
      // Try by number (allows /api/tazos/1 instead of /api/tazos/<uuid>)
      tazo = await db.tazo.findFirst({
        where: { number: id },
        include: {
          franchise: true,
          collection: true,
        },
      })
    }

    if (!tazo) {
      return NextResponse.json({ error: 'Tazo not found' }, { status: 404 })
    }

    // Flatten franchise & collection to strings
    const flatTazo = {
      ...tazo,
      franchise: tazo.franchise?.slug || null,
      franchiseName: tazo.franchise?.name || null,
      franchiseColor: tazo.franchise?.color || null,
      franchiseSlug: tazo.franchise?.slug || null,
      collection: tazo.collection?.slug || null,
      collectionName: tazo.collection?.name || null,
      collectionSlug: tazo.collection?.slug || null,
      collectionYear: tazo.collection?.year || null,
    }

    return NextResponse.json({ tazo: flatTazo })
  } catch (error) {
    console.error('Error fetching tazo:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tazo' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // ── Atomic: find + update in single transaction ──
    // Prevents race where two concurrent PUT requests (e.g. from admin
    // and scanner) update the same tazo based on a stale read.
    const tazo = await db.$transaction(async (tx) => {
      let existing = await tx.tazo.findUnique({ where: { id } })
      if (!existing) {
        existing = await tx.tazo.findFirst({ where: { number: id } })
      }
      if (!existing) {
        throw new Error('NOT_FOUND')
      }

      return tx.tazo.update({
        where: { id: existing.id },
        data: {
          ...(body.name !== undefined && { name: body.name }),
          ...(body.slug !== undefined && { slug: body.slug }),
          ...(body.franchiseId !== undefined && { franchiseId: body.franchiseId }),
          ...(body.collectionId !== undefined && { collectionId: body.collectionId }),
          ...(body.number !== undefined && { number: body.number }),
          ...(body.condition !== undefined && { condition: body.condition }),
          ...(body.physicalType !== undefined && { physicalType: body.physicalType }),
          ...(body.combatType !== undefined && { combatType: body.combatType }),
          ...(body.rarity !== undefined && { rarity: body.rarity }),
          ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
          ...(body.skill !== undefined && { skill: body.skill }),
          ...(body.skillDesc !== undefined && { skillDesc: body.skillDesc }),
          ...(body.evolutionFrom !== undefined && { evolutionFrom: body.evolutionFrom }),
          ...(body.evolutionTo !== undefined && { evolutionTo: body.evolutionTo }),
          ...(body.transformStage !== undefined && { transformStage: body.transformStage }),
          ...(body.transformOf !== undefined && { transformOf: body.transformOf }),
          ...(body.attack !== undefined && { attack: body.attack }),
          ...(body.defense !== undefined && { defense: body.defense }),
          ...(body.spin !== undefined && { spin: body.spin }),
          ...(body.weight !== undefined && { weight: body.weight }),
          ...(body.resistance !== undefined && { resistance: body.resistance }),
          ...(body.stability !== undefined && { stability: body.stability }),
          ...(body.bounce !== undefined && { bounce: body.bounce }),
          ...(body.precision !== undefined && { precision: body.precision }),
          ...(body.role !== undefined && { role: body.role }),
          ...(body.control !== undefined && { control: body.control }),
          ...(body.isOwned !== undefined && { isOwned: body.isOwned }),
          ...(body.battleWins !== undefined && { battleWins: body.battleWins }),
          ...(body.battleLosses !== undefined && { battleLosses: body.battleLosses }),
        },
        include: {
          franchise: true,
          collection: true,
        },
      })
    })

    // Flatten franchise & collection to strings
    const flatTazo = {
      ...tazo,
      franchise: tazo.franchise?.slug || null,
      franchiseName: tazo.franchise?.name || null,
      franchiseColor: tazo.franchise?.color || null,
      franchiseSlug: tazo.franchise?.slug || null,
      collection: tazo.collection?.slug || null,
      collectionName: tazo.collection?.name || null,
      collectionSlug: tazo.collection?.slug || null,
      collectionYear: tazo.collection?.year || null,
    }

    return NextResponse.json({ tazo: flatTazo })
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Tazo not found' }, { status: 404 })
    }
    console.error('Error updating tazo:', error)
    return NextResponse.json(
      { error: 'Failed to update tazo' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // ── Atomic: find + delete in single transaction ──
    // Prevents race where tazo is deleted by another request between
    // the findUnique and the delete, which would return 200 on a non-existent record.
    await db.$transaction(async (tx) => {
      let existing = await tx.tazo.findUnique({ where: { id } })
      if (!existing) {
        existing = await tx.tazo.findFirst({ where: { number: id } })
      }
      if (!existing) {
        throw new Error('NOT_FOUND')
      }

      await tx.tazo.delete({ where: { id: existing.id } })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Tazo not found' }, { status: 404 })
    }
    console.error('Error deleting tazo:', error)
    return NextResponse.json(
      { error: 'Failed to delete tazo' },
      { status: 500 }
    )
  }
}
