// ============================================================
// Trading Tazos Game — WebGL Detector
// Checks WebGL availability before attempting 3D rendering.
// Prevents the 12-error cascade from THREE.WebGLRenderer when
// WebGL is unavailable (headless browsers, old GPUs, etc.).
// ============================================================

let cached: boolean | null = null

/**
 * Returns true if WebGL2 or WebGL1 is available.
 * Result is cached after first call — WebGL availability
 * does not change during a page session.
 */
export function canUseWebGL(): boolean {
  if (cached !== null) return cached

  try {
    const canvas = document.createElement("canvas")
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null)

    cached = Boolean(gl)
    return cached
  } catch {
    cached = false
    return false
  }
}

/**
 * Resets the cached WebGL check (useful in tests or SSR).
 */
export function resetWebGLCache(): void {
  cached = null
}
