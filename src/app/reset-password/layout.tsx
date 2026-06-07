import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Reset Password — Set a New Password',
    description: 'Set a new password for your Trading Tazos Game account and get back to collecting and battling.',
    path: '/reset-password',
  }),
}

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
