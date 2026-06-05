"use client"

// Scanner view — served at /app/scanner
// MagazinePageShell provided by /app/layout.tsx
// ADMIN-ONLY: Redirects non-admin users to /app/album

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ScannerView } from "@/components/game/scanner-view"
import { Loader2, Shield } from "lucide-react"

export default function ScannerPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user?.email !== "dev.viewer@medaclawarena.com") {
      router.replace("/app/album")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFCC00]" />
      </div>
    )
  }

  if (user?.email !== "dev.viewer@medaclawarena.com") {
    return null
  }
  return (
    <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6">
      <ScannerView />
    </div>
  )
}
