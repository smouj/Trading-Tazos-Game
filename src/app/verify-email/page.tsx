import { pageMetadata } from '@/lib/metadata'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Verify Email — Confirm Your Account',
    description: 'Verify your email address for Trading Tazos Game to secure your account and unlock all features.',
    path: '/verify-email',
  }),
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-[#FFF9E6] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-zinc-200 p-8 text-center">
        <img
          src="/logo/logo-icon-black.webp"
          alt="Trading Tazos"
          className="w-16 h-16 mx-auto mb-4"
        />
        <h1 className="text-2xl font-black text-[#1a1a1a] tracking-tight mb-2">
          Verify Your Email
        </h1>
        <p className="text-sm text-zinc-500 mb-6">
          We sent a verification link to your email. Click the link to verify your account.
        </p>
        <p className="text-xs text-zinc-400">
          Didn&apos;t receive it? Check your spam folder or{' '}
          <a href="/login" className="text-[#FF004D] font-bold hover:underline">sign in</a> to request a new one.
        </p>
      </div>
    </main>
  )
}
