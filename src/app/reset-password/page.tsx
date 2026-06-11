'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault()
        const form = e.currentTarget
        const password = (form.elements.namedItem('password') as HTMLInputElement).value
        const confirm = (form.elements.namedItem('confirm') as HTMLInputElement).value
        const msg = document.getElementById('reset-msg')

        if (password !== confirm) {
          if (msg) {
            msg.textContent = 'Passwords do not match'
            msg.className = 'text-sm text-red-500 text-center mt-3'
          }
          return
        }

        if (password.length < 10) {
          if (msg) {
            msg.textContent = 'Password must be at least 10 characters'
            msg.className = 'text-sm text-red-500 text-center mt-3'
          }
          return
        }

        try {
          const res = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, password }),
          })
          const data = await res.json()

          if (msg) {
            if (res.ok) {
              msg.textContent = data.message + ' Redirecting to sign in...'
              msg.className = 'text-sm text-green-600 text-center mt-3'
              setTimeout(() => { window.location.href = '/login' }, 2000)
            } else {
              msg.textContent = data.error || 'Failed to reset password'
              msg.className = 'text-sm text-red-500 text-center mt-3'
            }
          }
        } catch {
          if (msg) {
            msg.textContent = 'Something went wrong. Please try again.'
            msg.className = 'text-sm text-red-500 text-center mt-3'
          }
        }
      }}
    >
      {!token && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          ⚠️ No reset token provided. Please use the link from your email.
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-bold text-[#1a1a1a] mb-1.5">
          New Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          minLength={10}
          autoComplete="new-password"
          placeholder="••••••••"
          className="w-full px-4 py-3 border-2 border-zinc-300 rounded-xl text-sm font-medium
                     focus:outline-none focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00]/20
                     transition-all"
        />
      </div>

      <div>
        <label htmlFor="confirm" className="block text-sm font-bold text-[#1a1a1a] mb-1.5">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirm"
          name="confirm"
          required
          minLength={10}
          autoComplete="new-password"
          placeholder="••••••••"
          className="w-full px-4 py-3 border-2 border-zinc-300 rounded-xl text-sm font-medium
                     focus:outline-none focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00]/20
                     transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={!token}
        className="w-full py-3 px-6 bg-[#FF004D] text-white font-black text-sm uppercase tracking-wider
                   rounded-xl border-2 border-[#FF004D]
                   shadow-[inset_2px_2px_0_#ffffff40,inset_-2px_-2px_0_#0003,4px_4px_0_#00000080]
                   hover:translate-x-[-2px] hover:translate-y-[-2px]
                   hover:shadow-[inset_2px_2px_0_#ffffff40,inset_-2px_-2px_0_#0003,6px_6px_0_#00000080]
                   active:translate-x-[1px] active:translate-y-[1px]
                   active:shadow-[inset_2px_2px_0_#0003,inset_-2px_-2px_0_#ffffff20,2px_2px_0_#00000080]
                   transition-all duration-100
                   disabled:opacity-50 disabled:cursor-not-allowed
                   disabled:hover:translate-x-0 disabled:hover:translate-y-0
                   disabled:hover:shadow-[inset_2px_2px_0_#ffffff40,inset_-2px_-2px_0_#0003,4px_4px_0_#00000080]"
      >
        Reset Password
      </button>

      <p id="reset-msg" className="text-sm text-center mt-3"></p>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[#FFF9E6] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-zinc-200 p-8">
        <div className="text-center mb-6">
          <img
            src="/logo/logo-icon-black.webp"
            alt="Trading Tazos"
            className="w-16 h-16 mx-auto mb-3"
          />
          <h1 className="text-2xl font-black text-[#1a1a1a] tracking-tight">
            Reset Password
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Choose a new password for your account
          </p>
        </div>

        <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#FFCC00] border-t-transparent rounded-full animate-spin" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  )
}
