import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Verify Email — Confirm Your Account',
    description: 'Verify your email address for Trading Tazos Game to secure your account and unlock all features.',
    path: '/verify-email',
  }),
}

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
