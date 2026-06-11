import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { hashPassword } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 })
    }

    if (typeof password !== 'string' || password.length < 10) {
      return NextResponse.json({ error: 'Password must be at least 10 characters' }, { status: 400 })
    }

    // Find user with valid, non-expired reset token
    const user = await db.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token. Please request a new one.' },
        { status: 400 }
      )
    }

    // Update password and clear reset token
    const passwordHash = hashPassword(password)

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in.',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
