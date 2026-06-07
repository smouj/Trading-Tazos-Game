import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Forgot Password — Reset Your Account',
    description: 'Forgot your Trading Tazos Game password? Enter your email and we will send you a reset link to get back into the arena.',
    path: '/forgot-password',
  }),
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
