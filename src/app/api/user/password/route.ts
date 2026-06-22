import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, hashPassword, verifyPassword } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check if user has a password (non-OAuth)
    const fullUser = await db.user.findUnique({ where: { id: user.id }, select: { passwordHash: true, oauthProvider: true } })
    if (!fullUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (fullUser.oauthProvider && !fullUser.passwordHash) {
      return NextResponse.json({ error: 'OAuth users cannot change password here' }, { status: 400 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password required' }, { status: 400 })
    }

    if (newPassword.length < 10) {
      return NextResponse.json({ error: 'Password must be at least 10 characters' }, { status: 400 })
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, fullUser.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    // Hash and update
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(newPassword) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}
