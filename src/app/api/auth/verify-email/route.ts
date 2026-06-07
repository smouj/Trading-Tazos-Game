import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 })
    }

    // Find user with valid, non-expired verification token
    const user = await db.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpires: { gt: new Date() },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token. Please request a new verification email.' },
        { status: 400 }
      )
    }

    // Mark email as verified and clear token
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully.',
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 })
  }
}
