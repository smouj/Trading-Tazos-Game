// ============================================================
// Trading Tazos Game — WebGL Guard Wrapper
// Checks WebGL availability before rendering children.
// Falls back to WebGLFallback UI when WebGL isn't available.
// ============================================================
"use client"

import { useState, useEffect } from "react"
import { canUseWebGL } from "@/lib/browser/webgl-detector"
import WebGLFallback from "@/components/game/webgl-fallback"

interface WebGLGuardProps {
  children: React.ReactNode
  /** If true, renders fallback as full-page takeover */
  fullPage?: boolean
  /** Custom fallback when WebGL is not available (replaces default WebGLFallback) */
  fallback?: React.ReactNode
}

export default function WebGLGuard({ children, fullPage = false, fallback }: WebGLGuardProps) {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null)

  useEffect(() => {
    setHasWebGL(canUseWebGL())
  }, [])

  // Still checking — show nothing (avoids flash)
  if (hasWebGL === null) {
    return null
  }

  if (!hasWebGL) {
    if (fallback) {
      return <>{fallback}</>
    }
    return <WebGLFallback fullPage={fullPage} onRetry={() => setHasWebGL(canUseWebGL())} />
  }

  return <>{children}</>
}
