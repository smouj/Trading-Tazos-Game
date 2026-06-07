import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

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

    // In production, send email here. For now, return token when no email service is configured.
    const hasEmailService = !!process.env.RESEND_API_KEY

    if (hasEmailService) {
      // TODO: Send reset email via Resend/SendGrid/etc.
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
      ...(hasEmailService ? {} : { resetToken }),
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
