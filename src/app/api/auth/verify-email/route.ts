import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 })
    }

    // Atomic: find + update in one transaction prevents token reuse
    const updated = await db.$transaction(async (tx) => {
      const user = await tx.user.findFirst({
        where: {
          emailVerifyToken: token,
          emailVerifyExpires: { gt: new Date() },
        },
      })

      if (!user) return null

      return tx.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerifyToken: null,
          emailVerifyExpires: null,
        },
      })
    })

    if (!updated) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token. Please request a new verification email.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully.',
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 })
  }
}
