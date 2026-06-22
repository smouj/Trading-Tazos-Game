import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, hashPassword, verifyPassword } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password required' }, { status: 400 })
    }

    if (newPassword.length < 10) {
      return NextResponse.json({ error: 'Password must be at least 10 characters' }, { status: 400 })
    }

    // ── Atomic: find user + verify + update in single transaction ──
    // Prevents race where a concurrent password change (or OAuth link)
    // between the findUnique and the update could leave stale data.
    const result = await db.$transaction(async (tx) => {
      const fullUser = await tx.user.findUnique({
        where: { id: user.id },
        select: { passwordHash: true, oauthProvider: true },
      })

      if (!fullUser) {
        throw new Error('User not found')
      }

      if (fullUser.oauthProvider && !fullUser.passwordHash) {
        throw new Error('OAuth users cannot change password here')
      }

      // Verify current password
      const isValid = await verifyPassword(currentPassword, fullUser.passwordHash)
      if (!isValid) {
        throw new Error('Current password is incorrect')
      }

      // Hash and update — hashPassword is sync (scrypt), safe inside transaction
      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash: hashPassword(newPassword) },
      })

      return true
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to change password'
    if (['User not found', 'OAuth users cannot change password here', 'Current password is incorrect'].includes(message)) {
      return NextResponse.json({ error: message }, { status: 400 })
    }
    console.error('Password change error:', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}
