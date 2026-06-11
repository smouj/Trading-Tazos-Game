import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { buildPasswordResetUrl, isTransactionalEmailConfigured, sendTransactionalEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Always return success to prevent email enumeration
    const user = await db.user.findUnique({ where: { email: normalizedEmail } })

    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.',
      })
    }

    // Generate secure reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpires = new Date(Date.now() + 3600000) // 1 hour

    await db.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpires },
    })

    const resetUrl = buildPasswordResetUrl(resetToken)
    const hasEmailService = isTransactionalEmailConfigured()

    if (hasEmailService) {
      await sendTransactionalEmail({
        template: 'passwordReset',
        to: user.email,
        variables: {
          name: user.displayName || user.name,
          resetUrl,
          expiresIn: '1 hour',
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
      ...(process.env.NODE_ENV !== 'production' && !hasEmailService ? { resetToken, resetUrl } : {}),
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
