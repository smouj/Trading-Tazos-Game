'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type VerifyState = 'missing' | 'loading' | 'success' | 'error'

export function VerifyEmailClient() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [state, setState] = useState<VerifyState>(token ? 'loading' : 'missing')
  const [message, setMessage] = useState('Verifying your email address...')

  useEffect(() => {
    if (!token) return

    let cancelled = false

    async function verify() {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const data = await res.json()
        if (cancelled) return
        setState(res.ok ? 'success' : 'error')
        setMessage(data.message || data.error || 'Email verification failed.')
      } catch {
        if (cancelled) return
        setState('error')
        setMessage('Email verification failed. Please try again from the latest email.')
      }
    }

    verify()

    return () => {
      cancelled = true
    }
  }, [token])

  const tone = {
    missing: 'text-amber-700',
    loading: 'text-zinc-500',
    success: 'text-green-700',
    error: 'text-red-600',
  }[state]

  return (
    <>
      <p className={`text-sm mb-6 ${tone}`}>
        {state === 'missing' ? 'No verification token was provided. Please use the link from your email.' : message}
      </p>
      <a href={state === 'success' ? '/app' : '/login'} className="inline-flex items-center justify-center px-5 py-3 text-xs font-black uppercase bg-[#FFCC00] text-[#1a1a1a] border-2 border-[#1a1a1a] hover:bg-[#FFE566] transition-colors">
        {state === 'success' ? 'Open TTG' : 'Go to Login'}
      </a>
    </>
  )
}
